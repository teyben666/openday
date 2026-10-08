'use client';

const ROW_COUNT = 6;
const LOGOS_PER_STRIP = 20;
const ROW_DURATION = [48, 42, 54, 38, 50, 44];

function LogoStrip() {
  return (
    <div className="flex shrink-0 items-center gap-6 sm:gap-7 px-4" aria-hidden>
      {Array.from({ length: LOGOS_PER_STRIP }, (_, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src="/neuc-logo-banner.png"
          alt=""
          className="h-9 sm:h-11 w-auto object-contain"
          draggable={false}
        />
      ))}
    </div>
  );
}

export function DiscoveryMarqueeBg() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      aria-hidden
    >
      <div className="absolute inset-0 flex flex-col justify-evenly py-4 opacity-[0.18] dark:opacity-[0.28]">
        {Array.from({ length: ROW_COUNT }, (_, row) => {
          const reverse = row % 2 === 1;
          return (
            <div key={row} className="overflow-hidden py-1">
              <div
                className={
                  reverse
                    ? 'discovery-marquee-track discovery-marquee-rtl'
                    : 'discovery-marquee-track discovery-marquee-ltr'
                }
                style={{ animationDuration: `${ROW_DURATION[row]}s` }}
              >
                <LogoStrip />
                <LogoStrip />
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background/80" />
    </div>
  );
}
