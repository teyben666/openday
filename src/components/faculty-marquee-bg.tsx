'use client';

type MarqueeItem = { text: string; color: string; soft?: boolean };

const FACULTY_GROUPS: MarqueeItem[][] = [
  [
    { text: '计算机与创新技术学院', color: '#7c3aed' },
    { text: '信息技术系', color: '#7c3aed' },
    { text: '人工智能与计算机科学系', color: '#7c3aed' },
  ],
  [
    { text: '文学与社会科学院', color: '#dc2626' },
    { text: '中文系', color: '#dc2626' },
    { text: '东南亚学系', color: '#dc2626' },
    { text: '媒体研究系', color: '#dc2626' },
  ],
  [
    { text: '会计、管理与经济学院', color: '#2563eb' },
    { text: '商业管理系', color: '#2563eb' },
    { text: '金融与会计系', color: '#2563eb' },
  ],
  [
    { text: '教育学院', color: '#ca8a04' },
    { text: '教育系', color: '#ca8a04' },
    { text: '幼儿教育系', color: '#ca8a04' },
    { text: '心理辅导系', color: '#ca8a04' },
  ],
  [
    { text: '艺术与表演学院', color: '#0e7490' },
    { text: '美术与设计系', color: '#0e7490' },
    { text: '创意多媒体系', color: '#0e7490' },
    { text: '室内建筑系', color: '#0e7490' },
    { text: '戏剧与影像系', color: '#0e7490' },
  ],
  [
    { text: '卫生、保安与环境管理学院', color: '#171717' },
    { text: '执法（荣誉）学士学位', color: '#171717' },
    { text: '文科基础课程', color: '#171717' },
    { text: '国际教育学院', color: '#b86b5c', soft: true },
    { text: '汉语国际教育系', color: '#b86b5c', soft: true },
  ],
];

/** Courses page: denser marquee (50 rows); soft opacity like Discovery */
const ROW_COUNT = 50;
const ROW_DURATION = Array.from({ length: ROW_COUNT }, (_, i) => 36 + ((i * 7) % 24));
const ROWS = Array.from({ length: ROW_COUNT }, (_, i) => FACULTY_GROUPS[i % FACULTY_GROUPS.length]);

function MarqueeChip({ item }: { item: MarqueeItem }) {
  return (
    <span
      className="whitespace-nowrap rounded-full px-3 py-1 text-xs sm:text-sm font-semibold tracking-wide"
      style={
        item.soft
          ? { backgroundColor: '#FCD5CE', color: '#7a3f35' }
          : {
              color: item.color,
              backgroundColor: `${item.color}18`,
              border: `1px solid ${item.color}33`,
            }
      }
    >
      {item.text}
    </span>
  );
}

function RowStrip({ items }: { items: MarqueeItem[] }) {
  const loop = [...items, ...items, ...items, ...items, ...items];
  return (
    <div className="flex shrink-0 items-center gap-6 sm:gap-7 px-4" aria-hidden>
      {loop.map((item, i) => (
        <MarqueeChip key={i} item={item} />
      ))}
    </div>
  );
}

export function FacultyMarqueeBg() {
  // Fixed to the viewport so density stays like the filtered (short-page) look
  // instead of stretching / sparsifying when the course list is long.
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden
    >
      <div className="absolute inset-0 flex flex-col justify-evenly py-4 opacity-[0.18] dark:opacity-[0.28]">
        {ROWS.map((items, row) => {
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
                <RowStrip items={items} />
                <RowStrip items={items} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background/80" />
    </div>
  );
}
