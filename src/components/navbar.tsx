'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/store/use-language';
import { useComparison } from '@/store/use-comparison';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Menu, Globe, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildWhatsAppUrl, buildGeneralWhatsAppMessage } from '@/lib/contact';

const BRAND_EN = 'New Era University College';
const BRAND_ZH = '新纪元大学学院';

const navLinks = [
  { label: { zh: '首页', en: 'Home' }, href: '/' },
  { label: { zh: '课程', en: 'Courses' }, href: '/courses' },
  { label: { zh: '课程探索', en: 'Discovery' }, href: '/discovery' },
  { label: { zh: 'Foundation', en: 'Foundation' }, href: '/courses#foundation' },
  { label: { zh: '咨询', en: 'Contact' }, href: '/contact', whatsapp: true },
] as const;

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      src="/neuc-logo-banner.png"
      alt={`${BRAND_EN} ${BRAND_ZH}`}
      width={280}
      height={72}
      className={cn(
        'object-contain object-left shrink-0',
        compact ? 'h-[4.5rem] w-auto max-w-[400px]' : 'h-20 w-auto max-w-[440px] md:h-[5.5rem] md:max-w-[520px]',
      )}
      priority
    />
  );
}

export function Navbar() {
  const { lang, toggleLang } = useLanguage();
  const { selectedIds } = useComparison();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = pathname === '/';
  const solid = scrolled || !isHome;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const compareCount = selectedIds.length;
  const waUrl = buildWhatsAppUrl(buildGeneralWhatsAppMessage(lang));

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-24 transition-all duration-300 border-b',
        solid
          ? 'border-white/25 bg-white/10 shadow-none backdrop-blur-xl supports-[backdrop-filter]:bg-white/10'
          : 'border-transparent bg-transparent',
      )}
    >
      <nav className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 group">
          <BrandMark />
        </Link>

        <div className="hidden lg:flex items-center gap-0.5 shrink-0">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              size="sm"
              asChild
              className="text-sm font-medium px-2.5"
            >
              {'whatsapp' in link && link.whatsapp ? (
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-3.5 w-3.5 mr-1 inline" />
                  {lang === 'zh' ? link.label.zh : link.label.en}
                </a>
              ) : (
                <Link href={link.href}>
                  {lang === 'zh' ? link.label.zh : link.label.en}
                  {link.href === '/courses' && compareCount > 0 && (
                    <Badge className="ml-1 h-4 min-w-4 px-1 text-[10px] bg-emerald-600 text-white">
                      {compareCount}
                    </Badge>
                  )}
                </Link>
              )}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLang}
            className="ml-1 text-xs border-emerald-300 text-emerald-700"
          >
            <Globe className="h-3.5 w-3.5 mr-1" />
            {lang === 'zh' ? 'EN' : '中'}
          </Button>
          <Button
            size="sm"
            className="ml-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            asChild
          >
            <Link href="/apply">{lang === 'zh' ? '立即报名' : 'Apply Now'}</Link>
          </Button>
        </div>

        <div className="flex lg:hidden items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLang}
            className="text-xs h-8 px-2"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === 'zh' ? 'EN' : '中'}
          </Button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2.5 text-left font-bold">
                  <BrandMark compact />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className="justify-start h-12"
                    asChild
                    onClick={() => setMobileOpen(false)}
                  >
                    {'whatsapp' in link && link.whatsapp ? (
                      <a href={waUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4 mr-2 inline" />
                        {lang === 'zh' ? link.label.zh : link.label.en}
                      </a>
                    ) : (
                      <Link href={link.href}>
                        {lang === 'zh' ? link.label.zh : link.label.en}
                      </Link>
                    )}
                  </Button>
                ))}
                <Button
                  className="mt-4 bg-emerald-600"
                  asChild
                  onClick={() => setMobileOpen(false)}
                >
                  <Link href="/apply">
                    {lang === 'zh' ? '立即报名' : 'Apply Now'}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
