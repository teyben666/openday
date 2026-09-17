export const DIMENSIONS = ['TEC', 'BUS', 'CRE', 'COM', 'LAN', 'CAR'] as const;

export type Dimension = (typeof DIMENSIONS)[number];

export type DimensionScores = Record<Dimension, number>;

export const dimensionLabels: Record<
  Dimension,
  { zh: string; en: string; emoji: string }
> = {
  TEC: { zh: '科技与逻辑', en: 'Technology & Logic', emoji: '🧠' },
  BUS: { zh: '商业与管理', en: 'Business & Management', emoji: '💼' },
  CRE: { zh: '创意与设计', en: 'Creativity & Design', emoji: '🎨' },
  COM: { zh: '沟通与传播', en: 'Communication & Media', emoji: '🗣️' },
  LAN: { zh: '语言与人文', en: 'Language & Humanities', emoji: '📚' },
  CAR: { zh: '人文关怀与教育', en: 'Care & Education', emoji: '❤️' },
};

export function emptyDimensionScores(): DimensionScores {
  return { TEC: 0, BUS: 0, CRE: 0, COM: 0, LAN: 0, CAR: 0 };
}

export function normalizeDimensions(raw: Partial<Record<Dimension, number>>): DimensionScores {
  const result = emptyDimensionScores();
  const keys = Object.keys(raw) as Dimension[];
  if (keys.length === 0) return result;
  const weight = 1 / keys.length;
  keys.forEach((k) => {
    result[k] = weight;
  });
  return result;
}
