'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/store/use-language';
import { useDiscovery } from '@/store/use-discovery';
import { calculateDiscoveryResult } from '@/lib/course-matching';
import { toast } from 'sonner';
import { Loader2, Lock } from 'lucide-react';
import { isValidPhone, phoneValidationMessage, sanitizePhoneInput } from '@/lib/phone';

interface DiscoveryLeadGateProps {
  answers: number[];
  onUnlocked: () => void;
}

export function DiscoveryLeadGate({ answers, onUnlocked }: DiscoveryLeadGateProps) {
  const { t, lang } = useLanguage();
  const { unlockResult } = useDiscovery();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error(t('请填写姓名、邮箱和电话', 'Please enter name, email and phone'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t('请输入有效的邮箱', 'Please enter a valid email'));
      return;
    }
    if (!isValidPhone(phone)) {
      toast.error(phoneValidationMessage(lang));
      return;
    }

    setLoading(true);
    const result = calculateDiscoveryResult(answers);

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: sanitizePhoneInput(phone),
          message: t('Course Discovery 测验 — 查看结果', 'Course Discovery — view results'),
          quizResult: JSON.stringify({
            final: result.final,
            mainDirection: result.mainDirection,
            recommendations: result.recommendations.slice(0, 3).map((r) => r.course.id),
          }),
        }),
      });
      if (!res.ok) throw new Error('failed');

      unlockResult(result, answers, {
        name: name.trim(),
        email: email.trim(),
        phone: sanitizePhoneInput(phone),
      });

      onUnlocked();
      router.push('/discovery/result');
    } catch {
      toast.error(t('提交失败，请稍后重试', 'Submission failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full py-16 sm:py-24">
      <div className="mx-auto max-w-md px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-emerald-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <Lock className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle>{t('测验已完成！', 'Quiz Complete!')}</CardTitle>
              <CardDescription>
                {t(
                  '填写以下资料即可查看你的 Course Discovery 结果',
                  'Enter your details to view your Course Discovery results',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('姓名', 'Name')} *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} disabled={loading} required />
                </div>
                <div className="space-y-2">
                  <Label>{t('邮箱', 'Email')} *</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required />
                </div>
                <div className="space-y-2">
                  <Label>{t('电话', 'Phone')} *</Label>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={phone}
                    onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                    disabled={loading}
                    required
                    placeholder={t('例如 0123456789', 'e.g. 0123456789')}
                  />
                </div>
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {t('查看我的结果', 'View My Results')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
