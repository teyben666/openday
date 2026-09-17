'use client';

import Link from 'next/link';
import { useLanguage } from '@/store/use-language';
import { Separator } from '@/components/ui/separator';
import { buildWhatsAppUrl, buildGeneralWhatsAppMessage } from '@/lib/contact';
import { GraduationCap, Mail, Phone, MapPin, Globe, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

const quickLinks = [
  { label: { zh: '首页', en: 'Home' }, href: '/' },
  { label: { zh: '课程探索', en: 'Discovery' }, href: '/discovery' },
  { label: { zh: '课程目录', en: 'Courses' }, href: '/courses' },
  { label: { zh: '线上报名', en: 'Apply' }, href: '/apply' },
  { label: { zh: 'WhatsApp 咨询', en: 'WhatsApp' }, href: 'whatsapp' },
] as const;

export function Footer() {
  const { lang, t } = useLanguage();
  const waUrl = buildWhatsAppUrl(buildGeneralWhatsAppMessage(lang));

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-6 w-6 text-emerald-400" />
              <span className="font-bold text-lg text-white">
                {t('新纪元大学学院', 'New Era University College')}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t(
                '新纪元大学学院致力于培养具有全球视野和创新精神的人才，提供多元化的高等教育课程。',
                'New Era University College is committed to nurturing talents with global vision and innovative spirit.',
              )}
            </p>
            <div className="flex gap-3 mt-5">
              {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                <button key={i} className="h-9 w-9 rounded-full bg-gray-800 hover:bg-emerald-600 flex items-center justify-center transition-colors" aria-label="Social">
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">{t('快速链接', 'Quick Links')}</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  {link.href === 'whatsapp' ? (
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                      {lang === 'zh' ? link.label.zh : link.label.en}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                      {lang === 'zh' ? link.label.zh : link.label.en}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">{t('课程项目', 'Programmes')}</h3>
            <ul className="space-y-2.5">
              <li><Link href="/courses" className="text-sm text-gray-400 hover:text-emerald-400">{t('全部课程', 'All Programmes')}</Link></li>
              <li><Link href="/courses#foundation" className="text-sm text-gray-400 hover:text-emerald-400">{t('基础课程', 'Foundation')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">{t('联系我们', 'Contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <a href="mailto:iie@newera.edu.my" className="text-sm text-gray-400 hover:text-emerald-400 break-all">iie@newera.edu.my</a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">03-8739 2777</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">43000 Kajang, Selangor</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Globe className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <a href="https://www.newera.edu.my" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-emerald-400">www.newera.edu.my</a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {t('新纪元大学学院', 'NEUC')}. {t('保留所有权利', 'All rights reserved')}.</p>
        </div>
      </div>
    </footer>
  );
}
