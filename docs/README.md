# Xiaomi MiMo-TTS 接口与使用文档目录

本文档目录收录了小米 MiMo 开放平台中 **语音合成（MiMo-TTS / MiMo-V2.5-TTS 系列）** 的完整官方接口规范、调用指南、音色表及错误排查参考：

## 📚 文档列表

1. [TTS API 接口参考文档 (`tts-api-reference.md`)](./tts-api-reference.md)
   - 接口请求地址与认证方式（OpenAI API 兼容）
   - 请求体参数详解（`model`, `messages`, `audio`, `stream`, `voice`, `optimize_text_preview` 等）
   - 响应格式与数据结构（非流式响应、流式 SSE Chunk、用量统计）
   - Python SDK 与 cURL 代码示例（预置音色、音色设计、音色复刻，含流式与非流式）

2. [TTS 使用指南与提示词工程 (`tts-usage-guide.md`)](./tts-usage-guide.md)
   - 支持模型特性与对比（`mimo-v2.5-tts`, `mimo-v2.5-tts-voicedesign`, `mimo-v2.5-tts-voiceclone`）
   - 预置音色列表（冰糖、茉莉、苏打、白桦、Mia、Chloe、Milo、Dean 等）
   - 风格控制（自然语言描述、导演模式、`(风格)` 标签与 `[音频标签]` 细粒度控制、唱歌模式）
   - 音色设计 Prompt 编写指南与禁忌
   - 音色复刻最佳实践与 Base64 规范

3. [错误码与排查指南 (`error-codes.md`)](./error-codes.md)
   - HTTP 常见状态码（400, 401, 402, 403, 421, 429, 500, 503 等）含义与解决方案
