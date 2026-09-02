'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/store/use-language';
import { courses } from '@/data/courses';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Send, Loader2, ArrowRight, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

interface InquiryFormProps {
  preSelectedProgramme?: string;
}

export function InquiryForm({ preSelectedProgramme }: InquiryFormProps) {
  const { lang, t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [programme, setProgramme] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preSelectedProgramme) {
      setProgramme(preSelectedProgramme);
    }
  }, [preSelectedProgramme]);

  function validateEmail(emailVal: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t('请输入姓名', 'Name is required');
    }

    if (!email.trim()) {
      newErrors.email = t('请输入邮箱', 'Email is required');
    } else if (!validateEmail(email)) {
      newErrors.email = t('请输入有效的邮箱地址', 'Please enter a valid email address');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          programme: programme || undefined,
          message: message.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(t('提交失败，请稍后重试', 'Submission failed. Please try again.'));
      }

      toast.success(
        t(
          '提交成功！我们将尽快与您联系。',
          'Submitted successfully! We will contact you soon.'
        )
      );

      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setProgramme('');
      setMessage('');
      setErrors({});
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t('发生错误，请稍后重试', 'An error occurred. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="inquiry-section" className="py-16 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('想了解更多？联系我们！', 'Want to know more? Contact us!')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {t(
              '我们的招生团队将在24小时内回复您',
              'Our admissions team will respond within 24 hours'
            )}
          </p>
        </div>

        <Card className="border-emerald-200 dark:border-emerald-900 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-emerald-600" />
              {t('在线咨询', 'Online Inquiry')}
            </CardTitle>
            <CardDescription>
              {t(
                '填写以下表格，我们的招生团队将尽快与您取得联系',
                'Fill in the form below and our admissions team will reach out to you shortly'
              )}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="inquiry-name">
                  {t('姓名', 'Name')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="inquiry-name"
                  placeholder={t('请输入您的姓名', 'Enter your name')}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  className={errors.name ? 'border-destructive' : ''}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="inquiry-email">
                  {t('邮箱', 'Email')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="inquiry-email"
                  type="email"
                  placeholder={t('请输入您的邮箱', 'Enter your email')}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  className={errors.email ? 'border-destructive' : ''}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="inquiry-phone">
                  {t('电话', 'Phone')}{' '}
                  <span className="text-muted-foreground text-xs">
                    ({t('选填', 'optional')})
                  </span>
                </Label>
                <Input
                  id="inquiry-phone"
                  type="tel"
                  placeholder={t('请输入您的电话号码', 'Enter your phone number')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Programme of interest */}
              <div className="space-y-2">
                <Label htmlFor="inquiry-programme">
                  {t('感兴趣的课程', 'Programme of Interest')}{' '}
                  <span className="text-muted-foreground text-xs">
                    ({t('选填', 'optional')})
                  </span>
                </Label>
                <Select
                  value={programme}
                  onValueChange={setProgramme}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="inquiry-programme" className="w-full">
                    <SelectValue
                      placeholder={t(
                        '选择课程项目...',
                        'Select a programme...'
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {lang === 'zh'
                          ? `${course.name.zh} (${course.code})`
                          : `${course.name.en} (${course.code})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="inquiry-message">
                  {t('留言', 'Message')}{' '}
                  <span className="text-muted-foreground text-xs">
                    ({t('选填', 'optional')})
                  </span>
                </Label>
                <Textarea
                  id="inquiry-message"
                  placeholder={t(
                    '请输入您想了解的内容...',
                    'Enter your message...'
                  )}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('提交中...', 'Submitting...')}
                  </>
                ) : (
                  <>
                    {t('提交咨询', 'Submit Inquiry')}
                    <Send className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
