/**
 * Subject catalogues per qualification.
 *
 * `id` is what gets stored in an application. `code` is the exam/syllabus code
 * printed on result slips (IGCSE, O-Level, A-Level); OCR matches on it first.
 * `native` is the name as printed on the slip (Malay for SPM, Chinese for UEC).
 * `key` marks subjects that entry rules check for.
 */

export type RequiredSubject = 'MATH' | 'BM';

export type SubjectCatalogKey = 'SPM' | 'IGCSE' | 'UEC' | 'STPM' | 'A-Level';

export interface SubjectOption {
  id: string;
  code?: string;
  native?: string;
  zh: string;
  en: string;
  key?: RequiredSubject;
  /** Extra lowercase spellings seen on slips (Malay / English / Chinese). */
  aliases?: string[];
  group: { zh: string; en: string };
}

export const OTHER_SUBJECT_ID = 'OTHER';

const G = {
  core: { zh: '核心科目', en: 'Core' },
  science: { zh: '数理科学', en: 'Mathematics & Sciences' },
  language: { zh: '语文', en: 'Languages' },
  humanities: { zh: '人文 / 商科', en: 'Humanities & Business' },
  religion: { zh: '宗教 / 道德', en: 'Religion & Moral' },
  arts: { zh: '艺术 / 技术', en: 'Arts & Technical' },
  cambridge: { zh: 'Cambridge IGCSE', en: 'Cambridge IGCSE' },
  edexcel: { zh: 'Pearson Edexcel International GCSE', en: 'Pearson Edexcel International GCSE' },
  olevel: { zh: 'Cambridge O Level', en: 'Cambridge O Level' },
  cambridgeA: { zh: 'Cambridge International AS & A Level', en: 'Cambridge International AS & A Level' },
  edexcelA: { zh: 'Pearson Edexcel International A Level', en: 'Pearson Edexcel International A Level' },
};

/* ------------------------------------------------------------------ */
/* SPM                                                                  */
/* ------------------------------------------------------------------ */

