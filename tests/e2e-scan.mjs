/**
 * Drives the real apply form in a browser: fill steps 1-3, upload a slip on
 * step 4, wait for the AI panel, apply grades, and screenshot the result.
 *
 * Requires the dev server (:3210) and an Ollama (or tests/mock-ollama.mjs).
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3210';
const SLIP = process.env.SLIP || '/tmp/slip.png';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1400 } });
page.on('console', (m) => {
  if (m.type() === 'error') console.log('[browser error]', m.text());
});

await page.goto(`${BASE}/apply`, { waitUntil: 'networkidle' });

// Scope to the form section so Next.js devtools buttons never match.
const form = page.locator('section').first();
const nextBtn = form.getByRole('button', { name: /下一步|Next/ });
const backBtn = form.getByRole('button', { name: /上一步|Back/ });

// --- Step 1: personal details -------------------------------------------
await page.locator('input:not([type="file"])').first().fill('Tan Wei Ming');
await page.locator('input[type="email"]').first().fill('weiming@example.com');
await page.locator('input[type="tel"]').first().fill('0123456789');
await nextBtn.click();

// --- Step 2: programme ---------------------------------------------------
await page.waitForTimeout(500);
await page.locator('button[role="combobox"]').first().click();
await page.waitForTimeout(300);
await page.locator('[role="option"]').first().click();
await nextBtn.click();

// --- Step 3: qualification + a deliberately WRONG grade ------------------
await page.waitForTimeout(500);
const combos = page.locator('button[role="combobox"]');
await combos.first().click();
await page.waitForTimeout(250);
await page.locator('[role="option"]', { hasText: 'SPM' }).first().click();
await page.waitForTimeout(250);

// Need 5 credits for a Bachelor programme, so add 2 extra rows.
for (let i = 0; i < 2; i++) {
  await form.getByRole('button', { name: /添加科目|Add subject/ }).click();
  await page.waitForTimeout(200);
}

// History is deliberately wrong (slip says C) to exercise mismatch detection.
// Labels render as "中文 / English" in zh mode, so match the Chinese side.
const picks = [
  { subject: /马来文/, grade: 'A' },
  { subject: /^数学/, grade: 'A+' },
  { subject: /历史/, grade: 'A' }, // mismatch vs slip (C)
  { subject: /英文/, grade: 'B+' },
  { subject: /物理/, grade: 'A+' },
];

const exact = (s) => new RegExp(`^${s.replace(/[+*]/g, '\\$&')}$`);

for (let i = 0; i < picks.length; i++) {
  const rowCombos = page.locator('table button[role="combobox"]');
  await rowCombos.nth(i * 2).click();
  await page.waitForTimeout(250);
  await page.locator('[role="option"]').filter({ hasText: picks[i].subject }).first().click();
  await page.waitForTimeout(250);
  await rowCombos.nth(i * 2 + 1).click();
  await page.waitForTimeout(250);
  await page.locator('[role="option"]').filter({ hasText: exact(picks[i].grade) }).first().click();
  await page.waitForTimeout(250);
}

await page.screenshot({ path: 'tests/shot-step3.png', fullPage: true });

// Report what the entry checker currently says, for debugging.
const step3Text = await page.locator('main, body').first().innerText();
console.log('--- step 3 state ---');
console.log(step3Text.split('\n').filter((l) => l.trim()).slice(0, 40).join('\n'));

await nextBtn.click();

// --- Step 4: upload + AI scan -------------------------------------------
await page.waitForTimeout(600);
await page.setInputFiles('input[type="file"]', SLIP);

// Wait for the panel's own results table, not the toast (which is transient).
await form.locator('table').first().waitFor({ timeout: 120000 });
await page.waitForTimeout(500);

await page.screenshot({ path: 'tests/shot-step4-scan.png', fullPage: true });

const mismatchVisible = await form
  .getByText(/Grades differ from your proof|成绩与证明不一致/)
  .first()
  .isVisible()
  .catch(() => false);
const rowsRead = await form.locator('table').first().locator('tbody tr').count();
console.log('subjects shown in panel:', rowsRead);
console.log('mismatch warning shown:', mismatchVisible);
if (!mismatchVisible) throw new Error('expected a mismatch warning (History A vs C)');

// Apply the AI reading into the grade table.
await form.getByRole('button', { name: /Fill my grades|填入成绩表格/ }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: 'tests/shot-step4-applied.png', fullPage: true });

// Back to step 3 to confirm the rows really changed.
await backBtn.click();
await page.waitForTimeout(700);
await page.screenshot({ path: 'tests/shot-step3-filled.png', fullPage: true });

await browser.close();
console.log('e2e OK');
