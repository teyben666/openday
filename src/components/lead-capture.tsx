'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/store/use-language';
import type { DiscoveryResult } from '@/lib/course-matching';
import { toast } from 'sonner';
import { Loader2, Bookmark } from 'lucide-react';
import { isValidPhone, phoneValidationMessage, sanitizePhoneInput } from '@/lib/phone';

interface LeadCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: DiscoveryResult;
}

export function LeadCapture({ open, onOpenChange, result }: LeadCaptureProps) {
  const { t, lang } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim() || !email.trim()) {
      toast.error(t('请填写姓名和邮箱', 'Please enter name and email'));
      return;
    }
    if (phone && !isValidPhone(phone)) {
      toast.error(phoneValidationMessage(lang));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone ? sanitizePhoneInput(phone) : undefined,
          message: t('保存 Course Discovery 测验结果', 'Save Course Discovery results'),
          quizResult: JSON.stringify({
            final: result.final,
            mainDirection: result.mainDirection,
            recommendations: result.recommendations.slice(0, 3).map((r) => r.course.id),
          }),
        }),
      });
      if (!res.ok) throw new Error('failed');
      toast.success(t('结果已保存！我们将与您联系。', 'Results saved! We will be in touch.'));
      onOpenChange(false);
    } catch {
      toast.error(t('保存失败，请稍后重试', 'Save failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-emerald-600" />
            {t('保存我的探索结果', 'Save My Discovery Results')}
          </DialogTitle>
          <DialogDescription>
            {t(
              '输入联系方式，方便招生顾问跟进 — 您已先获得完整测验结果',
              'Enter your details so our advisor can follow up — you already have your full results',
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>{t('姓名', 'Name')} *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label>{t('邮箱', 'Email')} *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label>{t('电话', 'Phone')}</Label>
            <Input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={phone}
              onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
              disabled={loading}
              placeholder={t('例如 0123456789', 'e.g. 0123456789')}
            />
          </div>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {t('保存结果', 'Save Results')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