export const SPM_SUBJECTS: SubjectOption[] = [
  { id: 'SPM-BM', native: 'Bahasa Melayu', zh: '马来文', en: 'Malay Language', key: 'BM', group: G.core, aliases: ['bahasa malaysia', 'b. melayu', 'bm', 'malay language', '国文', '马来语', '1103'] },
  { id: 'SPM-BI', native: 'Bahasa Inggeris', zh: '英文', en: 'English', group: G.core, aliases: ['english', 'english language', 'b. inggeris', 'bi', '英语', '1119'] },
  { id: 'SPM-SEJ', native: 'Sejarah', zh: '历史', en: 'History', group: G.core, aliases: ['history', '1249'] },
  { id: 'SPM-MATH', native: 'Matematik', zh: '数学', en: 'Mathematics', key: 'MATH', group: G.core, aliases: ['mathematics', 'matematik moden', 'modern mathematics', 'maths', 'math', '1449'] },
  { id: 'SPM-PI', native: 'Pendidikan Islam', zh: '伊斯兰教育', en: 'Islamic Education', group: G.religion, aliases: ['islamic education', 'islamic studies', '1223'] },
  { id: 'SPM-PM', native: 'Pendidikan Moral', zh: '道德教育', en: 'Moral Education', group: G.religion, aliases: ['moral education', 'moral studies', '道德', '1225'] },

  { id: 'SPM-AMATH', native: 'Matematik Tambahan', zh: '高级数学', en: 'Additional Mathematics', group: G.science, aliases: ['additional mathematics', 'add maths', 'add math', 'addmath', '附加数学', '3472'] },
  { id: 'SPM-PHY', native: 'Fizik', zh: '物理', en: 'Physics', group: G.science, aliases: ['physics', '4531'] },
  { id: 'SPM-CHE', native: 'Kimia', zh: '化学', en: 'Chemistry', group: G.science, aliases: ['chemistry', '4541'] },
  { id: 'SPM-BIO', native: 'Biologi', zh: '生物', en: 'Biology', group: G.science, aliases: ['biology', '4551'] },
  { id: 'SPM-SCI', native: 'Sains', zh: '科学', en: 'Science', group: G.science, aliases: ['science', 'sains am', 'general science', '综合科学', '1511'] },
  { id: 'SPM-ASCI', native: 'Sains Tambahan', zh: '附加科学', en: 'Additional Science', group: G.science, aliases: ['additional science'] },
  { id: 'SPM-CS', native: 'Sains Komputer', zh: '电脑科学', en: 'Computer Science', group: G.science, aliases: ['computer science', '电脑'] },
  { id: 'SPM-ICT', native: 'Teknologi Maklumat dan Komunikasi', zh: '资讯与通讯工艺', en: 'Information & Communication Technology', group: G.science, aliases: ['information and communication technology', 'ict', 'tmk'] },
  { id: 'SPM-SSUK', native: 'Sains Sukan', zh: '运动科学', en: 'Sports Science', group: G.science, aliases: ['sports science'] },
  { id: 'SPM-SPERT', native: 'Sains Pertanian', zh: '农业科学', en: 'Agricultural Science', group: G.science, aliases: ['agricultural science', 'pertanian', 'agriculture'] },
  { id: 'SPM-SRT', native: 'Sains Rumah Tangga', zh: '家政科学', en: 'Home Science', group: G.science, aliases: ['home science'] },
  { id: 'SPM-AKEL', native: 'Asas Kelestarian', zh: '永续发展基础', en: 'Fundamentals of Sustainability', group: G.science, aliases: ['fundamentals of sustainability'] },

  { id: 'SPM-BC', native: 'Bahasa Cina', zh: '华文', en: 'Chinese Language', group: G.language, aliases: ['chinese language', 'chinese', 'mandarin', '中文', '华语', '6351'] },
  { id: 'SPM-KC', native: 'Kesusasteraan Cina', zh: '华文文学', en: 'Chinese Literature', group: G.language, aliases: ['chinese literature', '中华文学'] },
  { id: 'SPM-BT', native: 'Bahasa Tamil', zh: '淡米尔文', en: 'Tamil Language', group: G.language, aliases: ['tamil language', 'tamil'] },
  { id: 'SPM-KT', native: 'Kesusasteraan Tamil', zh: '淡米尔文学', en: 'Tamil Literature', group: G.language, aliases: ['tamil literature'] },
  { id: 'SPM-LIT', native: 'Literature in English', zh: '英国文学', en: 'Literature in English', group: G.language, aliases: ['english literature', '英文文学'] },
  { id: 'SPM-KMK', native: 'Kesusasteraan Melayu Komunikatif', zh: '马来文学', en: 'Communicative Malay Literature', group: G.language, aliases: ['kesusasteraan melayu', 'malay literature'] },
  { id: 'SPM-BA', native: 'Bahasa Arab', zh: '阿拉伯文', en: 'Arabic Language', group: G.language, aliases: ['arabic'] },
  { id: 'SPM-BIBAN', native: 'Bahasa Iban', zh: '伊班文', en: 'Iban Language', group: G.language, aliases: ['iban'] },
  { id: 'SPM-BKD', native: 'Bahasa Kadazandusun', zh: '卡达山杜顺文', en: 'Kadazandusun Language', group: G.language, aliases: ['kadazandusun'] },
  { id: 'SPM-BPJ', native: 'Bahasa Punjabi', zh: '旁遮普文', en: 'Punjabi Language', group: G.language, aliases: ['punjabi'] },
  { id: 'SPM-BJP', native: 'Bahasa Jepun', zh: '日文', en: 'Japanese Language', group: G.language, aliases: ['japanese'] },
  { id: 'SPM-BPR', native: 'Bahasa Perancis', zh: '法文', en: 'French Language', group: G.language, aliases: ['french'] },
  { id: 'SPM-BJR', native: 'Bahasa Jerman', zh: '德文', en: 'German Language', group: G.language, aliases: ['german'] },

  { id: 'SPM-GEO', native: 'Geografi', zh: '地理', en: 'Geography', group: G.humanities, aliases: ['geography'] },
  { id: 'SPM-EKO', native: 'Ekonomi', zh: '经济', en: 'Economics', group: G.humanities, aliases: ['economics', 'ekonomi asas', '经济学'] },
  { id: 'SPM-PERN', native: 'Perniagaan', zh: '商业', en: 'Business', group: G.humanities, aliases: ['business', 'business studies', '商业学'] },
  { id: 'SPM-PA', native: 'Prinsip Perakaunan', zh: '会计原理', en: 'Principles of Accounting', group: G.humanities, aliases: ['principles of accounting', 'prinsip akaun', 'perakaunan', 'accounting', 'accounts', '会计', '簿记与会计', '3756'] },
  { id: 'SPM-PK', native: 'Pengajian Keusahawanan', zh: '企业学', en: 'Entrepreneurship Studies', group: G.humanities, aliases: ['entrepreneurship'] },

  { id: 'SPM-TI', native: 'Tasawwur Islam', zh: '伊斯兰概念', en: 'Tasawwur Islam', group: G.religion },
  { id: 'SPM-PQS', native: 'Pendidikan Al-Quran dan As-Sunnah', zh: '古兰经与圣训教育', en: 'Al-Quran & As-Sunnah Education', group: G.religion, aliases: ['al-quran', 'as-sunnah'] },
  { id: 'SPM-PSI', native: 'Pendidikan Syariah Islamiah', zh: '伊斯兰律法教育', en: 'Islamic Syariah Education', group: G.religion, aliases: ['syariah islamiah'] },

  { id: 'SPM-PSV', native: 'Pendidikan Seni Visual', zh: '美术', en: 'Visual Art Education', group: G.arts, aliases: ['visual art', 'seni visual', 'seni halus', 'art'] },
  { id: 'SPM-MUZ', native: 'Pendidikan Muzik', zh: '音乐', en: 'Music Education', group: G.arts, aliases: ['music', 'muzik'] },
  { id: 'SPM-RC', native: 'Reka Cipta', zh: '设计与创新', en: 'Invention', group: G.arts, aliases: ['invention'] },
  { id: 'SPM-GKT', native: 'Grafik Komunikasi Teknikal', zh: '工程绘图', en: 'Technical Graphic Communication', group: G.arts, aliases: ['grafik komunikasi', 'graphic communication'] },
  { id: 'SPM-LK', native: 'Lukisan Kejuruteraan', zh: '工程制图', en: 'Engineering Drawing', group: G.arts, aliases: ['engineering drawing'] },
  { id: 'SPM-PKA', native: 'Pengajian Kejuruteraan Awam', zh: '土木工程', en: 'Civil Engineering Studies', group: G.arts, aliases: ['civil engineering'] },
  { id: 'SPM-PKM', native: 'Pengajian Kejuruteraan Mekanikal', zh: '机械工程', en: 'Mechanical Engineering Studies', group: G.arts, aliases: ['mechanical engineering'] },
  { id: 'SPM-PKE', native: 'Pengajian Kejuruteraan Elektrik dan Elektronik', zh: '电机电子工程', en: 'Electrical & Electronic Engineering Studies', group: G.arts, aliases: ['electrical and electronic engineering'] },
];

