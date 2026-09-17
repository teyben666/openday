'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/store/use-language';
import { useComparison } from '@/store/use-comparison';
import { useShortlist } from '@/store/use-discovery';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Menu, Globe, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildWhatsAppUrl, buildGeneralWhatsAppMessage } from '@/lib/contact';

const navLinks = [
  { label: { zh: '首页', en: 'Home' }, href: '/' },
  { label: { zh: '课程', en: 'Courses' }, href: '/courses' },
  { label: { zh: '课程探索', en: 'Discovery' }, href: '/discovery' },
  { label: { zh: 'Foundation', en: 'Foundation' }, href: '/courses#foundation' },
  { label: { zh: '咨询', en: 'Contact' }, href: '/contact', whatsapp: true },
] as const;

export function Navbar() {
  const { lang, toggleLang } = useLanguage();
  const { selectedIds } = useComparison();
  const { ids: shortlistIds } = useShortlist();
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
        'fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 border-b',
        solid
          ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-gray-200/60 dark:border-gray-800/60 shadow-sm'
          : 'bg-transparent border-transparent',
      )}
    >
      <nav className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <GraduationCap className="h-6 w-6 text-emerald-600 transition-transform group-hover:scale-110" />
          <span className={cn('font-bold text-lg', solid ? 'text-emerald-700' : 'text-emerald-700 dark:text-emerald-400')}>
            {lang === 'zh' ? '新纪元' : 'NEUC'}
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Button key={link.href} variant="ghost" size="sm" asChild className="text-sm font-medium px-2.5">
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
          <Button variant="outline" size="sm" onClick={toggleLang} className="ml-1 text-xs border-emerald-300 text-emerald-700">
            <Globe className="h-3.5 w-3.5 mr-1" />
            {lang === 'zh' ? 'EN' : '中'}
          </Button>
          <Button size="sm" className="ml-2 bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
            <Link href="/apply">{lang === 'zh' ? '立即报名' : 'Apply Now'}</Link>
          </Button>
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleLang} className="text-xs h-8 px-2">
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
                <SheetTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                  {lang === 'zh' ? '新纪元大学学院' : 'NEUC'}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Button key={link.href} variant="ghost" className="justify-start h-12" asChild onClick={() => setMobileOpen(false)}>
                    {'whatsapp' in link && link.whatsapp ? (
                      <a href={waUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4 mr-2 inline" />
                        {lang === 'zh' ? link.label.zh : link.label.en}
                      </a>
                    ) : (
                      <Link href={link.href}>{lang === 'zh' ? link.label.zh : link.label.en}</Link>
                    )}
                  </Button>
                ))}
                <Button className="mt-4 bg-emerald-600" asChild onClick={() => setMobileOpen(false)}>
                  <Link href="/apply">{lang === 'zh' ? '立即报名' : 'Apply Now'}</Link>
                </Button>
                {shortlistIds.length > 0 && (
                  <p className="text-xs text-muted-foreground px-4 pt-2">
                    {lang === 'zh' ? `收藏 ${shortlistIds.length} 门课程` : `${shortlistIds.length} saved`}
                  </p>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
