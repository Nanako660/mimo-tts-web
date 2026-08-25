# Xiaomi MiMo-TTS Studio | 小米语音合成单文件 Web 工作台

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![SingleFile](https://img.shields.io/badge/Build-Single--File_HTML-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<p align="center">
  <b>基于小米 MiMo-TTS 大模型系列 API 构建的现代高颜值、全功能、纯单文件语音合成工作台</b><br>
  零后端依赖 · 硬件级本地加密 · 低延迟流式边收边播 · 批量合成与音频拼接导出 · 响应式暗黑琉璃设计
</p>

[**🚀 立即在线体验 (GitHub Pages)**](https://nanako660.github.io/mimo-tts-web/) · [**📦 下载单文件 HTML (dist/index.html)**](dist/index.html) · [**📖 API 与使用文档**](docs/README.md) · [**⚡ 快速上手**](#-快速上手)

</div>

---

## 🌟 核心特性

### 1. 🌐 零安装在线即用 & 纯单文件分发
- **在线即用**：直接访问 [**GitHub Pages 在线工作台**](https://nanako660.github.io/mimo-tts-web/)，纯前端直连小米 API，不留存任何数据。
- **纯单文件分发**：借助 `vite-plugin-singlefile`，所有 HTML、JavaScript 逻辑、Tailwind 样式、Lucide 图标及字体均打包编译在单一独立的 [`dist/index.html`](dist/index.html) 文件中（体积仅 ~412 KB），在任意电脑或手机浏览器中双击即可直接离线运行！

### 2. 🔐 硬件级浏览器本地加密 (Zero Leakage)
- **Web Crypto API (AES-GCM 256-bit)**：首次打开应用时在用户浏览器本地生成不可导出的非对称/对称私钥并存入本地 IndexedDB，API Key 密文加密后留存。
- **纯客户端直连**：所有请求直接从用户浏览器端直连小米官方 API 端点（或用户自定义反代端点），不经过任何第三方服务器中转。
- **自定义 Base URL**：支持配置官方端点 `https://api.xiaomimimo.com/v1` 或自建中转 / Token Plan 代理端点，内置连通性测试与 [API Keys 获取直达](https://platform.xiaomimimo.com/console/api-keys)。

### 3. 🎙️ 完整支持全部 MiMo TTS 调用模式

#### ① 标准语音合成 (`mimo-v2.5-tts`)
- **9 款精品预置音色**：内置 `mimo_default`、`冰糖`、`茉莉`、`苏打`、`白桦`、`Mia`、`Chloe`、`Milo`、`Dean`，支持中英文、性别与应用场景标签筛选。
- **PCM16 低延迟流式边收边播**：实时接收 SSE 分片，基于 Web Audio API 动态解码排队发声，享受极致毫秒级首字发声延迟。
- **3 阶段流式生命周期**：网络传输完成瞬间自动解锁“立即生成”按钮，无缝衔接下一条创作。
- **智能标签与导演模式**：
  - 一键插入 `(唱歌)` 歌词旋律标签；
  - 光标处即时插入 `(开心)`、`(温柔)`、`(东北话)` 等整体情绪风格标签；
  - 细粒度插入 `[深呼吸]`、`[轻笑]`、`[叹气]`、`[哽咽]`、`[沉默片刻]` 等呼吸动作停顿标签；
  - 提供【角色】/【场景】/【指导】三维度专业剧本模板的**导演模式向导**。

#### ② 文本描述音色设计 (`mimo-v2.5-tts-voicedesign`)
- **Prompt 创造专属新音色**：通过自然语言描述（年龄、质感、情绪、语速、应用场景）创造全新音色。
- **精选人设预设库**：预置古风说书人、耳语 ASMR 治愈女声、未来科幻 AI、顶级投行导师等模板。
- **智能台词润色 (`optimize_text_preview: true`)**：支持模型根据所设计的音色人设自动润色与扩写台词。

#### ③ 音频样本音色复刻 (`mimo-v2.5-tts-voiceclone`)
- **样本拖拽上传**：支持 `.wav` 与 `.mp3` 样本文件（≤ 10MB）拖拽或选择上传。
- **自动转码封装**：前端自动完成 Base64 编码与 `data:audio/...;base64` 封装，支持原声音频即时试听。
- **语气微调指令**：在完美复刻原声声线音色的基础上，通过用户指令微调说话语气与情绪起伏。

#### ④ 全功能批量合成中心 (Batch Center)
- **多格式拖拽导入**：支持长文本按换行/段落切分导入，支持拖拽导入 `.txt`、`.csv`、`.json` 结构化任务文件。
- **并发控制与调度**：支持 1~5 线程并发限制，防止触发 429 请求超限。
- **一键打包 ZIP 导出**：使用 JSZip 一键将所有成功合成的音频与 `manifest.json` 元数据清单打包下载。
- **无缝音频拼接合并**：基于 Web Audio API 将批量生成的全部音频按顺序无损拼接合并为一个单一大音频文件导出。

---

### 4. 🎵 实时动态声波可视化与全功能播放器
- **动态 Canvas 声波渲染**：支持播放时实时频谱跳动、流式接收时的动态正弦波光效与待机微光线。
- **实时即时无级倍速**：支持 `0.75x` / `1.0x` / `1.25x` / `1.5x` / `2.0x` 实时动态调节（流式发声中亦可即时变速）。
- **全功能控制**：进度拖拽 Seek、单曲循环、静音切换、Base64 一键复制与无损下载。
- **本地历史记录中心**：IndexedDB 自动持久化所有生成记录与音频 Blob，支持重用参数、单条删除与一键清空。

---

## 🚀 快速上手

### 方式一：在线直接使用（推荐）
直接在浏览器中打开在线工作台：
👉 [**https://nanako660.github.io/mimo-tts-web/**](https://nanako660.github.io/mimo-tts-web/)

### 方式二：直接在本地运行单文件 HTML
下载仓库中的 [`dist/index.html`](dist/index.html) 文件，在电脑或手机上直接双击打开即可运行。

### 方式三：本地源码开发
```bash
# 1. 克隆本仓库
git clone https://github.com/Nanako660/mimo-tts-web.git
cd mimo-tts-web

# 2. 安装依赖
npm install

# 3. 启动本地开发热重载服务
npm run dev
```

### 方式四：重新构建单文件
```bash
npm run build
```
构建产物将输出在 `dist/index.html`。

---

## 📁 项目结构

```
mimo-tts-web/
├── dist/
│   └── index.html             # 编译打包后的完整单文件 Web 应用
├── docs/                      # 官方整理文档与参考手册
│   ├── README.md              # 文档索引
│   ├── tts-api-reference.md   # OpenAI 兼容 API 详细规范
│   ├── tts-usage-guide.md     # 调用指南与音色 Prompt 指引
│   └── error-codes.md         # 错误码速查表
├── src/
│   ├── components/            # React 界面组件库
│   │   ├── AudioPlayer.tsx    # 底部波形播放器 (实时倍速/进度同步)
│   │   ├── BatchCenter.tsx    # 批量合成中心 (ZIP打包/音频合并)
│   │   ├── DirectorModal.tsx  # 导演模式剧本向导
│   │   ├── HistoryDrawer.tsx  # 历史记录抽屉
│   │   ├── Navbar.tsx         # 导航栏与暗黑主题切换
│   │   ├── SettingsModal.tsx  # 硬件级加密设置弹窗
│   │   ├── StandardTTS.tsx    # 标准语音合成 (9款音色/流式边收边播)
│   │   ├── TagToolbar.tsx     # 发音风格与动作呼吸标签栏
│   │   ├── Visualizer.tsx     # Canvas 实时波形频谱渲染器
│   │   ├── VoiceClone.tsx     # 音频样本音色复刻
│   │   └── VoiceDesign.tsx    # 文本描述音色设计
│   ├── services/              # 核心业务服务层
│   │   ├── api.ts             # OpenAI 兼容 SSE 流式与标准 HTTP 请求
│   │   ├── audio.ts           # Web Audio PCM16 边收边播播放器与拼接合并
│   │   ├── crypto.ts          # Web Crypto AES-GCM 硬件加密实现
│   │   └── storage.ts         # IndexedDB 持久化存储与设置
│   ├── types/                 # TypeScript 类型定义
│   ├── utils/                 # 常量、音色库与导演剧本预设
│   ├── App.tsx                # 应用主状态机
│   ├── main.tsx               # 入口挂载
│   └── index.css              # Tailwind CSS 与动效定义
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts             # 单文件打包配置
└── README.md
```

---

## 📚 官方文档索引

- [API 完整参考手册](docs/tts-api-reference.md)
- [使用指南与 Prompt 工程](docs/tts-usage-guide.md)
- [错误码速查表与排查](docs/error-codes.md)

---

## 🔒 隐私与安全性

- 本项目为**纯前端无服务器架构**。
- 您的 API Key 仅保存在您当前浏览器的 IndexedDB 中，并通过设备硬件级 Web Crypto API 进行 AES-GCM 256 位加密存储。
- 所有网络请求直接与小米官方 API 通信，绝无任何第三方数据采集或中转。

---

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源。