/* ------------------------------------------------------------------ */
/* IGCSE / O-Level                                                      */
/* ------------------------------------------------------------------ */

function ig(code: string, en: string, zh: string, group: SubjectOption['group'], extra: Partial<SubjectOption> = {}): SubjectOption {
  return { id: `IG-${code}`, code, en, zh, group, ...extra };
}

export const IGCSE_SUBJECTS: SubjectOption[] = [
  // Cambridge IGCSE
  ig('0500', 'English – First Language', '英文（第一语言）', G.cambridge, { aliases: ['english first language', 'first language english', 'english language'] }),
  ig('0510', 'English as a Second Language (Speaking endorsement)', '英文（第二语言）', G.cambridge, { aliases: ['english as a second language', 'esl'] }),
  ig('0511', 'English as a Second Language (Count-in speaking)', '英文（第二语言·含口试）', G.cambridge, { aliases: ['english as a second language', 'esl'] }),
  ig('0475', 'Literature in English', '英国文学', G.cambridge, { aliases: ['literature in english', 'english literature'] }),
  ig('0509', 'Chinese – First Language', '华文（第一语言）', G.cambridge, { aliases: ['chinese first language', 'first language chinese'] }),
  ig('0523', 'Chinese – Second Language', '华文（第二语言）', G.cambridge, { aliases: ['chinese second language', 'chinese as a second language'] }),
  ig('0547', 'Mandarin Chinese – Foreign Language', '华语（外语）', G.cambridge, { aliases: ['mandarin chinese', 'mandarin'] }),
  ig('0546', 'Malay – Foreign Language', '马来文（外语）', G.cambridge, { key: 'BM', aliases: ['malay foreign language', 'malay'] }),
  ig('0696', 'Malay – First Language', '马来文（第一语言）', G.cambridge, { key: 'BM', aliases: ['malay first language', 'bahasa melayu'] }),
  ig('0520', 'French – Foreign Language', '法文', G.cambridge, { aliases: ['french'] }),
  ig('0525', 'German – Foreign Language', '德文', G.cambridge, { aliases: ['german'] }),
  ig('0530', 'Spanish – Foreign Language', '西班牙文', G.cambridge, { aliases: ['spanish'] }),
  ig('0544', 'Arabic – Foreign Language', '阿拉伯文', G.cambridge, { aliases: ['arabic'] }),
  ig('0580', 'Mathematics', '数学', G.cambridge, { key: 'MATH', aliases: ['mathematics', 'maths', 'math'] }),
  ig('0980', 'Mathematics (9–1)', '数学（9–1）', G.cambridge, { key: 'MATH', aliases: ['mathematics', 'maths', 'math'] }),
  ig('0607', 'International Mathematics', '国际数学', G.cambridge, { key: 'MATH', aliases: ['international mathematics'] }),
  ig('0606', 'Additional Mathematics', '高级数学', G.cambridge, { aliases: ['additional mathematics', 'add maths', 'add math'] }),
  ig('0610', 'Biology', '生物', G.cambridge, { aliases: ['biology'] }),
  ig('0970', 'Biology (9–1)', '生物（9–1）', G.cambridge, { aliases: ['biology'] }),
  ig('0620', 'Chemistry', '化学', G.cambridge, { aliases: ['chemistry'] }),
  ig('0971', 'Chemistry (9–1)', '化学（9–1）', G.cambridge, { aliases: ['chemistry'] }),
  ig('0625', 'Physics', '物理', G.cambridge, { aliases: ['physics'] }),
  ig('0972', 'Physics (9–1)', '物理（9–1）', G.cambridge, { aliases: ['physics'] }),
  ig('0653', 'Combined Science', '综合科学', G.cambridge, { aliases: ['combined science'] }),
  ig('0654', 'Co-ordinated Sciences (Double Award)', '协调科学（双奖）', G.cambridge, { aliases: ['co-ordinated sciences', 'coordinated sciences'] }),
  ig('0680', 'Environmental Management', '环境管理', G.cambridge, { aliases: ['environmental management'] }),
  ig('0478', 'Computer Science', '电脑科学', G.cambridge, { aliases: ['computer science'] }),
  ig('0984', 'Computer Science (9–1)', '电脑科学（9–1）', G.cambridge, { aliases: ['computer science'] }),
  ig('0417', 'Information and Communication Technology', '资讯与通讯工艺', G.cambridge, { aliases: ['information and communication technology', 'ict'] }),
  ig('0983', 'Information and Communication Technology (9–1)', '资讯与通讯工艺（9–1）', G.cambridge, { aliases: ['information and communication technology', 'ict'] }),
  ig('0452', 'Accounting', '会计', G.cambridge, { aliases: ['accounting', 'accounts'] }),
  ig('0985', 'Accounting (9–1)', '会计（9–1）', G.cambridge, { aliases: ['accounting', 'accounts'] }),
  ig('0450', 'Business Studies', '商业学', G.cambridge, { aliases: ['business studies', 'business'] }),
  ig('0986', 'Business Studies (9–1)', '商业学（9–1）', G.cambridge, { aliases: ['business studies', 'business'] }),
  ig('0455', 'Economics', '经济学', G.cambridge, { aliases: ['economics'] }),
  ig('0987', 'Economics (9–1)', '经济学（9–1）', G.cambridge, { aliases: ['economics'] }),
  ig('0454', 'Enterprise', '企业学', G.cambridge, { aliases: ['enterprise'] }),
  ig('0471', 'Travel and Tourism', '旅游', G.cambridge, { aliases: ['travel and tourism'] }),
  ig('0460', 'Geography', '地理', G.cambridge, { aliases: ['geography'] }),
  ig('0976', 'Geography (9–1)', '地理（9–1）', G.cambridge, { aliases: ['geography'] }),
  ig('0470', 'History', '历史', G.cambridge, { aliases: ['history'] }),
  ig('0977', 'History (9–1)', '历史（9–1）', G.cambridge, { aliases: ['history'] }),
  ig('0495', 'Sociology', '社会学', G.cambridge, { aliases: ['sociology'] }),
  ig('0457', 'Global Perspectives', '全球视野', G.cambridge, { aliases: ['global perspectives'] }),
  ig('0490', 'Religious Studies', '宗教研究', G.cambridge, { aliases: ['religious studies'] }),
  ig('0400', 'Art and Design', '美术与设计', G.cambridge, { aliases: ['art and design', 'art & design'] }),
  ig('0989', 'Art and Design (9–1)', '美术与设计（9–1）', G.cambridge, { aliases: ['art and design', 'art & design'] }),
  ig('0445', 'Design and Technology', '设计与技术', G.cambridge, { aliases: ['design and technology'] }),
  ig('0411', 'Drama', '戏剧', G.cambridge, { aliases: ['drama'] }),
  ig('0410', 'Music', '音乐', G.cambridge, { aliases: ['music'] }),
  ig('0413', 'Physical Education', '体育', G.cambridge, { aliases: ['physical education'] }),
  ig('0648', 'Food and Nutrition', '食品与营养', G.cambridge, { aliases: ['food and nutrition'] }),

  // Pearson Edexcel International GCSE
  ig('4MA1', 'Mathematics A', '数学 A', G.edexcel, { key: 'MATH', aliases: ['mathematics a', 'mathematics'] }),
  ig('4MB1', 'Mathematics B', '数学 B', G.edexcel, { key: 'MATH', aliases: ['mathematics b', 'mathematics'] }),
  ig('4PM1', 'Further Pure Mathematics', '高级纯数学', G.edexcel, { aliases: ['further pure mathematics'] }),
  ig('4EA1', 'English Language A', '英文 A', G.edexcel, { aliases: ['english language a', 'english language'] }),
  ig('4EB1', 'English Language B', '英文 B', G.edexcel, { aliases: ['english language b'] }),
  ig('4ES1', 'English as a Second Language', '英文（第二语言）', G.edexcel, { aliases: ['english as a second language'] }),
  ig('4ET1', 'English Literature', '英国文学', G.edexcel, { aliases: ['english literature'] }),
  ig('4CN1', 'Chinese', '华文', G.edexcel, { aliases: ['chinese'] }),
  ig('4PH1', 'Physics', '物理', G.edexcel, { aliases: ['physics'] }),
  ig('4CH1', 'Chemistry', '化学', G.edexcel, { aliases: ['chemistry'] }),
  ig('4BI1', 'Biology', '生物', G.edexcel, { aliases: ['biology'] }),
  ig('4SD0', 'Science (Double Award)', '科学（双奖）', G.edexcel, { aliases: ['science double award'] }),
  ig('4CP0', 'Computer Science', '电脑科学', G.edexcel, { aliases: ['computer science'] }),
  ig('4IT1', 'Information and Communication Technology', '资讯与通讯工艺', G.edexcel, { aliases: ['information and communication technology', 'ict'] }),
  ig('4AC1', 'Accounting', '会计', G.edexcel, { aliases: ['accounting'] }),
  ig('4BS1', 'Business', '商业学', G.edexcel, { aliases: ['business'] }),
  ig('4EC1', 'Economics', '经济学', G.edexcel, { aliases: ['economics'] }),
  ig('4GE1', 'Geography', '地理', G.edexcel, { aliases: ['geography'] }),
  ig('4HI1', 'History', '历史', G.edexcel, { aliases: ['history'] }),
  ig('4RS1', 'Religious Studies', '宗教研究', G.edexcel, { aliases: ['religious studies'] }),

  // Cambridge O Level
  ig('1123', 'English Language (O Level)', '英文（O Level）', G.olevel, { aliases: ['english language'] }),
  ig('4024', 'Mathematics D (O Level)', '数学 D（O Level）', G.olevel, { key: 'MATH', aliases: ['mathematics d', 'mathematics (syllabus d)', 'mathematics'] }),
  ig('4037', 'Additional Mathematics (O Level)', '高级数学（O Level）', G.olevel, { aliases: ['additional mathematics'] }),
  ig('5054', 'Physics (O Level)', '物理（O Level）', G.olevel, { aliases: ['physics'] }),
  ig('5070', 'Chemistry (O Level)', '化学（O Level）', G.olevel, { aliases: ['chemistry'] }),
  ig('5090', 'Biology (O Level)', '生物（O Level）', G.olevel, { aliases: ['biology'] }),
  ig('7707', 'Accounting (O Level)', '会计（O Level）', G.olevel, { aliases: ['accounting', 'principles of accounts'] }),
  ig('7115', 'Business Studies (O Level)', '商业学（O Level）', G.olevel, { aliases: ['business studies'] }),
  ig('2281', 'Economics (O Level)', '经济学（O Level）', G.olevel, { aliases: ['economics'] }),
  ig('2210', 'Computer Science (O Level)', '电脑科学（O Level）', G.olevel, { aliases: ['computer science'] }),
  ig('2217', 'Geography (O Level)', '地理（O Level）', G.olevel, { aliases: ['geography'] }),
  ig('2147', 'History (O Level)', '历史（O Level）', G.olevel, { aliases: ['history'] }),
];

