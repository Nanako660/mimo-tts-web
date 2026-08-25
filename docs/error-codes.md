# Xiaomi MiMo API 常见错误码参考

| HTTP 状态码 | 错误原因 | 解决方案与排查步骤 |
| :--- | :--- | :--- |
| **400 - Bad Request** | 请求体格式错误 | • 检查 JSON 格式与必填字段（如 `model`、`messages`）<br>• 检查 `messages` 中 `role: assistant` 是否存在（合成文本需填在 assistant）<br>• 检查 `voice` 参数取值是否合法，或 Base64 格式是否包含 Data URI 前缀<br>• 检查音频文件大小是否超过 10MB 限制 |
| **401 - Unauthorized** | 认证失败 | • 检查 API Key 是否配置正确，请求头是否为 `api-key: $KEY` 或 `Authorization: Bearer $KEY`<br>• 检查是否混用了 Token Plan 与按量付费的 Key 或 Base URL |
| **402 - Payment Required** | 账户余额不足 | • 检查控制台账户余额并及时充值 |
| **403 - Forbidden** | 拒绝访问 | • 服务暂不支持当前地区，或 API Key 触发风控，建议新建 API Key |
| **404 - Not Found** | 资源未找到 | • 检查调用的 model 名称是否正确（如 `mimo-v2.5-tts`） |
| **421 - Misdirected Request** | 内容拦截 | • 输入内容触发敏感词过滤或安全风控策略，请调整输入文本 |
| **429 - Too Many Requests** | 请求超限 / 并发限流 | • 降低请求频率，在客户端实现指数退避与重试机制<br>• 升级 Token Plan 套餐额度 |
| **500 - Internal Server Error** | 服务器内部故障 | • 服务端临时异常，请稍后重试 |
| **503 - Service Unavailable** | 服务器负载过高 | • 服务端负载过高，请稍后重试 |
