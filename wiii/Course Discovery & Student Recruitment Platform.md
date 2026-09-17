# Course Discovery & Student Recruitment Platform

## 1. Project Overview

本项目是一套以 **Course Discovery（课程探索）** 为核心的大学招生与课程推荐平台。

系统的目标不是单纯告诉学生「你适合什么职业」，而是通过：

> **了解学生 → 分析兴趣与能力 → 推荐课程 → 比较课程 → 探索其他选择 → 联系课程顾问 / 线上报名**

帮助学生从「不知道应该读什么」逐渐走向「了解课程并做出升学决定」。

整个系统采用：

> **DISCOVER → CONSIDER → CONVERT**

三阶段架构。

---

# 2. Project Objectives

系统主要解决高中毕业生在升学过程中常见的问题：

- 不确定自己适合什么领域
- 不知道不同 Course 有什么区别
- 不清楚课程实际会学什么
- 不知道课程毕业后可以从事什么工作
- 很难同时比较多个课程
- 对学费、入学条件、学制等现实条件缺乏了解
- 已经有兴趣，但不知道下一步应该做什么
- 对多个领域都有兴趣，因此容易产生选择困难

因此，系统提供：

1. Course Discovery Test
2. Six-Dimension Student Profile
3. Personalised Course Recommendation
4. Course Comparison
5. Course Explorer
6. Foundation Exploration Path
7. Course Advisor Contact
8. Online Application

---

# 3. Overall User Journey

```text
                         HOME
                          │
                          ▼
                    MARKETING
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
       Browse Courses          Course Discovery
             │                         │
             │                         ▼
             │                  15 Questions
             │                         │
             │                         ▼
             │               Student Profile
             │                         │
             └──────────────┬──────────┘
                            ▼
                     COURSE DETAILS
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
           Compare       Shortlist     Foundation
              │             │             │
              └─────────────┼─────────────┘
                            ▼
                        CONVERT
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
       Contact Advisor              Apply Online
              │                           │
              ▼                           ▼
           WhatsApp                  Application
                                          │
                                          ▼
                                   Submit Application
```

---

# 4. Information Architecture

## Main Navigation

```text
Logo

Home
Courses
Course Discovery
Compare
Foundation
About Us

Contact Us
Apply Now
```

### Navigation Purpose

| Navigation | Purpose |
|---|---|
| Home | Marketing、学校介绍、主要 CTA |
| Courses | 浏览全部课程 |
| Course Discovery | 进行 15 题课程探索测验 |
| Compare | 比较多个课程 |
| Foundation | 了解 Foundation 作为探索阶段的作用 |
| About Us | 学校 / 学院资讯 |
| Contact Us | 联系课程顾问 |
| Apply Now | 线上报名 |

---

# 5. Three-Stage Platform Architecture

## 5.1 DISCOVER — 发现

目标：

> 帮助学生认识自己，并发现可能适合的学术方向。

主要功能：

- Homepage Marketing
- Course Discovery Test
- Six-Dimension Profile
- Course Recommendation
- Browse All Courses

---

## 5.2 CONSIDER — 考虑

目标：

> 帮助学生进一步了解和比较不同课程。

主要功能：

- Course Details
- Course Comparison
- Shortlist
- Career Path
- Tuition Fee
- Entry Requirements
- Course Content
- Learning Experience
- Foundation Exploration

---

## 5.3 CONVERT — 转化

目标：

> 将已经产生兴趣的学生引导至咨询或正式报名。

主要功能：

- Contact Course Advisor
- WhatsApp Consultation
- Consultation Form
- Online Application
- Application Condition Pre-check
- Application Submission

---

# 6. Homepage Marketing Strategy

首页不应该一打开就要求学生完成 15 题测试。

首页首先应该承担 **Marketing Page** 的功能。

---

## 6.1 Hero Section

主要目的：

> 在几秒内让学生知道这个网站可以帮助他们找到适合自己的课程。

示例结构：

```text
Find the Course That Fits You.

Not sure what to study after school?

Explore your interests, discover suitable courses,
and find your next step.

[ Start Course Discovery ]

[ Explore All Courses ]
```

---

# 6.2 Why Choose Us

建议设置五个核心卖点：

### 🎓 多元学术领域

提供多个不同领域的 Degree、Diploma 与 Foundation 选择。

例如：

