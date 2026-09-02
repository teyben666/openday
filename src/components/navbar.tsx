'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { GraduationCap, Menu, Globe } from 'lucide-react';

const navLinks = [
  { label: { zh: '首页', en: 'Home' }, href: '/' },
  { label: { zh: '测验', en: 'Quiz' }, href: '#quiz-section' },
  { label: { zh: '课程', en: 'Courses' }, href: '#catalog-section' },
  { label: { zh: '咨询', en: 'Contact' }, href: '#inquiry-section' },
] as const;

export function Navbar() {
  const { lang, toggleLang } = useLanguage();
  const { selectedIds } = useComparison();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  function handleNavClick(href: string) {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const compareCount = selectedIds.length;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-gray-200/60 dark:border-gray-800/60 shadow-sm'
          : 'bg-transparent border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-2 group"
        >
          <GraduationCap className="h-6 w-6 text-emerald-600 transition-transform group-hover:scale-110" />
          <span className="font-bold text-lg text-emerald-700 dark:text-emerald-400">
            {lang === 'zh' ? '新纪元' : 'NEUC'}
          </span>
        </button>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <div key={link.href} className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavClick(link.href)}
                className={`text-sm font-medium px-3 ${
                  scrolled
                    ? 'text-foreground/80 hover:text-foreground hover:bg-foreground/5'
                    : 'text-foreground/90 hover:text-foreground hover:bg-foreground/5'
                }`}
              >
                {lang === 'zh' ? link.label.zh : link.label.en}
                {link.href === '#catalog-section' && compareCount > 0 && (
                  <Badge className="ml-1.5 h-4 min-w-4 px-1 text-[10px] bg-emerald-600 text-white">
                    {compareCount}
                  </Badge>
                )}
              </Button>
            </div>
          ))}

          {/* Language toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLang}
            className="ml-2 text-xs font-semibold uppercase tracking-wider border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950"
          >
            <Globe className="h-3.5 w-3.5 mr-1" />
            {lang === 'zh' ? 'EN' : '中'}
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLang}
            className="text-xs font-semibold uppercase tracking-wider border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 h-8 px-2"
          >
            <Globe className="h-3.5 w-3.5 mr-1" />
            {lang === 'zh' ? 'EN' : '中'}
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={
                  scrolled
                    ? 'text-foreground'
                    : 'text-foreground'
                }
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
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
                  <Button
                    key={link.href}
                    variant="ghost"
                    className="justify-start text-base h-12 px-4"
                    onClick={() => handleNavClick(link.href)}
                  >
                    {lang === 'zh' ? link.label.zh : link.label.en}
                    {link.href === '#catalog-section' && compareCount > 0 && (
                      <Badge className="ml-2 h-4 min-w-4 px-1 text-[10px] bg-emerald-600 text-white">
                        {compareCount}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
