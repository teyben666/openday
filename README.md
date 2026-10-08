# NEUC Open Day — 安装与操作

## 1. 需要先装好

| 软件 | 用途 | 检查 |
|---|---|---|
| [Node.js 20+](https://nodejs.org/)（自带 npm） | 运行网站 | `node --version` |
| [Ollama](https://ollama.com/download)（可选） | AI 读取成绩单 | `ollama --version` |
| poppler（可选） | 让 AI 读取 PDF 成绩单；只上传照片就不需要 | `pdftoppm -v` |

没有 Ollama 网站也能正常用，学生改成手动填成绩即可。

## 2. 安装

```bash
git clone https://github.com/teyben666/openday
cd openday
npm install
```

在项目根目录建 `.env`：

```env
DATABASE_URL=file:../db/custom.db
ADMIN_PASSWORD=换成你自己的密码

# AI 读取成绩单（可选）
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_VISION_MODEL=minicpm-v4.6
OLLAMA_TIMEOUT_MS=120000

# 网站上的 WhatsApp 按钮号码（可选）
NEXT_PUBLIC_WHATSAPP_NUMBER=60123456789
```

建立数据库：

```bash
npm run db:push
```

## 3. 启动

**本地开发**

```bash
npm run dev
```

打开 <http://localhost:3210>。

**正式上线 / 给别人用公网访问**

```bash
npm run build
npm run start:standalone
```

默认监听 `0.0.0.0:3210`。要换端口：PowerShell 用 `$env:PORT=8080; npm run start:standalone`，macOS / Linux 用 `PORT=8080 npm run start:standalone`。

**停止**：在运行的终端按 `Ctrl + C`。

## 4. 设置 AI 读取成绩单（可选）

```bash
ollama pull minicpm-v4.6
ollama serve        # 已经在后台运行就不用
ollama list         # 确认模型已装好
```

确认网站连得上 AI（网站要先启动）：

```bash
curl http://localhost:3210/api/ocr/transcript
```

返回 `"ok": true` 就成功了。想换模型，改 `.env` 里的 `OLLAMA_VISION_MODEL`，然后重启网站。模型必须支持读图（vision）。

一键检查 AI 设置：

```bash
node tests/diagnose.mjs
node tests/diagnose.mjs 成绩单照片.jpg   # 顺便试读一张成绩单
```

## 5. 网站页面

| 网址 | 用途 |
|---|---|
| `/` | 首页 |
| `/courses` | 课程列表、课程比较 |
| `/discovery` | 课程测验 |
| `/apply` | 线上报名（可上传成绩单让 AI 自动填） |
| `/admin` | 后台，用 `.env` 里的 `ADMIN_PASSWORD` 登录 |

## 6. 常用指令

```bash
npm run dev          # 开发模式
npm run build        # 打包正式版
npm run start:standalone   # 运行正式版
npm run lint         # 检查代码
npm test             # 单元测试（不需要 Ollama）
npm run db:push      # 数据库结构有改动时同步
npm run db:generate  # 重新生成 Prisma client
```

## 7. 数据存放位置

- 数据库：`db/custom.db`（备份就复制这个文件）
- 上传的成绩单：`public/uploads/proofs/`
- 清空测试报名记录：`node scripts/clear-applications.mjs`（咨询记录不会删）

## 8. 常见问题

- **页面报 hydration 错误 / 改了代码没生效**：按 `Ctrl + Shift + R` 强制刷新；还不行就停掉 `npm run dev`，删掉 `.next` 文件夹再启动。
- **用 IP 或域名打开时按钮没反应**：开发模式下要把该域名加进 `next.config.ts` 的 `allowedDevOrigins`；正式上线请用 `npm run start:standalone`。
- **AI 显示无法连接**：确认 `ollama serve` 在运行，`OLLAMA_BASE_URL` 正确。
- **第一次扫描很慢**：模型在载入，属于正常；电脑慢可以调高 `OLLAMA_TIMEOUT_MS`。
- **拉了新代码后数据库报错**：执行 `npm run db:push`。

## 9. 上线前检查

- [ ] 改掉 `ADMIN_PASSWORD`
- [ ] 不要把 `.env` 提交到 git
- [ ] 定期备份 `db/custom.db`