- IT
- Business
- Design
- Media
- Psychology
- Education
- Language
- Finance

---

### 💰 透明化的学费资讯

课程页面提供清楚的学费资讯，让学生和家长能够提前规划升学预算。

---

### 📚 理论与实务并重

通过课程项目、实践活动、产业合作或实习机会，让学生不仅学习理论，也能够累积实际经验。

---

### 💼 明确的职业方向

每个课程都会说明：

```text
Course
   ↓
Skills
   ↓
Possible Career Paths
```

职业资讯主要作为：

> **Course 的解释层**

而不是用职业直接决定学生应该选择什么 Course。

---

### 🧭 个性化课程建议

通过 Course Discovery Test：

```text
Interest
+
Strength
+
Preference
        ↓
Student Profile
        ↓
Course Recommendation
```

帮助学生发现适合进一步了解的课程。

---

# 7. Course Discovery Test

## 7.1 Test Purpose

Course Discovery Test 的目的不是：

> 判断一个学生「应该」读什么。

而是：

> 根据学生的兴趣、能力与学习偏好，帮助学生发现值得进一步了解的课程。

---

# 8. Student Profile — Six Dimensions

系统使用六个主要维度：

| Code | Dimension |
|---|---|
| TEC | 🧠 科技与逻辑 |
| BUS | 💼 商业与管理 |
| CRE | 🎨 创意与设计 |
| COM | 🗣️ 沟通与传播 |
| LAN | 📚 语言与人文 |
| CAR | ❤️ 人文关怀与教育 |

---

## 8.1 🧠 科技与逻辑 — TEC

主要关注：

- Technology
- Programming
- Logical Thinking
- Problem Solving
- Data
- Systems

可能关联课程：

- Computer Science
- Software Engineering
- Information Technology
- Cybersecurity
- Computing

---

## 8.2 💼 商业与管理 — BUS

主要关注：

- Business
- Management
- Planning
- Finance
- Marketing
- Entrepreneurship

可能关联课程：

- Business Administration
- Marketing
- Finance
- Accounting
- Business Management

---

## 8.3 🎨 创意与设计 — CRE

主要关注：

- Creativity
- Visual Design
- Media Creation
- Art
- Aesthetics
- Innovation

可能关联课程：

- Graphic Design
- Visual Communication
- Digital Media
- Interior Design
- Film / Media

---

## 8.4 🗣️ 沟通与传播 — COM

主要关注：

- Communication
- Presentation
- Media
- Public Relations
- Social Interaction
- Content

可能关联课程：

- Communication
- Media Studies
- Public Relations
- Marketing
- Journalism

---

## 8.5 📚 语言与人文 — LAN

主要关注：

- Language
- Reading
- Writing
- Culture
- Literature
- Humanities

可能关联课程：

- Chinese Studies
- Chinese Language
- Language-related programmes
- Chinese Language Education

---

## 8.6 ❤️ 人文关怀与教育 — CAR

主要关注：

- Helping Others
- Empathy
- Education
- Listening
- Social Interaction
- Human Development

可能关联课程：

- Counselling
- Psychology
- Early Childhood Education
- Education

---

# 9. Test Structure

测试共有：

> **15 Questions**

分为三个部分：

```text
Part A — Interest       5 Questions
Part B — Strength       5 Questions
Part C — Preference     5 Questions
```

---

## Part A — Interest

### 权重：40%

主要了解：

> **「你喜欢做什么？」**

---

## Part B — Strength

### 权重：35%

主要了解：

> **「你比较擅长做什么？」**

---

## Part C — Preference

### 权重：25%

主要了解：

> **「你在学习和未来发展中重视什么？」**

---

# 10. Complete Test Question Bank

# Part A — Interest

## Q1. 如果给你一个星期完成一个 Project，你比较想做哪一种？

| Option | Dimension |
|---|---|
| A. 设计一个手机 App 或网站 | TEC |
| B. 策划一场校园活动或募款企划 | BUS |
| C. 拍一部短片或设计一系列视觉海报 | CRE |
| D. 访问不同背景的人，写一篇专题报导 | COM + LAN |

---

## Q2. 空闲时你最容易沉浸在哪一种活动中？

