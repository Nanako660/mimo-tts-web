# AGENTS.md - MiMo-TTS Studio AI 协作与开发规范

本文档为参与 **Xiaomi MiMo-TTS Studio** 项目开发与维护的 AI Agent 及人类开发者提供统一的代码规范、架构全景、业务准则与发版工作流指南。

---

## 📌 项目定位与设计哲学

- **项目名称**：Xiaomi MiMo-TTS Studio | 小米语音合成单文件 Web 工作台
- **官方主页**：[https://mimo.mi.com/](https://mimo.mi.com/)
- **仓库地址**：[https://github.com/Nanako660/mimo-tts-web](https://github.com/Nanako660/mimo-tts-web)
- **在线体验**：[https://nanako660.github.io/mimo-tts-web/](https://nanako660.github.io/mimo-tts-web/)
- **核心定位**：
  1. **零后端纯前端直连**：浏览器直连小米官方 OpenAI 兼容 TTS 端点，无任何自建中间服务器。
  2. **硬件级端侧加密**：用户 API Key 经 Web Crypto API (AES-GCM 256) 本地加密存入 IndexedDB，绝不外泄。
  3. **单文件绿色分发**：全量 HTML、JS、CSS、字体打包为单文件 `dist/index.html`，双击即用。
  4. **全生命周期版本管理**：严格遵循 SemVer 与 Conventional Commits，支持 CI/CD 自动打包发布。

---

## 🛠️ 技术栈清单

| 层次 | 选型与工具 | 说明 |
| :--- | :--- | :--- |
| **运行时框架** | React 18 + TypeScript 5.7 | 严格类型检查与现代函数式组件 |
| **构建工具** | Vite 6 + vite-plugin-singlefile | 高效开发热重载与单文件 HTML 内联打包 |
| **样式与动效** | Tailwind CSS v3 + 自定义琉璃磨砂质感 | 深度适配深色 (`dark:`) / 浅色主题 |
| **图标体系** | Lucide React | 现代化矢量线性图标库 |
| **音频引擎** | Web Audio API + PCMStreamPlayer | 24kHz PCM16 流式边收边播、实时 Canvas 频谱/波形、多音频拼接合并 |
| **数据与压缩** | IndexedDB + JSZip + FileSaver | 本地海量历史记录存储与批量 ZIP 打包下载 |
| **安全加密** | Web Crypto API (SubtleCrypto AES-GCM 256) | 浏览器硬件隔离私钥与密文本地存储 |
| **版本与规范** | Husky + Commitlint + cz-git + standard-version | 强制提交规范、自动 CHANGELOG、一键发布推送 |

---

## 📂 项目结构与职责边界

```
mimo-tts-web/
├── .github/
│   └── workflows/
│       ├── deploy.yml            # push main 自动构建并部署至 GitHub Pages
│       └── release.yml           # push tag (v*) 自动提取 CHANGELOG 并发布 Release 附件
├── .husky/
│   ├── commit-msg                # 拦截不符合规范的 Git Commit Message
│   └── pre-commit                # 提交前自动执行 npm run build 进行类型与构建校验
├── .commitlintrc.cjs             # Commitlint 校验规则与 cz-git 交互式终端配置
├── .versionrc.cjs                # standard-version 自动生成 CHANGELOG 分类模板
├── dist/
│   └── index.html                # Vite SingleFile 编译打包输出的独立单文件应用
├── docs/                         # 官方 API 说明与使用指南
├── src/
│   ├── components/               # React 业务组件层
│   │   ├── AboutModal.tsx        # 关于与更新日志弹窗（支持 GitHub 动态拉取与离线兜底）
│   │   ├── AudioPlayer.tsx       # 底部悬浮波形播放器（支持流式进度、实时变速、Seek）
│   │   ├── BatchCenter.tsx       # 批量中心（文本切分、并发排队、ZIP导出、音频无缝拼接）
│   │   ├── DirectorModal.tsx     # 导演模式剧本向导弹窗
│   │   ├── HistoryDrawer.tsx     # 历史记录抽屉（IndexedDB 离线持久化、回听、重用、删除）
│   │   ├── Navbar.tsx            # 顶部导航栏（Logo、Tab切换、版本徽标、主题切换、设置入口）
│   │   ├── SettingsModal.tsx     # API Key、Base URL 与并发设置弹窗（硬件级加密保存）
│   │   ├── StandardTTS.tsx       # 标准语音合成模式（9款音色、情感标签、导演模式）
│   │   ├── TagToolbar.tsx        # 快速标签插入工具栏（歌词、语气、动作停顿标签）
│   │   ├── Visualizer.tsx        # Canvas 动态波形与频谱渲染组件
│   │   ├── VoiceClone.tsx        # 音频样本音色复刻模式（录音/上传、Base64封装、语气微调）
│   │   └── VoiceDesign.tsx       # 自然语言 Prompt 音色设计模式（角色预设库、台词润色）
│   ├── services/                 # 核心基础设施与服务层
│   │   ├── api.ts                # OpenAI 兼容 SSE 流式请求与非流式 HTTP 客户端
│   │   ├── audio.ts              # Web Audio PCM 解码排队播放器与多音频无损拼接合并器
│   │   ├── crypto.ts             # Web Crypto AES-GCM 硬件密钥生成、加密与解密服务
│   │   └── storage.ts            # IndexedDB 设置与历史记录增删改查
│   ├── types/                    # TypeScript 类型定义
│   │   └── index.ts              # 全局数据结构（AppSettings, HistoryItem, TTSModelId 等）
│   ├── utils/                    # 辅助函数与常量
│   │   ├── constants.ts          # 官方音色库、标签定义、导演剧本预设模板
│   │   └── version.ts            # 版本元数据获取、GitHub Releases 异步拉取与解析器
│   ├── App.tsx                   # 应用顶层主状态机与 Tab 路由管理
│   ├── main.tsx                  # React 根节点挂载入口
│   ├── index.css                 # Tailwind 样式注入与自定义 CSS 动效
│   └── vite-env.d.ts             # 全局宏定义（__APP_VERSION__, __BUILD_TIME__, __COMMIT_HASH__）
├── package.json                  # 项目依赖与发版脚本配置
├── tsconfig.json                 # TypeScript 编译器配置
├── vite.config.ts                # Vite 与 SingleFile 打包配置
├── CHANGELOG.md                  # 自动化维护的项目更新日志
└── README.md                     # 项目中文说明文档
```

---

## 🧭 Agent 编码与开发准则

在修改或扩展本代码库时，AI Agent 必须严格遵守以下准则：

### 1. 响应式与暗黑主题规范
- 所有 UI 元素必须同时提供浅色模式与深色模式（使用 Tailwind `dark:` 前缀）。
- 主题色系：
  - 强调主色：`orange-500` ~ `amber-500` 渐变。
  - 成功/流式：`emerald-500` / `emerald-600`。
  - 错误/告警：`rose-500` / `red-500`。
  - 背景底色：浅色 `bg-slate-50` / 深色 `dark:bg-slate-950` 或 `dark:bg-slate-900`。

### 2. 单文件打包与依赖约束 (Single-file Constraint)
- 严禁引入需要 Node.js 本地运行时的后端依赖。
- 所有静态资源（SVG 图标、音频样本、文本模板）优先以组件/字符串/内联形式提供。
- 构建目标必须保证 `npm run build` 产出单一独立的 `dist/index.html` 且体积合理。

### 3. 音频处理与流式生命周期
- 针对流式播放（`PCMStreamPlayer`），合成经历三个严格阶段：
  1. `receiving`：接收 SSE PCM 分片并由 Web Audio API 动态排队发声；
  2. `playing_buffer`：网络连接已断开且生成按钮立即解锁，底层音频缓冲继续播放完毕；
  3. `completed` / `idle`：发声完全结束。
- 修改音频相关代码时必须确保及时释放 `AudioContext` 与定时器资源，防止内存泄漏。

### 4. 数据安全与隐私底线
- **绝对禁止**将用户的 API Key 发送到任何非用户显式配置的 Base URL。
- API Key 在落盘至 IndexedDB 前必须经过 `encryptApiKey` 加密处理。

---

## 🏷️ 版本管理与发版规范 (Git & Release)

### 1. Commit 提交规范 (Conventional Commits)
每次提交代码必须符合以下规范格式：
```
<type>(<scope>): <subject>
```
- **Type 范围**：`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`。
- **Scope 常用值**：`ui`, `tts`, `audio`, `clone`, `batch`, `api`, `storage`, `release`, `changelog`, `deps`。
- **推荐提交方式**：
  ```bash
  git add .
  npm run commit
  ```

### 2. 自动化发版与推送流程 (One-Click Release)
本项目发版已实现**自动计算版本号、更新 CHANGELOG、打 Git Tag 并自动推送到 GitHub 远端**的一体化执行：

```bash
# 默认发版（优先最小版本号 bump，即 Patch 升级: 1.1.0 -> 1.1.1，并自动 push）
npm run release

# 显式 Patch 补丁发版并推送 (1.1.0 -> 1.1.1)
npm run release:patch

# 显式 Minor 特性发版并推送 (1.1.0 -> 1.2.0)
npm run release:minor

# 显式 Major 重大升级发版并推送 (1.1.0 -> 2.0.0)
npm run release:major

# 本地模拟发版演练（不产生实际变更与推送）
npm run release:dry
```

### 3. CI/CD 发布流水线
当 Tag 推送至 GitHub 后，`.github/workflows/release.yml` 会自动执行：
1. 全量类型检查与构建；
2. 提取当前版本的 CHANGELOG 内容作为 Release Body；
3. 生成 `mimo-tts-web-vX.Y.Z.html` 与 `mimo-tts-web-vX.Y.Z.zip` 作为 Release Assets 并自动发布。

---

## 💡 常用命令速查

```bash
# 启动本地热重载开发服务器
npm run dev

# 编译与构建单文件 HTML
npm run build

# 预览本地构建产物
npm run preview

# 交互式规范化提交
npm run commit

# 一键发版与推送远端
npm run release
```
