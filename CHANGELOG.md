# 更新日志 (Changelog)

本项目的所有重要版本演进与修复都将记录在此文件中。

本更新日志遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 与 [Semantic Versioning](https://semver.org/lang/zh-CN/) 规范。

## 1.1.0 (2026-08-25)


### 📝 文档更新 (Documentation)

* add GitHub Pages live url and update API key acquisition link ([e938b6a](https://github.com/Nanako660/mimo-tts-web/commit/e938b6ab6b575c9ffbb3aab249913baad1cb739d))


### ✨ 新增功能 (Features)

* initial commit of Xiaomi MiMo-TTS Studio single-file web application ([1c71796](https://github.com/Nanako660/mimo-tts-web/commit/1c717969b0a08916025c662d3b65ecd460d66d1a))
* **release:** setup comprehensive version management and in-app changelog UI ([069aa87](https://github.com/Nanako660/mimo-tts-web/commit/069aa8780a90558c25e206125435695cb50c43db))

## [1.0.0](https://github.com/Nanako660/mimo-tts-web/releases/tag/v1.0.0) (2026-08-26)

### ✨ 新增功能 (Features)

* **core:** 首发支持小米 MiMo-TTS V2.5 官方语音合成大模型工作台 ([1c71796](https://github.com/Nanako660/mimo-tts-web/commit/1c71796))
* **tts:** 支持标准文本朗读（Standard TTS）、自然语言音色设计（Voice Design）与声音复刻（Voice Clone）
* **batch:** 提供批量中心（Batch Center），支持文本切分、并发排队合成与 ZIP 压缩导出
* **audio:** 引入 PCM 流式播放器（边收边播低延迟）、波形/频谱实时可视化与变速播放
* **security:** 基于 Web Crypto API (AES-GCM 256) 本地加密存储 API Key，保障用户隐私安全
* **storage:** 基于 IndexedDB 打造大容量生成历史抽屉，支持离线回听、下载与清空
* **bundle:** 基于 Vite SingleFile 插件实现零后端依赖的独立单文件 HTML 运行能力
* **versioning:** 建立完善的版本管理体系，支持 Conventional Commits、自动化 CHANGELOG 与 GitHub Release CI/CD

### 📝 文档更新 (Documentation)

* **docs:** 补充完善详细的 README 说明文档与 GitHub Pages 在线体验地址 ([e938b6a](https://github.com/Nanako660/mimo-tts-web/commit/e938b6a))
