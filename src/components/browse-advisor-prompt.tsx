'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCourseUi } from '@/components/site-layout';
import { useLanguage } from '@/store/use-language';
import {
  ADVISOR_BUBBLE_POS_KEY,
  buildBrowseCoursesWhatsAppMessage,
  buildWhatsAppUrl,
  markAdvisorPromptDismissed,
  markAdvisorPromptShown,
  shouldShowAdvisorPrompt,
} from '@/lib/contact';

const BROWSE_SECONDS = 75;
const DETAIL_VIEW_THRESHOLD = 2;
const NAV_OFFSET = 72;
const EDGE_PAD = 12;
const DEFAULT_INSET = 24;

function clampPosition(x: number, y: number, width: number, height: number) {
  const maxX = window.innerWidth - width - EDGE_PAD;
  const maxY = window.innerHeight - height - EDGE_PAD;
  return {
    x: Math.max(EDGE_PAD, Math.min(x, maxX)),
    y: Math.max(NAV_OFFSET, Math.min(y, maxY)),
  };
}

function loadSavedPosition(): { x: number; y: number } | null {
  try {
    const raw = sessionStorage.getItem(ADVISOR_BUBBLE_POS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { x: number; y: number };
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function BrowseAdvisorPrompt() {
  const { lang, t } = useLanguage();
  const { detailViewCount } = useCourseUi();
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [positionReady, setPositionReady] = useState(false);
  const triggeredRef = useRef(false);
  const didInitPositionRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragMovedRef = useRef(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const initPosition = useCallback(
    (reclampOnly = false) => {
      const el = containerRef.current;
      const width = el?.offsetWidth ?? 56;
      const height = el?.offsetHeight ?? 56;

      if (!reclampOnly && !didInitPositionRef.current) {
        const saved = loadSavedPosition();
        const fallback = {
          x: window.innerWidth - width - DEFAULT_INSET,
          y: window.innerHeight - height - DEFAULT_INSET,
        };
        const pos = clampPosition(saved?.x ?? fallback.x, saved?.y ?? fallback.y, width, height);
        x.set(pos.x);
        y.set(pos.y);
        didInitPositionRef.current = true;
      } else {
        const clamped = clampPosition(x.get(), y.get(), width, height);
        x.set(clamped.x);
        y.set(clamped.y);
      }
      setPositionReady(true);
    },
    [x, y],
  );

  const tryShow = useCallback(() => {
    if (triggeredRef.current || !shouldShowAdvisorPrompt()) return;
    triggeredRef.current = true;
    markAdvisorPromptShown();
    setVisible(true);
    setExpanded(true);
  }, []);

  useEffect(() => {
    let elapsed = 0;
    const timer = setInterval(() => {
      if (document.hidden) return;
      elapsed += 1;
      if (elapsed >= BROWSE_SECONDS) {
        tryShow();
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [tryShow]);

  useEffect(() => {
    if (detailViewCount >= DETAIL_VIEW_THRESHOLD) {
      tryShow();
    }
  }, [detailViewCount, tryShow]);

  useLayoutEffect(() => {
    if (!visible) {
      didInitPositionRef.current = false;
      setPositionReady(false);
      return;
    }
    initPosition(didInitPositionRef.current);
  }, [visible, expanded, initPosition]);

  useEffect(() => {
    if (!visible || !positionReady) return;
    const onResize = () => {
      const el = containerRef.current;
      if (!el) return;
      const clamped = clampPosition(x.get(), y.get(), el.offsetWidth, el.offsetHeight);
      x.set(clamped.x);
      y.set(clamped.y);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [visible, positionReady, x, y]);

  const waUrl = buildWhatsAppUrl(buildBrowseCoursesWhatsAppMessage(lang));

  const savePosition = () => {
    sessionStorage.setItem(ADVISOR_BUBBLE_POS_KEY, JSON.stringify({ x: x.get(), y: y.get() }));
  };

  const handleDragEnd = () => {
    const el = containerRef.current;
    if (!el) return;
    const clamped = clampPosition(x.get(), y.get(), el.offsetWidth, el.offsetHeight);
    x.set(clamped.x);
    y.set(clamped.y);
    savePosition();
    requestAnimationFrame(() => {
      dragMovedRef.current = false;
    });
  };

  const handleBubbleClick = () => {
    if (dragMovedRef.current) return;
    setExpanded((prev) => !prev);
  };

  const handleMinimize = () => setExpanded(false);

  const handleClose = () => {
    markAdvisorPromptDismissed();
    setVisible(false);
    setExpanded(false);
  };

  const handleWhatsAppClick = () => {
    markAdvisorPromptDismissed();
    setVisible(false);
    setExpanded(false);
  };

  if (!visible) return null;

  return (
    <motion.div
      ref={containerRef}
      drag
      dragMomentum={false}
      dragElastic={0.08}
      style={{ x, y, opacity: positionReady ? 1 : 0 }}
      onDragStart={() => {
        dragMovedRef.current = false;
      }}
      onDrag={() => {
        dragMovedRef.current = true;
      }}
      onDragEnd={handleDragEnd}
      className="fixed left-0 top-0 z-50 touch-none select-none"
    >
      <div className="flex flex-col items-end gap-3">
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="w-[min(calc(100vw-2rem),18rem)] rounded-2xl border bg-background p-4 shadow-xl"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold leading-snug">
                    {t('还在挑选课程？', 'Still exploring programmes?')}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {t(
                      '招生顾问可以一对一帮你对比课程、学费与奖学金。',
                      'Our advisors can guide you one-to-one on programmes, fees and scholarships.',
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label={t('关闭', 'Close')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Button
                size="sm"
                className="w-full bg-[#25D366] hover:bg-[#1fb855] text-white font-semibold"
                asChild
              >
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsAppClick}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {t('WhatsApp 联系顾问', 'Chat on WhatsApp')}
                </a>
              </Button>
              <button
                type="button"
                onClick={handleMinimize}
                className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('继续浏览', 'Keep browsing')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={handleBubbleClick}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className="relative flex h-14 w-14 cursor-grab items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-4 ring-[#25D366]/20 active:cursor-grabbing hover:bg-[#1fb855] transition-colors"
          aria-label={t('联系招生顾问', 'Contact admissions advisor')}
          aria-expanded={expanded}
        >
          <MessageCircle className="h-6 w-6" />
          {!expanded && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold ring-2 ring-background">
              1
            </span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
