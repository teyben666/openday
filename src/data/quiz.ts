import type { Dimension } from './dimensions';

export type QuizPart = 'interest' | 'strength' | 'preference';

export interface QuizQuestion {
  id: number;
  part: QuizPart;
  question: { zh: string; en: string };
  options: {
    text: { zh: string; en: string };
    dimensions: Dimension[];
    emoji: string;
  }[];
}

export const partLabels: Record<
  QuizPart,
  { zh: string; en: string; weight: string }
> = {
  interest: { zh: '兴趣', en: 'Interest', weight: '40%' },
  strength: { zh: '能力', en: 'Strength', weight: '35%' },
  preference: { zh: '偏好', en: 'Preference', weight: '25%' },
};

export const quizQuestions: QuizQuestion[] = [
  // Part A — Interest (Q1–5)
  {
    id: 1,
    part: 'interest',
    question: {
      zh: '如果给你一个星期完成一个 Project，你比较想做哪一种？',
      en: 'If you had a week for a project, which would you prefer?',
    },
    options: [
      { text: { zh: '设计一个手机 App 或网站', en: 'Design a mobile app or website' }, dimensions: ['TEC'], emoji: '💻' },
      { text: { zh: '策划一场校园活动或募款企划', en: 'Plan a campus event or fundraising campaign' }, dimensions: ['BUS'], emoji: '📋' },
      { text: { zh: '拍一部短片或设计一系列视觉海报', en: 'Shoot a short film or design visual posters' }, dimensions: ['CRE'], emoji: '🎬' },
      { text: { zh: '访问不同背景的人，写一篇专题报导', en: 'Interview people and write a feature story' }, dimensions: ['COM', 'LAN'], emoji: '📝' },
    ],
  },
  {
    id: 2,
    part: 'interest',
    question: {
      zh: '空闲时你最容易沉浸在哪一种活动中？',
      en: 'Which activity do you lose yourself in during free time?',
    },
    options: [
      { text: { zh: '研究新科技、组装电脑或写代码', en: 'Explore tech, build PCs, or code' }, dimensions: ['TEC'], emoji: '⚙️' },
      { text: { zh: '阅读财经新闻或分析市场趋势', en: 'Read finance news or analyse market trends' }, dimensions: ['BUS'], emoji: '📈' },
      { text: { zh: '画画、摄影、做手作或看艺术展', en: 'Draw, photograph, craft, or visit art exhibitions' }, dimensions: ['CRE'], emoji: '🎨' },
      { text: { zh: '看电影、写影评、经营社群或阅读人文书籍', en: 'Watch films, write reviews, manage social media, or read humanities' }, dimensions: ['COM', 'LAN'], emoji: '📚' },
    ],
  },
  {
    id: 3,
    part: 'interest',
    question: {
      zh: '如果可以选择，你希望未来工作的环境比较像？',
      en: 'Which work environment appeals to you most?',
    },
    options: [
      { text: { zh: '实验室或电脑前，专注解决技术问题', en: 'Lab or desk, focused on solving technical problems' }, dimensions: ['TEC'], emoji: '🔬' },
      { text: { zh: '办公室，参与决策与策略规划', en: 'Office, involved in decisions and strategy' }, dimensions: ['BUS'], emoji: '🏢' },
      { text: { zh: '工作室，自由创作与实验', en: 'Studio, free to create and experiment' }, dimensions: ['CRE'], emoji: '✨' },
      { text: { zh: '学校、社区或媒体现场，与人互动为主', en: 'School, community, or media — people-focused' }, dimensions: ['COM', 'CAR'], emoji: '🤝' },
    ],
  },
  {
    id: 4,
    part: 'interest',
    question: {
      zh: '你对哪一种议题最有好奇心？',
      en: 'Which topic sparks your curiosity most?',
    },
    options: [
      { text: { zh: '人工智能、网络安全或软件开发', en: 'AI, cybersecurity, or software development' }, dimensions: ['TEC'], emoji: '🤖' },
      { text: { zh: '创业、投资理财或品牌经营', en: 'Entrepreneurship, investing, or branding' }, dimensions: ['BUS'], emoji: '💰' },
      { text: { zh: '视觉美学、影视作品或艺术创作', en: 'Visual aesthetics, film, or art creation' }, dimensions: ['CRE'], emoji: '🎭' },
      { text: { zh: '教育议题、社会文化现象或人的心理', en: 'Education, social culture, or human psychology' }, dimensions: ['LAN', 'CAR'], emoji: '🧠' },
    ],
  },
  {
    id: 5,
    part: 'interest',
    question: {
      zh: '在团队中，你最常扮演什么角色？',
      en: 'What role do you usually play in a team?',
    },
    options: [
      { text: { zh: '技术担当 — 解决大家搞不定的技术问题', en: 'Tech lead — solving technical problems' }, dimensions: ['TEC'], emoji: '🛠️' },
      { text: { zh: '统筹担当 — 规划进度、分配任务', en: 'Coordinator — planning and delegating' }, dimensions: ['BUS'], emoji: '📊' },
      { text: { zh: '创意担当 — 提出天马行空的想法', en: 'Creative lead — bringing bold ideas' }, dimensions: ['CRE'], emoji: '💡' },
      { text: { zh: '协调担当 — 关心组员状况、协调冲突', en: 'Harmoniser — caring for team dynamics' }, dimensions: ['CAR'], emoji: '❤️' },
    ],
  },
  // Part B — Strength (Q6–10)
  {
    id: 6,
    part: 'strength',
    question: {
      zh: '哪一件事你做起来比别人轻松？',
      en: 'What do you find easier than most people?',
    },
    options: [
      { text: { zh: '找出复杂问题的规律或漏洞', en: 'Spotting patterns or flaws in complex problems' }, dimensions: ['TEC'], emoji: '🔍' },
      { text: { zh: '整理资料、做报表或计算数据', en: 'Organising data, reports, or calculations' }, dimensions: ['BUS'], emoji: '📑' },
      { text: { zh: '把脑中想像的画面具体呈现出来', en: 'Turning imagined visuals into reality' }, dimensions: ['CRE'], emoji: '🖼️' },
      { text: { zh: '用文字或语言清楚表达自己的想法', en: 'Expressing ideas clearly in writing or speech' }, dimensions: ['COM', 'LAN'], emoji: '✍️' },
    ],
  },
  {
    id: 7,
    part: 'strength',
    question: {
      zh: '在小组作业中，你通常会？',
      en: 'In group assignments, you usually…',
    },
    options: [
      { text: { zh: '负责技术部分 — 写代码、做系统、处理数据', en: 'Handle tech — coding, systems, data' }, dimensions: ['TEC'], emoji: '💻' },
      { text: { zh: '负责规划部分 — 制定流程、管理时间与资源', en: 'Handle planning — process, time, resources' }, dimensions: ['BUS'], emoji: '🗓️' },
      { text: { zh: '负责设计部分 — 做简报视觉、设计排版', en: 'Handle design — slides, layouts, visuals' }, dimensions: ['CRE'], emoji: '🎨' },
      { text: { zh: '负责整合部分 — 统整资料、撰写书面报告', en: 'Handle integration — compiling and writing reports' }, dimensions: ['LAN'], emoji: '📖' },
    ],
  },
  {
    id: 8,
    part: 'strength',
    question: {
      zh: '哪一种学习方式让你觉得最有效？',
      en: 'Which learning style works best for you?',
    },
    options: [
      { text: { zh: '自己动手做实验、写程式、实际操作', en: 'Hands-on experiments, coding, practical work' }, dimensions: ['TEC'], emoji: '🔧' },
      { text: { zh: '分析案例、研究成功企业的做法', en: 'Case studies and analysing successful businesses' }, dimensions: ['BUS'], emoji: '🏆' },
      { text: { zh: '透过视觉素材学习（影片、图像、设计）', en: 'Learning through visuals — video, images, design' }, dimensions: ['CRE'], emoji: '📺' },
      { text: { zh: '透过讨论、阅读或教别人来学习', en: 'Learning through discussion, reading, or teaching others' }, dimensions: ['COM', 'LAN'], emoji: '🗣️' },
    ],
  },
  {
    id: 9,
    part: 'strength',
    question: {
      zh: '别人通常怎么形容你？',
      en: 'How do others usually describe you?',
    },
    options: [
      { text: { zh: '冷静、理性、善于分析', en: 'Calm, rational, analytical' }, dimensions: ['TEC'], emoji: '🧊' },
      { text: { zh: '有条理、负责任、懂得规划', en: 'Organised, responsible, good at planning' }, dimensions: ['BUS'], emoji: '✅' },
      { text: { zh: '有创意、有美感、想法独特', en: 'Creative, aesthetic, unique ideas' }, dimensions: ['CRE'], emoji: '🌟' },
      { text: { zh: '善于倾听、细心、容易相处', en: 'Good listener, caring, easy to get along with' }, dimensions: ['CAR'], emoji: '🤗' },
    ],
  },
  {
    id: 10,
    part: 'strength',
    question: {
      zh: '遇到一个陌生的软件或工具，你通常？',
      en: 'When facing unfamiliar software or tools, you usually…',
    },
    options: [
      { text: { zh: '自己摸索、看说明书或找教学影片学会', en: 'Figure it out yourself via manuals or tutorials' }, dimensions: ['TEC'], emoji: '📱' },
      { text: { zh: '先了解它的功能与效益，再决定是否使用', en: 'Evaluate features and benefits before using' }, dimensions: ['BUS'], emoji: '⚖️' },
      { text: { zh: '关注它的界面设计好不好看、好不好用', en: 'Notice whether the UI looks and feels good' }, dimensions: ['CRE'], emoji: '🎯' },
      { text: { zh: '学会了之后写教学笔记或分享给别人', en: 'Write notes or share what you learned with others' }, dimensions: ['COM', 'LAN'], emoji: '📢' },
    ],
  },
  // Part C — Preference (Q11–15)
  {
    id: 11,
    part: 'preference',
    question: {
      zh: '在选择一个课程时，你最重视什么？',
      en: 'When choosing a programme, what matters most?',
    },
    options: [
      { text: { zh: '课程内容是否扎实、技术是否前沿', en: 'Solid curriculum and cutting-edge technology' }, dimensions: ['TEC'], emoji: '🚀' },
      { text: { zh: '毕业后就业机会多不多、薪资前景如何', en: 'Job prospects and salary outlook' }, dimensions: ['BUS'], emoji: '💼' },
      { text: { zh: '课程是否有创意空间、能否发挥个人风格', en: 'Creative freedom and personal expression' }, dimensions: ['CRE'], emoji: '🎨' },
      { text: { zh: '课程是否有实习机会、能否累积实务经验', en: 'Internships and practical experience' }, dimensions: ['COM', 'CAR'], emoji: '🏫' },
    ],
  },
  {
    id: 12,
    part: 'preference',
    question: {
      zh: '你希望大学的学习环境比较偏向？',
      en: 'What university environment do you prefer?',
    },
    options: [
      { text: { zh: '设备先进、资源充足、强调独立研究', en: 'Advanced facilities, resources, independent research' }, dimensions: ['TEC'], emoji: '🔬' },
      { text: { zh: '与企业链接强、有产业合作机会', en: 'Strong industry links and partnerships' }, dimensions: ['BUS'], emoji: '🤝' },
      { text: { zh: '自由度高、鼓励实验与创作', en: 'High freedom, encouraging experimentation' }, dimensions: ['CRE'], emoji: '🦋' },
      { text: { zh: '老师与学生关系密切、常有小组讨论', en: 'Close teacher-student relationships, group discussions' }, dimensions: ['CAR', 'COM'], emoji: '👥' },
    ],
  },
  {
    id: 13,
    part: 'preference',
    question: {
      zh: '你对未来的想像比较接近哪一种？',
      en: 'Which future vision resonates with you?',
    },
    options: [
      { text: { zh: '成为某个技术领域的专家', en: 'Becoming an expert in a technical field' }, dimensions: ['TEC'], emoji: '👨‍💻' },
      { text: { zh: '创业、管理团队或成为企业领导者', en: 'Entrepreneurship, management, or leadership' }, dimensions: ['BUS'], emoji: '👔' },
      { text: { zh: '从事设计、影视或艺术创作相关的工作', en: 'Design, film, or art-related work' }, dimensions: ['CRE'], emoji: '🎬' },
      { text: { zh: '从事教育、辅导、文化或媒体传播相关的工作', en: 'Education, counselling, culture, or media' }, dimensions: ['LAN', 'CAR', 'COM'], emoji: '📡' },
    ],
  },
  {
    id: 14,
    part: 'preference',
    question: {
      zh: '如果有一天你要做一份简报，你会最注重？',
      en: 'When preparing a presentation, you focus most on…',
    },
    options: [
      { text: { zh: '资料正确性、逻辑架构清晰', en: 'Accuracy and clear logical structure' }, dimensions: ['TEC'], emoji: '📊' },
      { text: { zh: '内容有说服力、能影响决策', en: 'Persuasive content that influences decisions' }, dimensions: ['BUS'], emoji: '🎯' },
      { text: { zh: '视觉设计美观、排版吸引人', en: 'Beautiful visuals and attractive layout' }, dimensions: ['CRE'], emoji: '✨' },
      { text: { zh: '表达流畅、文字精准、能让听众投入', en: 'Fluent delivery and engaging language' }, dimensions: ['COM', 'LAN'], emoji: '🎤' },
    ],
  },
  {
    id: 15,
    part: 'preference',
    question: {
      zh: '如果有一个 Project 由你主导，你会最注重？',
      en: 'If you lead a project, you prioritise…',
    },
    options: [
      { text: { zh: '技术是否到位、系统是否稳定', en: 'Solid technology and stable systems' }, dimensions: ['TEC'], emoji: '⚡' },
      { text: { zh: '预算是否合理、进度是否如期', en: 'Budget control and on-time delivery' }, dimensions: ['BUS'], emoji: '📅' },
      { text: { zh: '成果是否有创意、是否独特', en: 'Creative and unique outcomes' }, dimensions: ['CRE'], emoji: '💎' },
      { text: { zh: '团队沟通是否顺畅、大家是否满意', en: 'Smooth communication and team satisfaction' }, dimensions: ['CAR'], emoji: '❤️' },
    ],
  },
];