| Option | Dimension |
|---|---|
| A. 研究新科技、组装电脑或写代码 | TEC |
| B. 阅读财经新闻或分析市场趋势 | BUS |
| C. 画画、摄影、做手作或看艺术展 | CRE |
| D. 看电影、写影评、经营社群或阅读人文书籍 | COM + LAN |

---

## Q3. 如果可以选择，你希望未来工作的环境比较像？

| Option | Dimension |
|---|---|
| A. 实验室或电脑前，专注解决技术问题 | TEC |
| B. 办公室，参与决策与策略规划 | BUS |
| C. 工作室，自由创作与实验 | CRE |
| D. 学校、社区或媒体现场，与人互动为主 | COM + CAR |

---

## Q4. 你对哪一种议题最有好奇心？

| Option | Dimension |
|---|---|
| A. 人工智能、网路安全或软体开发 | TEC |
| B. 创业、投资理财或品牌经营 | BUS |
| C. 视觉美学、影视作品或艺术创作 | CRE |
| D. 教育议题、社会文化现象或人的心理 | LAN + CAR |

---

## Q5. 在团队中，你最常扮演什么角色？

| Option | Dimension |
|---|---|
| A. 技术担当 — 解决大家搞不定的技术问题 | TEC |
| B. 统筹担当 — 规划进度、分配任务 | BUS |
| C. 创意担当 — 提出天马行空的想法 | CRE |
| D. 协调担当 — 关心组员状况、协调冲突与分工 | CAR |

---

# Part B — Strength

## Q6. 哪一件事你做起来比别人轻松？

| Option | Dimension |
|---|---|
| A. 找出复杂问题的规律或漏洞 | TEC |
| B. 整理资料、做报表或计算数据 | BUS |
| C. 把脑中想像的画面具体呈现出来 | CRE |
| D. 用文字或语言清楚表达自己的想法 | COM + LAN |

---

## Q7. 在小组作业中，你通常会？

| Option | Dimension |
|---|---|
| A. 负责技术部分 — 写代码、做系统、处理数据 | TEC |
| B. 负责规划部分 — 制定流程、管理时间与资源 | BUS |
| C. 负责设计部分 — 做简报视觉、设计排版 | CRE |
| D. 负责整合部分 — 统整资料、撰写书面报告 | LAN |

---

## Q8. 哪一种学习方式让你觉得最有效？

| Option | Dimension |
|---|---|
| A. 自己动手做实验、写程式、实际操作 | TEC |
| B. 分析案例、研究成功企业的做法 | BUS |
| C. 透过视觉素材学习（影片、图像、设计） | CRE |
| D. 透过讨论、阅读或教别人来学习 | COM + LAN |

---

## Q9. 别人通常怎么形容你？

| Option | Dimension |
|---|---|
| A. 冷静、理性、善于分析 | TEC |
| B. 有条理、负责任、懂得规划 | BUS |
| C. 有创意、有美感、想法独特 | CRE |
| D. 善于倾听、细心、容易相处 | CAR |

---

## Q10. 遇到一个陌生的软体或工具，你通常？

| Option | Dimension |
|---|---|
| A. 自己摸索、看说明书或找教学影片学会它 | TEC |
| B. 先了解它的功能与效益，再决定是否使用 | BUS |
| C. 关注它的界面设计好不好看、好不好用 | CRE |
| D. 学会了之后写教学笔记或分享给别人 | COM + LAN |

---

# Part C — Preference

## Q11. 在选择一个课程时，你最重视什么？

| Option | Dimension |
|---|---|
| A. 课程内容是否扎实、技术是否前沿 | TEC |
| B. 毕业后就业机会多不多、薪资前景如何 | BUS |
| C. 课程是否有创意空间、能否发挥个人风格 | CRE |
| D. 课程是否有实习机会、能否累积实务经验 | COM + CAR |

---

## Q12. 你希望大学的学习环境比较偏向？

| Option | Dimension |
|---|---|
| A. 设备先进、资源充足、强调独立研究 | TEC |
| B. 与企业链接强、有产业合作机会 | BUS |
| C. 自由度高、鼓励实验与创作 | CRE |
| D. 老师与学生关系密切、常有小组讨论 | CAR + COM |

---

## Q13. 你对未来的想像比较接近哪一种？

| Option | Dimension |
|---|---|
| A. 成为某个技术领域的专家 | TEC |
| B. 创业、管理团队或成为企业领导者 | BUS |
| C. 从事设计、影视或艺术创作相关的工作 | CRE |
| D. 从事教育、辅导、文化或媒体传播相关的工作 | LAN + CAR + COM |

