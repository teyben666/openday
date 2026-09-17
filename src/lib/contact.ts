const DEFAULT_WHATSAPP = '60123456789';

export function getWhatsAppNumber(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP;
}

export function buildWhatsAppUrl(message: string): string {
  const number = getWhatsAppNumber().replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildDiscoveryWhatsAppMessage(
  lang: 'zh' | 'en',
  courseName?: string,
  mainDirection?: string,
): string {
  if (lang === 'zh') {
    let msg = '你好，我完成了 Course Discovery 测验';
    if (mainDirection) msg += `，主要方向是 ${mainDirection}`;
    if (courseName) msg += `，想进一步了解 ${courseName}`;
    msg += '。请问可以安排咨询吗？';
    return msg;
  }
  let msg = 'Hi, I completed the Course Discovery Test';
  if (mainDirection) msg += ` and my main direction is ${mainDirection}`;
  if (courseName) msg += `. I\'d like to know more about ${courseName}`;
  msg += '. Could I arrange a consultation?';
  return msg;
}

export function buildApplyWhatsAppMessage(lang: 'zh' | 'en', courseName: string): string {
  if (lang === 'zh') {
    return `你好，我想申请 ${courseName}，请问报名流程是怎样的？`;
  }
  return `Hi, I would like to apply for ${courseName}. Could you guide me through the application process?`;
}

export function buildEntryHelpWhatsAppMessage(
  lang: 'zh' | 'en',
  courseName: string,
  detail?: string,
): string {
  if (lang === 'zh') {
    let msg = `你好，我想申请 ${courseName}，但线上系统显示成绩未达入学门槛`;
    if (detail) msg += `（${detail}）`;
    msg += '。想请招生顾问协助确认是否还有其他升学方案。';
    return msg;
  }
  let msg = `Hi, I would like to apply for ${courseName}, but the online form says my results do not meet the entry requirements`;
  if (detail) msg += ` (${detail})`;
  msg += '. Could an admissions advisor help me check other options?';
  return msg;
}

export function buildGeneralWhatsAppMessage(lang: 'zh' | 'en'): string {
  if (lang === 'zh') {
    return '你好，我想咨询新纪元大学学院的课程与升学事宜，请问可以帮忙吗？';
  }
  return 'Hi, I would like to inquire about NEUC programmes and admissions. Could you assist me?';
}

export function buildBrowseCoursesWhatsAppMessage(lang: 'zh' | 'en'): string {
  if (lang === 'zh') {
    return '你好，我正在浏览课程，想一对一了解适合我的升学方案，请问可以帮忙吗？';
  }
  return 'Hi, I am browsing programmes and would like a one-to-one chat about the best options for me. Could you help?';
}

export const ADVISOR_PROMPT_SESSION_KEY = 'neuc-advisor-prompt-shown';
export const ADVISOR_PROMPT_DISMISS_KEY = 'neuc-advisor-prompt-dismissed-at';
export const ADVISOR_BUBBLE_POS_KEY = 'neuc-advisor-bubble-pos';
export const ADVISOR_PROMPT_DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function shouldShowAdvisorPrompt(): boolean {
  if (typeof window === 'undefined') return false;
  if (sessionStorage.getItem(ADVISOR_PROMPT_SESSION_KEY)) return false;
  const dismissedAt = localStorage.getItem(ADVISOR_PROMPT_DISMISS_KEY);
  if (dismissedAt && Date.now() - Number(dismissedAt) < ADVISOR_PROMPT_DISMISS_COOLDOWN_MS) {
    return false;
  }
  return true;
}

export function markAdvisorPromptShown(): void {
  sessionStorage.setItem(ADVISOR_PROMPT_SESSION_KEY, '1');
}

export function markAdvisorPromptDismissed(): void {
  markAdvisorPromptShown();
  localStorage.setItem(ADVISOR_PROMPT_DISMISS_KEY, String(Date.now()));
}
