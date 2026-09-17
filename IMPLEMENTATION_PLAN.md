# Course Discovery Platform — 完整实施排期

> 基于 `wiii/Course Discovery & Student Recruitment Platform.md` 规格  
> 目标：DISCOVER → CONSIDER → CONVERT 全链路落地

---

## 总览

| 阶段 | 内容 | 工期 | 状态 |
|------|------|------|------|
| Phase 1 | 数据层：15 题、六维评分、Course Profile、匹配算法 | 1–2 天 | 进行中 |
| Phase 2 | DISCOVER：结果页、Marketing、Foundation | 2–3 天 | 待开始 |
| Phase 3 | CONSIDER：Shortlist、导航 IA、课程详情 | 1–2 天 | 待开始 |
| Phase 4 | CONVERT：WhatsApp、留资、线上报名、API | 2–3 天 | 待开始 |
| Phase 5 | 整合、测试、 polish | 1 天 | 待开始 |

**预估总工期：7–11 个工作日**

---

## Phase 1 — 数据与算法层

### 1.1 测验题库 (`src/data/quiz.ts`)
- [x] 15 题（Part A Interest ×5、Part B Strength ×5、Part C Preference ×5）
- [x] 六维选项映射（TEC / BUS / CRE / COM / LAN / CAR）
- [x] 多维度选项分数均分（总贡献 = 1）
- [x] Part 权重：Interest 40% / Strength 35% / Preference 25%

### 1.2 维度定义 (`src/data/dimensions.ts`)
- [x] 维度标签、emoji、双语名称
- [x] 导出 `DIMENSIONS` 常量数组

### 1.3 课程 Profile (`src/data/course-profiles.ts`)
- [x] 30 门课六维权重（总和 = 1）
- [x] 基于科系与课程性质人工标定

### 1.4 匹配算法 (`src/lib/course-matching.ts`)
- [x] 加权维度分数计算
- [x] 课程匹配排序
- [x] 三层推荐（🥇🥈🥉）
- [x] Interest vs Strength 一致性判断
- [x] Foundation 推荐逻辑

---

## Phase 2 — DISCOVER 阶段

### 2.1 测验 UI (`src/components/course-quiz.tsx`)
- [x] 15 题流程 + Part 分段指示
- [x] 六维雷达/条形图结果
- [x] 三层课程推荐 + 可解释说明
- [x] Foundation 建议卡片
- [x] 重测 / 修改答案

### 2.2 Marketing (`src/components/why-choose-us.tsx`)
- [x] 五大卖点区块
- [x] 学术领域快捷入口

### 2.3 Foundation (`src/components/foundation-section.tsx`)
- [x] 探索定位文案
- [x] FCC / FIA 课程卡片
- [x] CTA 链至 catalog 筛选

---

## Phase 3 — CONSIDER 阶段

### 3.1 Shortlist (`src/store/use-shortlist.ts`)
- [x] 加入/移除/清空
- [x] 与 Compare 联动

### 3.2 导航 (`src/components/navbar.tsx`)
- [x] Home / Courses / Discovery / Compare / Foundation / Contact / Apply
- [x] Compare & Shortlist 计数徽章

### 3.3 课程详情增强 (`src/components/course/course-detail.tsx`)
- [x] Who Is This Course For
- [x] WhatsApp + Apply CTA
- [x] Shortlist 按钮

### 3.4 课程目录
- [x] Shortlist 筛选/浮条
- [x] 字段浏览 chips

---

## Phase 4 — CONVERT 阶段

### 4.1 WhatsApp (`src/lib/contact.ts`)
- [x] 预设讯息生成（含测验结果、课程名）
- [x] `NEXT_PUBLIC_WHATSAPP_NUMBER` 环境变量

### 4.2 留资 (`src/components/lead-capture.tsx`)
- [x] 结果后可选保存（Give Value First）
- [x] 写入 Inquiry + quizResult JSON

### 4.3 线上报名 (`src/components/application-form.tsx`)
- [x] 6 步流程 UI
- [x] 课程预选 + Condition Pre-check
- [x] 提交确认页

### 4.4 后端
- [x] Prisma `Application` model
- [x] `POST /api/application`
- [x] Inquiry API 支持 discovery profile

---

## Phase 5 — 整合与验收

### 5.1 页面整合 (`src/app/page.tsx`)
- [x] 区块顺序：Hero → Why Choose Us → Quiz → Catalog → Foundation → Inquiry → Application
- [x] 全局状态：quiz result → inquiry/apply 预选

### 5.2 验收清单
- [ ] 15 题测验完整流程
- [ ] 六维分数与推荐合理
- [ ] Compare ≤3 门课
- [ ] Shortlist 持久化（session）
- [ ] WhatsApp 链接可打开
- [ ] 咨询/报名表单提交成功
- [ ] 中英切换全覆盖
- [ ] 移动端响应式

---

## 文件结构（新增/修改）

```
src/
├── data/
│   ├── dimensions.ts          NEW
│   ├── quiz.ts                REWRITE
│   └── course-profiles.ts     NEW
├── lib/
│   ├── course-matching.ts     NEW
│   └── contact.ts             NEW
├── store/
│   ├── use-shortlist.ts       NEW
│   └── use-discovery.ts       NEW
├── components/
│   ├── why-choose-us.tsx      NEW
│   ├── foundation-section.tsx NEW
│   ├── lead-capture.tsx       NEW
│   ├── application-form.tsx   NEW
│   ├── course-quiz.tsx        REWRITE
│   ├── navbar.tsx             UPDATE
│   └── course/                UPDATE
└── app/api/application/       NEW
```

---

## 依赖关系

```text
dimensions.ts
     ↓
quiz.ts ──→ course-matching.ts ←── course-profiles.ts
     ↓              ↓
course-quiz.tsx   lead-capture / application-form
     ↓
page.tsx ← navbar / catalog / detail / foundation / why-choose-us
```

---

## 后续可选增强（V2）

- 多路由 SEO（/courses/[id]）
- ~~Admin 后台查看 Inquiry / Application~~ ✅ `/admin`
- ~~报名成绩表 + 课程门槛预检（含数学要求）~~ ✅
- 入学资格智能匹配（更细的 STPM/UEC 规则）
- 邮件通知 webhook
- Analytics 漏斗追踪
- Admin 强化：角色权限、导出 CSV、招生通知