---

## Q14. 如果有一天你要做一份简报，你会最注重？

| Option | Dimension |
|---|---|
| A. 资料正确性、逻辑架构清晰 | TEC |
| B. 内容有说服力、能影响决策 | BUS |
| C. 视觉设计美观、排版吸引人 | CRE |
| D. 表达流畅、文字精准、能让听众投入 | COM + LAN |

---

## Q15. 如果有一个 Project 由你主导，你会最注重？

| Option | Dimension |
|---|---|
| A. 技术是否到位、系统是否稳定 | TEC |
| B. 预算是否合理、进度是否如期 | BUS |
| C. 成果是否有创意、是否独特 | CRE |
| D. 团队沟通是否顺畅、大家是否满意 | CAR |

---

# 11. Multi-Dimension Scoring

部分答案同时对应两个或三个维度。

为了避免一个答案因为对应多个维度而产生更高的总分：

> **每一个答案的总贡献固定为 1 分。**

---

## Single Dimension

```text
TEC = 1.00
```

---

## Two Dimensions

例如：

```text
COM + LAN
```

评分：

```text
COM = 0.50
LAN = 0.50
```

---

## Three Dimensions

例如：

```text
COM + LAN + CAR
```

评分：

```text
COM = 0.34
LAN = 0.33
CAR = 0.33
```

因此：

```text
Total Contribution ≈ 1.00
```

---

# 12. Part Weighting

三个部分采用不同权重：

```text
Interest       = 40%
Strength       = 35%
Preference     = 25%
```

原因：

学生的：

> **兴趣 + 能力**

应该比单纯的学习环境偏好更直接地影响 Course Discovery。

---

# 13. Score Calculation

每个 Part 独立计算六个维度的分数。

---

## Interest Score

```text
Interest_TEC =
TEC score in Part A
/
Total score in Part A
× 100
```

其他维度同理。

---

## Strength Score

```text
Strength_TEC =
TEC score in Part B
/
Total score in Part B
× 100
```

---

## Preference Score

```text
Preference_TEC =
TEC score in Part C
/
Total score in Part C
× 100
```

---

# 14. Final Dimension Score

最终分数：

```text
Final Dimension Score
=
(Interest × 0.40)
+
(Strength × 0.35)
+
(Preference × 0.25)
```

例如：

```text
Interest_TEC    = 80
Strength_TEC    = 75
Preference_TEC  = 60
```

那么：

```text
Final_TEC
=
(80 × 0.40)
+
(75 × 0.35)
+
(60 × 0.25)

= 32 + 26.25 + 15

= 73.25%
```

最终可以显示：

```text
🧠 科技与逻辑       73%
```

---

# 15. Student Profile

结果页面显示六维能力 / 兴趣画像：

```text
🧠 科技与逻辑       ███████████████  73%

💼 商业与管理       █████████████    64%

🎨 创意与设计       ███████████      55%

🗣️ 沟通与传播       █████████        48%

📚 语言与人文       ███████          38%

❤️ 人文关怀与教育   ██████           31%
```

---

# 16. Interest vs Strength Consistency

系统不仅显示最终分数，也比较：

```text
Interest
vs
Strength
vs
Preference
```

---

## Strong & Consistent

例如：

```text
Interest TEC     = 85
Strength TEC     = 80
Preference TEC   = 72
```

系统可以判断：

> 你对这个领域的兴趣与能力倾向较为一致。

Recommendation Level：

```text
🟢 非常值得了解
```

---

## Interest High, Strength Lower

例如：

```text
Interest TEC     = 82
Strength TEC     = 45
Preference TEC   = 70
```

系统不应该直接说：

> 「你适合 IT。」

而应该显示：

> 你对 Technology 有明显兴趣，但目前的能力倾向没有同样突出。这个方向仍然值得探索，同时建议进一步了解课程内容与学习要求。

Recommendation Level：

```text
🟡 可以进一步了解
```

---

# 17. Course Recommendation

测试完成后，不直接给学生一个「唯一正确答案」。

而是提供三个层级：

```text
🥇 最适合探索
🥈 也值得考虑
🥉 跨领域尝试
```

---

## 🥇 最适合探索

代表：

