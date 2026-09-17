'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/store/use-language';
import { buildWhatsAppUrl, buildGeneralWhatsAppMessage } from '@/lib/contact';
import { MessageCircle, Phone } from 'lucide-react';

export function ContactWhatsApp() {
  const { t, lang } = useLanguage();
  const waUrl = buildWhatsAppUrl(buildGeneralWhatsAppMessage(lang));

  return (
    <section className="py-16 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
          <MessageCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">
          {t('联系招生顾问', 'Contact Admissions Advisor')}
        </h1>
        <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
          {t(
            '通过 WhatsApp 直接与招生团队沟通，了解课程、学费、奖学金与报名流程',
            'Chat with our admissions team on WhatsApp about programmes, fees, scholarships and applications',
          )}
        </p>
        <Button
          size="lg"
          className="mt-8 bg-[#25D366] hover:bg-[#1fb855] text-white font-bold px-8"
          asChild
        >
          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-5 w-5" />
            {t('WhatsApp 联系顾问', 'Chat on WhatsApp')}
          </a>
        </Button>
        <p className="mt-6 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <Phone className="h-3.5 w-3.5" />
          {t('一般会在工作时间内尽快回复', 'We usually reply during office hours')}
        </p>
      </motion.div>
    </section>
  );
}
