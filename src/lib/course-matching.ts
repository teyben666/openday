import { courses, type Course } from '@/data/courses';
import { courseProfiles } from '@/data/course-profiles';
import {
  DIMENSIONS,
  type Dimension,
  type DimensionScores,
  emptyDimensionScores,
} from '@/data/dimensions';
import { quizQuestions, type QuizPart } from '@/data/quiz';

export type RecommendationLevel = 'strong' | 'moderate' | 'explore';

export interface DiscoveryResult {
  interest: DimensionScores;
  strength: DimensionScores;
  preference: DimensionScores;
  final: DimensionScores;
  mainDirection: { dimensions: Dimension[]; label: { zh: string; en: string } };
  foundationAdvice: FoundationAdvice;
  recommendations: CourseRecommendation[];
  explanation: { zh: string; en: string };
}

export interface FoundationAdvice {
  type: 'degree' | 'compare' | 'foundation' | 'cross-field';
  message: { zh: string; en: string };
}

export interface CourseRecommendation {
  course: Course;
  tier: 'gold' | 'silver' | 'bronze';
  matchScore: number;
  level: RecommendationLevel;
  reasons: { zh: string; en: string }[];
}

const PART_WEIGHTS: Record<QuizPart, number> = {
  interest: 0.4,
  strength: 0.35,
  preference: 0.25,
};

function distributeOptionScore(dims: Dimension[]): DimensionScores {
  const scores = emptyDimensionScores();
  if (dims.length === 0) return scores;
  const each = 1 / dims.length;
  dims.forEach((d) => {
    scores[d] += each;
  });
  return scores;
}

function addScores(a: DimensionScores, b: DimensionScores): DimensionScores {
  const result = emptyDimensionScores();
  DIMENSIONS.forEach((d) => {
    result[d] = a[d] + b[d];
  });
  return result;
}

function toPercentages(raw: DimensionScores): DimensionScores {
  const total = DIMENSIONS.reduce((s, d) => s + raw[d], 0);
  const result = emptyDimensionScores();
  if (total === 0) return result;
  DIMENSIONS.forEach((d) => {
    result[d] = Math.round((raw[d] / total) * 100);
  });
  return result;
}

function weightedFinal(
  interest: DimensionScores,
  strength: DimensionScores,
  preference: DimensionScores,
): DimensionScores {
  const result = emptyDimensionScores();
  DIMENSIONS.forEach((d) => {
    result[d] =
      interest[d] * PART_WEIGHTS.interest +
      strength[d] * PART_WEIGHTS.strength +
      preference[d] * PART_WEIGHTS.preference;
  });
  return result;
}

function getTopDimensions(scores: DimensionScores, n = 2): Dimension[] {
  return [...DIMENSIONS]
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, n);
}

function matchCourse(student: DimensionScores, courseId: string): number {
  const profile = courseProfiles[courseId];
  if (!profile) return 0;
  let sum = 0;
  DIMENSIONS.forEach((d) => {
    sum += (student[d] / 100) * profile[d];
  });
  return Math.round(sum * 100);
}

function getConsistencyLevel(
  interest: number,
  strength: number,
): RecommendationLevel {
  const diff = Math.abs(interest - strength);
  if (interest >= 55 && strength >= 50 && diff <= 20) return 'strong';
  if (interest >= 45 || strength >= 40) return 'moderate';
  return 'explore';
}

function buildFoundationAdvice(final: DimensionScores): FoundationAdvice {
  const sorted = [...DIMENSIONS].sort((a, b) => final[b] - final[a]);
  const top = final[sorted[0]];
  const second = final[sorted[1]];
  const gap = top - second;

  if (top >= 55 && gap >= 15) {
    return {
      type: 'degree',
      message: {
        zh: '你的方向较为明确，建议直接探索相关 Degree 或 Diploma 课程。',
        en: 'Your direction is fairly clear — explore relevant Degree or Diploma programmes.',
      },
    };
  }
  if (gap < 10) {
    return {
      type: 'compare',
      message: {
        zh: '你有多个相近的方向，建议比较 3–4 门课程后再决定。',
        en: 'You have multiple close directions — compare 3–4 courses before deciding.',
      },
    };
  }
  if (top <= 45) {
    return {
      type: 'foundation',
      message: {
        zh: '方向尚未明确没关系 — Foundation 可以帮你探索不同领域，为未来 Degree 做准备。',
        en: 'Not sure yet? Foundation lets you explore different fields before your Degree.',
      },
    };
  }
  const tec = final.TEC;
  const bus = final.BUS;
  if (tec >= 50 && bus >= 50) {
    return {
      type: 'cross-field',
      message: {
        zh: '你的科技与商业倾向都较强，可考虑跨领域课程（如金融投资、商业科技相关）。',
        en: 'Strong in both tech and business — consider cross-field programmes like Finance or Business Tech.',
      },
    };
  }
  return {
    type: 'compare',
    message: {
      zh: '继续探索推荐课程，或使用比较功能帮助做决定。',
      en: 'Keep exploring recommended courses or use Compare to help decide.',
    },
  };
}

