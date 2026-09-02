export interface QuizQuestion {
  id: number;
  question: { zh: string; en: string };
  options: {
    text: { zh: string; en: string };
    categories: string[];
    emoji: string;
  }[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: {
      zh: '周末你最想做什么？',
      en: 'What do you most want to do on a weekend?',
    },
    options: [
      { text: { zh: '画一幅画或设计东西', en: 'Draw or design something creative' }, categories: ['design'], emoji: '🎨' },
      { text: { zh: '和朋友聊天，听他们倾诉', en: 'Chat with friends and listen to them' }, categories: ['counselling', 'social-work'], emoji: '💬' },
      { text: { zh: '写代码、研究新科技', en: 'Code and explore new tech' }, categories: ['tech'], emoji: '💻' },
      { text: { zh: '拍短片或剪视频', en: 'Shoot or edit videos' }, categories: ['media', 'design'], emoji: '🎬' },
    ],
  },
  {
    id: 2,
    question: {
      zh: '你最喜欢哪类科目？',
      en: 'Which subjects do you enjoy most?',
    },
    options: [
      { text: { zh: '数学和会计', en: 'Math and Accounting' }, categories: ['finance', 'business'], emoji: '📊' },
      { text: { zh: '语文、文学和历史', en: 'Languages, Literature & History' }, categories: ['chinese', 'education'], emoji: '📚' },
      { text: { zh: '商业管理和市场营销', en: 'Business Management & Marketing' }, categories: ['business', 'media'], emoji: '📈' },
      { text: { zh: '心理学和辅导', en: 'Psychology & Counselling' }, categories: ['counselling', 'social-work'], emoji: '🧠' },
    ],
  },
  {
    id: 3,
    question: {
      zh: '你理想的工作环境是？',
      en: 'What is your ideal work environment?',
    },
    options: [
      { text: { zh: '幼儿园或学校', en: 'Kindergarten or school' }, categories: ['education'], emoji: '🏫' },
      { text: { zh: '科技公司或创业公司', en: 'Tech company or startup' }, categories: ['tech', 'business'], emoji: '🚀' },
      { text: { zh: '广告公司或媒体机构', en: 'Ad agency or media organisation' }, categories: ['media', 'design'], emoji: '📡' },
      { text: { zh: '医院、社工机构或辅导中心', en: 'Hospital, social service or counselling centre' }, categories: ['counselling', 'social-work', 'care'], emoji: '🏥' },
    ],
  },
  {
    id: 4,
    question: {
      zh: '如果你有一百万，你会怎么用？',
      en: 'If you had RM1 million, what would you do?',
    },
    options: [
      { text: { zh: '投资理财，让钱生钱', en: 'Invest and grow wealth' }, categories: ['finance', 'business'], emoji: '💰' },
      { text: { zh: '开一家自己的公司', en: 'Start my own company' }, categories: ['business'], emoji: '🏢' },
      { text: { zh: '拍一部电影或办一个画展', en: 'Make a film or host an art exhibition' }, categories: ['media', 'design'], emoji: '🎭' },
      { text: { zh: '捐给慈善机构帮助弱势群体', en: 'Donate to charities to help the vulnerable' }, categories: ['social-work', 'counselling', 'care'], emoji: '❤️' },
    ],
  },
  {
    id: 5,
    question: {
      zh: '朋友们最常用什么词形容你？',
      en: 'What word do friends use most to describe you?',
    },
    options: [
      { text: { zh: '有创意、有想象力', en: 'Creative and imaginative' }, categories: ['design', 'media'], emoji: '✨' },
      { text: { zh: '有耐心、乐于助人', en: 'Patient and helpful' }, categories: ['education', 'counselling', 'care', 'social-work'], emoji: '🤝' },
      { text: { zh: '逻辑清晰、善于分析', en: 'Logical and analytical' }, categories: ['tech', 'finance'], emoji: '🔬' },
      { text: { zh: '善于沟通、社交能力强', en: 'Great communicator and social' }, categories: ['business', 'media'], emoji: '🗣️' },
    ],
  },
  {
    id: 6,
    question: {
      zh: '你未来最想拥有什么超能力？',
      en: 'What superpower do you most wish you had?',
    },
    options: [
      { text: { zh: '读懂人心，帮助别人解决问题', en: 'Read minds and help people solve problems' }, categories: ['counselling', 'social-work'], emoji: '🔮' },
      { text: { zh: '瞬间学会任何语言', en: 'Instantly learn any language' }, categories: ['chinese', 'education'], emoji: '🌍' },
      { text: { zh: '用代码创造任何东西', en: 'Create anything with code' }, categories: ['tech'], emoji: '⚡' },
      { text: { zh: '用创意改变世界', en: 'Change the world with creativity' }, categories: ['design', 'media', 'business'], emoji: '🌟' },
    ],
  },
];

export interface QuizResult {
  topCategories: string[];
  categoryScores: Record<string, number>;
}

export function calculateQuizResult(answers: number[]): QuizResult {
  const scores: Record<string, number> = {};
  
  answers.forEach((optionIndex, questionIndex) => {
    const question = quizQuestions[questionIndex];
    if (question && question.options[optionIndex]) {
      question.options[optionIndex].categories.forEach((cat) => {
        scores[cat] = (scores[cat] || 0) + 1;
      });
    }
  });

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topCategories = sorted.slice(0, 3).map(([cat]) => cat);

  return { topCategories, categoryScores: scores };
}

export const categoryLabels: Record<string, { zh: string; en: string; emoji: string }> = {
  counselling: { zh: '辅导咨商', en: 'Counselling', emoji: '🧠' },
  business: { zh: '商业管理', en: 'Business', emoji: '💼' },
  education: { zh: '教育', en: 'Education', emoji: '📚' },
  tech: { zh: '科技', en: 'Technology', emoji: '💻' },
  design: { zh: '设计', en: 'Design', emoji: '🎨' },
  media: { zh: '媒体传播', en: 'Media', emoji: '🎬' },
  chinese: { zh: '中文', en: 'Chinese Studies', emoji: '📖' },
  finance: { zh: '金融会计', en: 'Finance', emoji: '💰' },
  'social-work': { zh: '社会服务', en: 'Social Work', emoji: '🤝' },
  care: { zh: '照护管理', en: 'Care Management', emoji: '❤️' },
};