> 学生的兴趣、能力和学习偏好与该领域相对一致。

例如：

```text
🥇 最适合探索

Software Engineering
```

---

## 🥈 也值得考虑

代表：

> 学生的部分兴趣或能力与该 Course 相符。

---

## 🥉 跨领域尝试

代表：

> Course 与学生的某些能力或兴趣存在联系，可以作为不同方向进行探索。

---

# 18. Course Matching

Course Matching 不应该只看一个维度。

例如：

```text
Software Engineering
```

可能需要：

```text
TEC      0.70
BUS      0.10
CRE      0.10
COM      0.05
LAN      0.025
CAR      0.025
```

学生：

```text
TEC      73
BUS      64
CRE      55
COM      48
LAN      38
CAR      31
```

系统根据学生 Profile 与 Course Profile 的匹配程度进行排序。

---

# 19. Course Recommendation Example

```text
📚 最值得你了解的课程

🥇 最适合探索
Software Engineering

🟢 非常值得了解

为什么推荐？

✓ 你的「科技与逻辑」倾向较突出
✓ 你在解决问题与技术应用方面表现较明显
✓ 你的兴趣与能力方向具有一定一致性

你会接触到：

• Programming
• Database
• Software Development
• System Design

未来可以考虑：

• Software Developer
• System Analyst
• IT Project Manager

[ 📖 查看完整课程 ]
```

---

# 20. Course Details Page

Course 页面本身也是一个：

> **Marketing Page**

学生进入 Course Page 后，不应该只看到课程名称和科目。

---

## Recommended Structure

```text
Course Hero
      ↓
Course Overview
      ↓
Why Study This Course?
      ↓
What You Will Learn
      ↓
Learning Experience
      ↓
Possible Career Paths
      ↓
Entry Requirements
      ↓
Tuition Fees
      ↓
Duration
      ↓
Course Structure
      ↓
FAQ
      ↓
Contact Advisor / Apply Now
```

---

# 21. What You Will Learn

使用学生容易理解的语言。

例如：

```text
📘 You Will Learn

• Programming
• Database
• Web Development
• Software Development
• System Design
• Problem Solving
```

重点不是只列出 Subject Name，而是告诉学生：

> **「读这个 Course，我到底会学什么？」**

---

# 22. Who Is This Course For?

每个课程可以提供：

```text
This course may suit you if:

✓ You enjoy solving problems
✓ You are interested in technology
✓ You enjoy learning how systems work
✓ You are willing to practise programming
```

---

# 23. Things to Consider

不要使用绝对性的：

> ❌「你不会学到 Design。」

而使用：

> **「你可能需要考虑的是」**

例如：

```text
🤔 Things to Consider

• This course involves logical and technical learning.
• You may need to spend considerable time practising programming.
• Independent problem-solving is an important part of the learning experience.
```

这样可以让学生提前了解学习体验。

---

# 24. Career Path

职业属于：

> **Course 的解释层**

结构：

```text
Course
  ↓
Skills
  ↓
Possible Career Paths
```

例如：

```text
Software Engineering

Possible Career Paths:

• Software Developer
• Web Developer
• System Analyst
• Application Developer
• IT Project-related roles
```

职业资讯用于帮助学生理解：

> 「这个课程未来可能通往哪里？」

而不是：

> 「这个职业只能读这个 Course。」

---

# 25. Tuition Fees

Course 页面应该清楚显示：

```text
💰 Estimated Tuition Fee

RM XX,XXX

Duration:
XX Years
```

如果有其他费用，应进一步说明：

```text
Additional Fees
Scholarships
Registration Fees
Other Charges
```

实际金额应由学校课程资料库提供。

---

# 26. Entry Requirements

Course 页面显示：

```text
📋 Entry Requirements

Academic Qualification
English Requirement
Mathematics Requirement
Other Requirements
```

避免让学生进入报名流程后才发现自己不符合基本条件。

---

# 27. Course Comparison

Course Compare 是网站的核心功能之一。

学生可以选择：

```text
Course A
Course B
Course C
```

然后并列比较：

| Category | Course A | Course B | Course C |
|---|---|---|---|
| Field | IT | Business | Media |
| Duration | — | — | — |
| Tuition Fee | — | — | — |
| Entry Requirements | — | — | — |
| Main Subjects | — | — | — |
| Learning Style | — | — | — |
| Career Paths | — | — | — |