/* ------------------------------------------------------------------ */
/* UEC (Senior Middle)                                                  */
/* ------------------------------------------------------------------ */

export const UEC_SUBJECTS: SubjectOption[] = [
  { id: 'UEC-CHI', native: '华文', zh: '华文', en: 'Chinese', group: G.core, aliases: ['chinese', '中文'] },
  { id: 'UEC-BM', native: '国文', zh: '国文（马来文）', en: 'Bahasa Malaysia', key: 'BM', group: G.core, aliases: ['bahasa malaysia', 'bahasa melayu', 'malay', '马来文'] },
  { id: 'UEC-ENG', native: '英文', zh: '英文', en: 'English', group: G.core, aliases: ['english'] },
  { id: 'UEC-MATH', native: '数学', zh: '数学', en: 'Mathematics', key: 'MATH', group: G.core, aliases: ['mathematics', 'maths'] },
  { id: 'UEC-AM1', native: '高级数学（I）', zh: '高级数学（I）', en: 'Advanced Mathematics (I)', group: G.science, aliases: ['高级数学(i)', '高级数学 i', '高级数学', 'advanced mathematics (i)', 'advanced mathematics i', 'advanced mathematics'] },
  { id: 'UEC-AM2', native: '高级数学（II）', zh: '高级数学（II）', en: 'Advanced Mathematics (II)', group: G.science, aliases: ['高级数学(ii)', '高级数学 ii', 'advanced mathematics (ii)', 'advanced mathematics ii'] },
  { id: 'UEC-PHY', native: '物理', zh: '物理', en: 'Physics', group: G.science, aliases: ['physics'] },
  { id: 'UEC-CHE', native: '化学', zh: '化学', en: 'Chemistry', group: G.science, aliases: ['chemistry'] },
  { id: 'UEC-BIO', native: '生物', zh: '生物', en: 'Biology', group: G.science, aliases: ['biology'] },
  { id: 'UEC-ICT', native: '电脑与资讯工艺', zh: '电脑与资讯工艺', en: 'Computing & ICT', group: G.science, aliases: ['computing and information technology', 'computing & ict', 'computer', '电脑'] },
  { id: 'UEC-HIST', native: '历史', zh: '历史', en: 'History', group: G.humanities, aliases: ['history'] },
  { id: 'UEC-GEO', native: '地理', zh: '地理', en: 'Geography', group: G.humanities, aliases: ['geography'] },
  { id: 'UEC-ACC', native: '簿记与会计', zh: '簿记与会计', en: 'Bookkeeping & Accounting', group: G.humanities, aliases: ['bookkeeping and accounts', 'bookkeeping & accounting', 'accounting', '会计'] },
  { id: 'UEC-COM', native: '商业学', zh: '商业学', en: 'Commerce', group: G.humanities, aliases: ['commerce', 'business studies', '商业'] },
  { id: 'UEC-ECO', native: '经济学', zh: '经济学', en: 'Economics', group: G.humanities, aliases: ['economics', '经济'] },
  { id: 'UEC-ART', native: '美术', zh: '美术', en: 'Art', group: G.arts, aliases: ['art', 'fine art'] },
  { id: 'UEC-ELEC', native: '电子学', zh: '电子学', en: 'Electronics', group: G.arts, aliases: ['electronics'] },
  { id: 'UEC-ED', native: '工程制图', zh: '工程制图', en: 'Engineering Drawing', group: G.arts, aliases: ['engineering drawing'] },
];