function buildExplanation(final: DimensionScores): { zh: string; en: string } {
  const [top, second] = getTopDimensions(final, 2);
  const topLabel = { TEC: '科技', BUS: '商业', CRE: '创意', COM: '传播', LAN: '语言人文', CAR: '人文关怀' };
  const topEn = { TEC: 'Technology', BUS: 'Business', CRE: 'Creativity', COM: 'Communication', LAN: 'Language & Humanities', CAR: 'Care & Education' };
  return {
    zh: `你的「${topLabel[top]}」倾向最突出（${Math.round(final[top])}%），其次是「${topLabel[second]}」（${Math.round(final[second])}%）。以下课程与您的画像较为匹配，但仍建议进一步了解课程内容后再做决定。`,
    en: `Your strongest tendency is ${topEn[top]} (${Math.round(final[top])}%), followed by ${topEn[second]} (${Math.round(final[second])}%). These courses match your profile — we still recommend reviewing full details before deciding.`,
  };
}

export function calculateDiscoveryResult(answers: number[]): DiscoveryResult {
  let interestRaw = emptyDimensionScores();
  let strengthRaw = emptyDimensionScores();
  let preferenceRaw = emptyDimensionScores();

  answers.forEach((optionIndex, qIndex) => {
    const q = quizQuestions[qIndex];
    const opt = q?.options[optionIndex];
    if (!opt) return;
    const contrib = distributeOptionScore(opt.dimensions);
    if (q.part === 'interest') interestRaw = addScores(interestRaw, contrib);
    else if (q.part === 'strength') strengthRaw = addScores(strengthRaw, contrib);
    else preferenceRaw = addScores(preferenceRaw, contrib);
  });

  const interest = toPercentages(interestRaw);
  const strength = toPercentages(strengthRaw);
  const preference = toPercentages(preferenceRaw);
  const finalRaw = weightedFinal(interest, strength, preference);
  const final = emptyDimensionScores();
  DIMENSIONS.forEach((d) => {
    final[d] = Math.round(finalRaw[d]);
  });

  const topDims = getTopDimensions(final, 2);
  const dimZh: Record<Dimension, string> = {
    TEC: '科技', BUS: '商业', CRE: '创意', COM: '传播', LAN: '语言', CAR: '人文',
  };
  const dimEn: Record<Dimension, string> = {
    TEC: 'Technology', BUS: 'Business', CRE: 'Creativity', COM: 'Communication', LAN: 'Language', CAR: 'Care',
  };

  const excludeFoundation = buildFoundationAdvice(final).type !== 'foundation';
  const scored = courses
    .filter((c) => !excludeFoundation || c.type !== 'foundation')
    .map((course) => {
      const matchScore = matchCourse(final, course.id);
      const profile = courseProfiles[course.id];
      const topDim = getTopDimensions(final, 1)[0];
      const level = getConsistencyLevel(interest[topDim], strength[topDim]);
      const reasons: { zh: string; en: string }[] = [];
      if (profile && profile[topDim] >= 0.3) {
        reasons.push({
          zh: `与你的「${dimZh[topDim]}」倾向相符`,
          en: `Aligns with your ${dimEn[topDim]} tendency`,
        });
      }
      if (level === 'strong') {
        reasons.push({
          zh: '兴趣与能力方向较为一致',
          en: 'Interest and strength are fairly consistent',
        });
      } else if (level === 'moderate') {
        reasons.push({
          zh: '部分兴趣或能力与该课程相符',
          en: 'Partial alignment with your interests or strengths',
        });
      } else {
        reasons.push({
          zh: '可作为跨领域探索的选择',
          en: 'Worth exploring as a cross-field option',
        });
      }
      return { course, matchScore, level, reasons };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  const recommendations: CourseRecommendation[] = scored.slice(0, 6).map((item, i) => ({
    ...item,
    tier: i === 0 ? 'gold' : i <= 2 ? 'silver' : 'bronze',
  }));

  return {
    interest,
    strength,
    preference,
    final,
    mainDirection: {
      dimensions: topDims,
      label: {
        zh: topDims.map((d) => dimZh[d]).join(' + '),
        en: topDims.map((d) => dimEn[d]).join(' + '),
      },
    },
    foundationAdvice: buildFoundationAdvice(final),
    recommendations,
    explanation: buildExplanation(final),
  };
}