---

# 28. Shortlist

学生可以将课程加入：

> **My Shortlist**

例如：

```text
❤️ My Shortlist

☑ Software Engineering
☑ Cybersecurity
☑ Business Administration
```

之后可以直接：

```text
[ Compare Selected Courses ]
```

---

# 29. Browse All Courses

即使测试已经给出推荐，学生仍然拥有完整选择权。

页面提供：

```text
🔍 Explore All Courses

💻 IT
💼 Business
🎨 Design
🎬 Media
🧠 Psychology
📚 Language
👶 Education
💰 Finance
```

这样不会让学生被测试结果「锁死」。

---

# 30. Foundation Recommendation

Foundation 不应该被定义为：

> 「测试分数低，所以只能读 Foundation。」

而应该定义为：

> **「当学生方向尚未明确时，可以通过 Foundation 探索不同学术领域，并为未来的 Degree 做准备。」**

---

## Foundation Recommendation Logic

### 情况 1：方向明显

```text
最高维度 ≥ 55%
AND
与第二维度差距 ≥ 15%
```

建议：

```text
Degree / Diploma
```

---

### 情况 2：两个方向接近

```text
最高维度与第二维度差距 < 10%
```

建议：

```text
Compare 3–4 Courses
```

---

### 情况 3：多个方向较平均

```text
最高维度 ≤ 45%
```

且没有明显方向：

```text
Foundation
+
Explore Different Fields
```

---

### 情况 4：跨领域组合明显

例如：

```text
TEC + BUS
```

同时较高：

```text
推荐跨领域 Course
```

例如：

- Information Systems
- Business Technology
- Digital Business
- Technology Management

具体课程根据学校实际课程资料决定。

---

# 31. Foundation Page

Foundation 页面重点不是宣传「你不知道要读什么」。

而应该是：

```text
Not sure which field is right for you?

That's okay.

Foundation can give you time to:

✓ Explore different academic areas
✓ Build your academic foundation
✓ Experience different subjects
✓ Understand your strengths
✓ Prepare for your future Degree
```

核心定位：

> **探索不同学术领域、确认未来方向的过渡阶段。**

---

# 32. “Why Not This Course?” Explanation

推荐结果应该提供可解释性。

例如：

```text
❓ Why is IT ranked above Business?

Your Technology & Logic score is higher than
your Business & Management score.

This is why technology-related courses currently
appear closer to your profile.

However, your Business score is also relatively strong,
so Business remains a course area worth considering.
```

这样学生不会觉得：

> 「为什么系统突然叫我读 IT？」

而是能够理解推荐逻辑。

---

# 33. Real-World Conditions

测试结果不能是唯一决定因素。

学生还需要考虑：

- Academic Qualification
- Entry Requirements
- Tuition Fee
- Duration
- Location
- Learning Mode
- Scholarship
- Personal Preferences

---

# 34. Soft Filtering

现实条件应该采用：

> **Soft Recommendation**

而不是硬性隐藏课程。

例如：

```text
💡 This course costs RM 41,300.

Your preferred budget is RM 30,000.

This course is above your current budget range,
but you can still view the course if you are interested.

You may also consider:

• Course A — RM 26,200
• Course B — RM 28,000
```

这样系统不会让学生产生：

> 「为什么那个 Course 消失了？」

而是帮助学生发现其他选择。

---

# 35. Course Advisor

网站需要明显的：

> **Contact Course Advisor**

提供两种主要方式。

```text
💬 Contact a Course Advisor

[ 📱 WhatsApp Quick Consultation ]

[ 📧 Consultation Form ]
```

---

# 36. WhatsApp CTA

如果学生从 Course Discovery Test 进入，可以自动生成预设讯息。

例如：

```text
Hi, I completed the Course Discovery Test
and would like to know more about
Software Engineering.
```

这样招生顾问可以快速了解学生的来源和兴趣。

---

# 37. Online Application

如果学生已经确定 Course，可以直接报名。

流程：

```text
Step 1
Personal Information

        ↓

Step 2
Academic Background

        ↓

Step 3
Programme Selection

        ↓

Step 4
Upload Documents

        ↓

Step 5
Review Application

        ↓

Step 6
Condition Pre-check

        ↓

Submit Application
```

---

# 38. Programme Selection