/* ------------------------------------------------------------------ */
/* STPM                                                                 */
/* ------------------------------------------------------------------ */

export const STPM_SUBJECTS: SubjectOption[] = [
  { id: 'STPM-PA', native: 'Pengajian Am', zh: '通识', en: 'General Studies', group: G.core, aliases: ['general studies'] },
  { id: 'STPM-BM', native: 'Bahasa Melayu', zh: '马来文', en: 'Malay Language', key: 'BM', group: G.language, aliases: ['malay language'] },
  { id: 'STPM-BC', native: 'Bahasa Cina', zh: '华文', en: 'Chinese Language', group: G.language, aliases: ['chinese language', 'chinese'] },
  { id: 'STPM-BT', native: 'Bahasa Tamil', zh: '淡米尔文', en: 'Tamil Language', group: G.language, aliases: ['tamil'] },
  { id: 'STPM-BA', native: 'Bahasa Arab', zh: '阿拉伯文', en: 'Arabic Language', group: G.language, aliases: ['arabic'] },
  { id: 'STPM-LIT', native: 'Literature in English', zh: '英国文学', en: 'Literature in English', group: G.language, aliases: ['english literature'] },
  { id: 'STPM-KMK', native: 'Kesusasteraan Melayu Komunikatif', zh: '马来文学', en: 'Communicative Malay Literature', group: G.language, aliases: ['kesusasteraan melayu'] },
  { id: 'STPM-MM', native: 'Matematik (M)', zh: '数学（M）', en: 'Mathematics (M)', key: 'MATH', group: G.science, aliases: ['matematik m', 'mathematics (m)', 'mathematics m'] },
  { id: 'STPM-MT', native: 'Matematik (T)', zh: '数学（T）', en: 'Mathematics (T)', key: 'MATH', group: G.science, aliases: ['matematik t', 'mathematics (t)', 'mathematics t'] },
  { id: 'STPM-PHY', native: 'Fizik', zh: '物理', en: 'Physics', group: G.science, aliases: ['physics'] },
  { id: 'STPM-CHE', native: 'Kimia', zh: '化学', en: 'Chemistry', group: G.science, aliases: ['chemistry'] },
  { id: 'STPM-BIO', native: 'Biologi', zh: '生物', en: 'Biology', group: G.science, aliases: ['biology'] },
  { id: 'STPM-ICT', native: 'Teknologi Maklumat dan Komunikasi', zh: '资讯与通讯工艺', en: 'Information & Communication Technology', group: G.science, aliases: ['ict'] },
  { id: 'STPM-SSUK', native: 'Sains Sukan', zh: '运动科学', en: 'Sports Science', group: G.science, aliases: ['sports science'] },
  { id: 'STPM-SEJ', native: 'Sejarah', zh: '历史', en: 'History', group: G.humanities, aliases: ['history'] },
  { id: 'STPM-GEO', native: 'Geografi', zh: '地理', en: 'Geography', group: G.humanities, aliases: ['geography'] },
  { id: 'STPM-EKO', native: 'Ekonomi', zh: '经济学', en: 'Economics', group: G.humanities, aliases: ['economics'] },
  { id: 'STPM-PP', native: 'Pengajian Perniagaan', zh: '商业学', en: 'Business Studies', group: G.humanities, aliases: ['business studies'] },
  { id: 'STPM-PERAK', native: 'Perakaunan', zh: '会计', en: 'Accounting', group: G.humanities, aliases: ['accounting'] },
  { id: 'STPM-TI', native: 'Tasawwur Islam', zh: '伊斯兰概念', en: 'Tasawwur Islam', group: G.religion },
  { id: 'STPM-PSI', native: 'Syariah', zh: '伊斯兰律法', en: 'Syariah', group: G.religion },
  { id: 'STPM-PSV', native: 'Seni Visual', zh: '美术', en: 'Visual Arts', group: G.arts, aliases: ['visual arts'] },
];

