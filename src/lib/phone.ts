/** Keep digits only — no letters or symbols. */
export function sanitizePhoneInput(value: string): string {
  return value.replace(/\D/g, '');
}

/** Malaysian / international mobile: 8–15 digits. */
export function isValidPhone(digits: string): boolean {
  const cleaned = sanitizePhoneInput(digits);
  return /^\d{8,15}$/.test(cleaned);
}

export function phoneValidationMessage(lang: 'zh' | 'en'): string {
  return lang === 'zh'
    ? '请输入有效电话号码（仅数字，8–15 位）'
    : 'Please enter a valid phone number (digits only, 8–15 characters)';
}