如果学生从 Course Recommendation 页面进入报名：

系统可以预先填入：

```text
Selected Programme:
Software Engineering
```

如果学生直接点击 Apply Now：

```text
Please select your programme.
```

---

# 39. Condition Pre-check

提交之前进行基本条件检查。

例如：

```text
📋 Application Check

Selected Programme:
Software Engineering

Academic Qualification:
✅ Meets basic requirement

Mathematics:
✅ Meets basic requirement

English:
ℹ️ Please confirm specific requirement
with our Course Advisor.
```

如果存在疑问：

```text
[ Back ]
[ Continue Application ]
[ 💬 Contact Advisor ]
```

这是：

> **提醒**

而不是强制阻止申请。

---

# 40. Application Result

提交成功：

```text
🎉 Application Submitted

Thank you for your application.

Our admissions team will review your
application and contact you regarding
the next steps.

Application Reference:
XXXXXXXX

[ Back to Home ]
[ Contact Admissions ]
```

---

# 41. Course Discovery → Application Connection

如果学生通过测试找到课程，整个路径应该保持连续：

```text
Course Discovery
      ↓
Recommendation
      ↓
Course Details
      ↓
Compare
      ↓
Contact Advisor
      ↓
Apply Now
```

不要要求学生重新寻找课程。

---

# 42. Test Result → Application Data

如果学生愿意，可以将测试结果作为申请流程的参考资料：

```text
How did you find this course?

☑ Course Discovery Test
```

同时可以记录：

```text
Discovery Profile

TEC — 73%
BUS — 64%
CRE — 55%
COM — 48%
LAN — 38%
CAR — 31%

Main Direction:
Technology + Business
```

这些资料主要用于招生团队了解学生的探索路径。

---

# 43. Lead Capture Strategy

不要在测试开始之前强迫学生留下资料。

推荐：

```text
Start Test
    ↓
Complete 15 Questions
    ↓
See Result
    ↓
Explore Courses
    ↓
Optional Lead Capture
```

这样遵循：

> **Give Value First → Ask for Contact Later**

---

# 44. Lead Capture

例如：

```text
Want to save your Course Discovery results?

Enter your details:

Name
Email
Phone

[ Save My Results ]
```

留资应该发生在学生已经获得价值之后。

---

# 45. Recommended Result Page

完整结构：

```text
🧭 Your Course Discovery Result

━━━━━━━━━━━━━━━━━━━━

Your Profile

Six-Dimension Profile

TEC
BUS
CRE
COM
LAN
CAR

━━━━━━━━━━━━━━━━━━━━

🎯 Your Main Direction

Technology + Business

━━━━━━━━━━━━━━━━━━━━

📚 Courses Worth Exploring

🥇 Most Worth Exploring
Course A

🥈 Also Worth Considering
Course B

🥉 Cross-Field Option
Course C

━━━━━━━━━━━━━━━━━━━━

❓ Why These Courses?

Explanation

━━━━━━━━━━━━━━━━━━━━

⚖️ Compare These Courses

[ Compare ]

━━━━━━━━━━━━━━━━━━━━

🔍 Explore Other Courses

Browse by Field

━━━━━━━━━━━━━━━━━━━━

🤔 Still Not Sure?

Explore Foundation

━━━━━━━━━━━━━━━━━━━━

💬 Talk to a Course Advisor

[ WhatsApp ]

━━━━━━━━━━━━━━━━━━━━

📝 Ready to Apply?

[ Apply Now ]

━━━━━━━━━━━━━━━━━━━━

🔄 Retake Test
✏️ Modify Answers
🔍 Browse Other Courses
```

---

# 46. Retake / Modify Answers

结果页面提供：

```text
🔄 Retake Test
```

以及：

```text
✏️ Modify Answers
```

学生如果只是某一道题选错，不一定需要全部重新开始。

---

# 47. Student Experience Principle

整个系统应该遵循：

### 1. Don't Lock Students

测试不是限制，而是帮助探索。

### 2. Explain Recommendations

推荐必须能够解释原因。

### 3. Give Value Before Asking for Data

先提供结果，再要求留资。

### 4. Keep Multiple Paths Open

学生永远可以：

```text
Explore
Compare
Contact
Apply
```

### 5. Support Uncertainty

不确定未来方向是正常的。

Foundation 和 Course Explorer 都应该支持这一类学生。