/* ------------------------------------------------------------------ */
/* A-Level                                                              */
/* ------------------------------------------------------------------ */

function al(code: string, en: string, zh: string, group: SubjectOption['group'], extra: Partial<SubjectOption> = {}): SubjectOption {
  return { id: `AL-${code}`, code, en, zh, group, ...extra };
}

export const ALEVEL_SUBJECTS: SubjectOption[] = [
  al('9709', 'Mathematics', '数学', G.cambridgeA, { key: 'MATH', aliases: ['mathematics'] }),
  al('9231', 'Further Mathematics', '高级数学', G.cambridgeA, { aliases: ['further mathematics'] }),
  al('9702', 'Physics', '物理', G.cambridgeA, { aliases: ['physics'] }),
  al('9701', 'Chemistry', '化学', G.cambridgeA, { aliases: ['chemistry'] }),
  al('9700', 'Biology', '生物', G.cambridgeA, { aliases: ['biology'] }),
  al('9618', 'Computer Science', '电脑科学', G.cambridgeA, { aliases: ['computer science'] }),
  al('9626', 'Information Technology', '资讯工艺', G.cambridgeA, { aliases: ['information technology'] }),
  al('9706', 'Accounting', '会计', G.cambridgeA, { aliases: ['accounting'] }),
  al('9609', 'Business', '商业学', G.cambridgeA, { aliases: ['business'] }),
  al('9708', 'Economics', '经济学', G.cambridgeA, { aliases: ['economics'] }),
  al('9093', 'English Language', '英文', G.cambridgeA, { aliases: ['english language'] }),
  al('9695', 'Literature in English', '英国文学', G.cambridgeA, { aliases: ['literature in english'] }),
  al('9696', 'Geography', '地理', G.cambridgeA, { aliases: ['geography'] }),
  al('9489', 'History', '历史', G.cambridgeA, { aliases: ['history'] }),
  al('9990', 'Psychology', '心理学', G.cambridgeA, { aliases: ['psychology'] }),
  al('9699', 'Sociology', '社会学', G.cambridgeA, { aliases: ['sociology'] }),
  al('9084', 'Law', '法律', G.cambridgeA, { aliases: ['law'] }),
  al('9479', 'Art and Design', '美术与设计', G.cambridgeA, { aliases: ['art and design'] }),
  al('9395', 'Travel and Tourism', '旅游', G.cambridgeA, { aliases: ['travel and tourism'] }),
  al('WMA1', 'Mathematics (IAL)', '数学（IAL）', G.edexcelA, { key: 'MATH', aliases: ['mathematics'] }),
  al('WPH1', 'Physics (IAL)', '物理（IAL）', G.edexcelA, { aliases: ['physics'] }),
  al('WCH1', 'Chemistry (IAL)', '化学（IAL）', G.edexcelA, { aliases: ['chemistry'] }),
  al('WBI1', 'Biology (IAL)', '生物（IAL）', G.edexcelA, { aliases: ['biology'] }),
  al('WAC1', 'Accounting (IAL)', '会计（IAL）', G.edexcelA, { aliases: ['accounting'] }),
  al('WEC1', 'Economics (IAL)', '经济学（IAL）', G.edexcelA, { aliases: ['economics'] }),
  al('WBS1', 'Business (IAL)', '商业学（IAL）', G.edexcelA, { aliases: ['business'] }),
];

