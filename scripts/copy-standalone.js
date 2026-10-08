/**
 * Copy static assets into the standalone output after `next build`.
 * Cross-platform replacement for `cp -r` (fails on Windows PowerShell).
 */
const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`skip missing: ${src}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log(`copied ${src} -> ${dest}`);
}

const root = path.join(__dirname, '..');
const standalone = path.join(root, '.next', 'standalone');

if (!fs.existsSync(path.join(standalone, 'server.js'))) {
  console.error('Missing .next/standalone/server.js — is output: "standalone" set in next.config?');
  process.exit(1);
}

copyDir(path.join(root, '.next', 'static'), path.join(standalone, '.next', 'static'));
copyDir(path.join(root, 'public'), path.join(standalone, 'public'));

// SQLite path in .env is file:../db/custom.db (relative to prisma/)
// For standalone, also keep a copy next to the service if db exists.
const dbSrc = path.join(root, 'db');
if (fs.existsSync(dbSrc)) {
  copyDir(dbSrc, path.join(standalone, 'db'));
}