---

# 48. Final System Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                     🟦 DISCOVER                              │
│                                                              │
│  Homepage Marketing                                          │
│          │                                                   │
│          ├───────────────┐                                   │
│          ↓               ↓                                   │
│   Browse Courses   Course Discovery Test                    │
│                          │                                   │
│                          ↓                                   │
│                    15 Questions                              │
│                          │                                   │
│                          ↓                                   │
│                  Six-Dimension Profile                       │
│                          │                                   │
│                          ↓                                   │
│                  Course Recommendation                        │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                     🟨 CONSIDER                              │
│                                                              │
│  Course Details                                              │
│  ├── Course Overview                                         │
│  ├── What You Will Learn                                     │
│  ├── Who Is This Course For?                                 │
│  ├── Things to Consider                                      │
│  ├── Career Paths                                            │
│  ├── Tuition Fees                                            │
│  └── Entry Requirements                                      │
│                                                              │
│             ↓                                                │
│       Course Comparison                                      │
│             ↓                                                │
│        My Shortlist                                          │
│             ↓                                                │
│      Foundation Exploration                                  │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                     🟩 CONVERT                               │
│                                                              │
│  💬 Contact Course Advisor                                   │
│       ├── WhatsApp                                           │
│       └── Consultation Form                                  │
│                                                              │
│                         ↓                                    │
│                  📝 Online Application                        │
│                         │                                    │
│                    Step 1–6                                   │
│                         │                                    │
│                         ↓                                    │
│                 Condition Pre-check                           │
│                         │                                    │
│                         ↓                                    │
│                  Submit Application                            │
│                         │                                    │
│                         ↓                                    │
│                    Confirmation                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

# 49. Final Core Philosophy

整个平台最终不是：

> **「做一个测试，然后告诉学生你应该读什么。」**

而是：

> **「帮助学生了解自己 → 发现可能适合的领域 → 了解真实课程 → 比较不同选择 → 在不确定时提供 Foundation 探索路径 → 最后连接课程顾问或直接报名。」**

因此整个网站的核心流程为：

```text
DISCOVER
发现自己
   ↓
CONSIDER
了解与比较课程
   ↓
CONVERT
咨询或报名
```

---

# 50. Final Feature Checklist

## Marketing

- [x] Homepage
- [x] Hero Section
- [x] Why Choose Us
- [x] Academic Fields
- [x] Course Highlights
- [x] Contact CTA
- [x] Apply CTA

## Course Discovery

- [x] 15 Questions
- [x] Part A — Interest
- [x] Part B — Strength
- [x] Part C — Preference
- [x] Six Dimensions
- [x] Weighted Scoring
- [x] Standardised Scores
- [x] Interest vs Strength Consistency
- [x] Recommendation Explanation
- [x] Retake Test
- [x] Modify Answers

## Course Explorer

- [x] Browse All Courses
- [x] Browse by Field
- [x] Course Details
- [x] Course Content
- [x] Learning Experience
- [x] Career Paths
- [x] Tuition Fees
- [x] Entry Requirements
- [x] Course Comparison
- [x] Shortlist

## Foundation

- [x] Foundation Overview
- [x] Exploration Positioning
- [x] Foundation Recommendation
- [x] Explore Different Fields

## Conversion

- [x] Contact Course Advisor
- [x] WhatsApp
- [x] Consultation Form
- [x] Online Application
- [x] Programme Pre-selection
- [x] Condition Pre-check
- [x] Document Upload
- [x] Application Submission
- [x] Application Confirmation

## Lead Generation

- [x] Result-first lead capture
- [x] Name
- [x] Email
- [x] Phone
- [x] Discovery Test Source
- [x] Optional Student Profile Reference

---

# 51. Final Definition

> **Course Discovery & Student Recruitment Platform**

A student-centred university recruitment platform that combines personalised course discovery, course comparison, academic exploration, Foundation guidance, advisor consultation, and online application into one continuous student journey.

### Core Funnel

```text
MARKETING
    ↓
DISCOVER
    ↓
PERSONALISED RECOMMENDATION
    ↓
COURSE EXPLORATION
    ↓
COMPARE
    ↓
CONTACT / FOUNDATION
    ↓
ONLINE APPLICATION
    ↓
CONVERSION
```

### Core Principle

> **Don't decide for the student. Help the student make a better decision.**