/* ------------------------------------------------------------------ */
/* Lookups                                                              */
/* ------------------------------------------------------------------ */

const CATALOGS: Record<SubjectCatalogKey, SubjectOption[]> = {
  SPM: SPM_SUBJECTS,
  IGCSE: IGCSE_SUBJECTS,
  UEC: UEC_SUBJECTS,
  STPM: STPM_SUBJECTS,
  'A-Level': ALEVEL_SUBJECTS,
};

const ALL_SUBJECTS = Object.values(CATALOGS).flat();
const BY_ID = new Map(ALL_SUBJECTS.map((s) => [s.id, s]));

/** Subjects offered for a qualification; empty for CGPA-based quals. */
export function subjectsFor(qualification: string | null | undefined): SubjectOption[] {
  if (!qualification) return [];
  return CATALOGS[qualification as SubjectCatalogKey] ?? [];
}

export function findSubject(id: string | null | undefined): SubjectOption | undefined {
  return id ? BY_ID.get(id) : undefined;
}

/** Label shown in pickers / summaries, e.g. "0580 Mathematics · 数学". */
export function subjectLabel(option: SubjectOption, lang: 'zh' | 'en'): string {
  const primary = option.native ?? option.en;
  const secondary = lang === 'zh' ? option.zh : option.native ? option.en : '';
  const tail = secondary && secondary !== primary ? ` · ${secondary}` : '';
  return `${option.code ? `${option.code} ` : ''}${primary}${tail}`;
}

/** Search keywords for the combobox. */
export function subjectKeywords(option: SubjectOption): string[] {
  return [option.code, option.native, option.zh, option.en, ...(option.aliases ?? [])].filter(
    (v): v is string => Boolean(v),
  );
}
