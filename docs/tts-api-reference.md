# 语音合成（MiMo-TTS 系列）- OpenAI API 兼容参考文档

> 接口完全兼容 OpenAI Chat Completion 协议，支持通过标准 OpenAI SDK 或 HTTP 请求调用小米 MiMo-TTS 系列语音合成模型。

---

## 1. 接口基本信息

- **请求地址 (Base URL)**: `https://api.xiaomimimo.com/v1`
- **完整接口路径**: `https://api.xiaomimimo.com/v1/chat/completions`
- **请求方式**: `POST`
- **内容类型 (Content-Type)**: `application/json`

---

## 2. 鉴权方式 (Authentication)

接口支持以下两种认证方式，请选择其中一种添加到 HTTP 请求头中：

### 方式一：API Key 鉴权（推荐）
```http
api-key: $MIMO_API_KEY
```

### 方式二：Bearer 鉴权
```http
Authorization: Bearer $MIMO_API_KEY
```

---

## 3. 请求参数 (Request Body)

| 参数名 | 类型 | 必选 | 说明 |
| :--- | :--- | :--- | :--- |
| `model` | `string` | **是** | 用于生成响应的模型 ID。可选值：<br>• `mimo-v2.5-tts`（预置精品音色）<br>• `mimo-v2.5-tts-voicedesign`（文本描述定制音色）<br>• `mimo-v2.5-tts-voiceclone`（音频样本音色复刻） |
| `messages` | `array[object]` | **是** | 对话消息列表，包含合成目标文本及风格控制指令。详情见下方 [messages 规范](#messages-规范)。 |
| `audio` | `object` | 否 | 音频输出参数及音色配置对象。详情见下方 [audio 参数详解](#audio-参数详解)。 |
| `stream` | `boolean` | 否 | 默认值 `false`。若设置为 `true`，模型响应将通过 SSE（Server-Sent Events）流式传输。 |

---

### messages 规范

`messages` 数组包含 `user` 与 `assistant` 角色的消息对象：

#### 1. `role: "assistant"`（合成目标文本）
- **类型**: `object`
- **说明**: **语音合成的目标播报文本必须填写在 `assistant` 消息的 `content` 中**，不能放在 `user` 角色消息内。
- **特例**: 当使用 `mimo-v2.5-tts-voicedesign` 且 `audio.optimize_text_preview` 设为 `true` 时，可省略 `assistant` 消息。

#### 2. `role: "user"`（音色描述 / 风格指令）
- **类型**: `object`
- **说明**: 
  - 在 `mimo-v2.5-tts` 与 `mimo-v2.5-tts-voiceclone` 中为**可选参数**：可传入自然语言指令调整合成语气、语调、表演风格，或作为对话历史（不会被朗读）。
  - 在 `mimo-v2.5-tts-voicedesign` 中为**必选参数**：用于指定音色设计的文本描述 Prompt。

---

### audio 参数详解

| 字段 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `format` | `string` | `wav` | 指定输出音频格式。可选值：`wav`、`mp3`、`pcm`、`pcm16`。<br>• 非流式调用默认使用 `wav`。<br>• 设置 `stream: true` 流式调用时，推荐指定为 `pcm16`（或 `pcm`），采样率为 24kHz、单声道 Mono、16-bit LE。 |
| `voice` | `string` | `mimo_default` | 预置音色 ID 或音频样本的 Base64 编码：<br>• **`mimo-v2.5-tts`**：可选，支持预置音色（默认 `mimo_default`，可选：`冰糖`、`茉莉`、`苏打`、`白桦`、`Mia`、`Chloe`、`Milo`、`Dean`）。<br>• **`mimo-v2.5-tts-voiceclone`**：**必填**，传入音频样本的 Base64 编码（格式为 `data:{MIME_TYPE};base64,$BASE64_AUDIO`，支持 `audio/mpeg` 或 `audio/wav`，大小 ≤ 10MB）。<br>• **`mimo-v2.5-tts-voicedesign`**：**不支持该字段**。 |
| `optimize_text_preview` | `boolean` | `false` | 是否开启目标音频播报文本智能润色优化（**仅支持 `mimo-v2.5-tts-voicedesign`**）。<br>• 设为 `true` 时会对传入目标文本智能润色；若未传入 `assistant` 消息，则会自动根据音色描述生成适配播报文本。 |

---

## 4. 响应结构 (Response Format)

### 4.1 非流式响应对象 (`chat.completion`)

```json
{
  "id": "6ebed286b58546f6b87fa7fa9d0e806b",
  "object": "chat.completion",
  "created": 1776954802,
  "model": "mimo-v2.5-tts",
  "choices": [
    {
      "index": 0,
      "finish_reason": "stop",
      "message": {
        "role": "assistant",
        "content": "",
        "audio": {
          "id": "979a91904f9a4143928d9e1f54837b4f",
          "data": "<Base64 编码的音频数据>",
          "expires_at": null,
          "transcript": null
        },
        "final_text_preview": "智能润色后的最终播报文本（仅在 optimize_text_preview=true 时返回）",
        "tool_calls": null
      }
    }
  ],
  "usage": {
    "prompt_tokens": 213,
    "completion_tokens": 97,
    "total_tokens": 310,
    "prompt_tokens_details": {
      "cached_tokens": 109
    },
    "completion_tokens_details": {
      "reasoning_tokens": 0
    }
  }
}
```

### 4.2 流式响应 Chunk 对象 (`chat.completion.chunk`)

```json
{
  "id": "6ebed286b58546f6b87fa7fa9d0e806b",
  "object": "chat.completion.chunk",
  "created": 1776954802,
  "model": "mimo-v2.5-tts",
  "choices": [
    {
      "index": 0,
      "finish_reason": null,
      "delta": {
        "role": "assistant",
        "content": null,
        "audio": {
          "id": "979a91904f9a4143928d9e1f54837b4f",
          "data": "<Base64 编码的音频分片数据>",
          "expires_at": null,
          "transcript": null
        },
        "final_text_preview": null
      }
    }
  ],
  "usage": null
}
```

---

## 5. 调用代码示例

### 5.1 预置音色语音合成 (`mimo-v2.5-tts`)

#### Python SDK（非流式）
```python
import os
import base64
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("MIMO_API_KEY"),
    base_url="https://api.xiaomimimo.com/v1"
)

completion = client.chat.completions.create(
    model="mimo-v2.5-tts",
    messages=[
        {
            "role": "user",
            "content": "用轻快上扬的语调向领导报喜，语速稍快，带着查到成绩后压抑不住的激动与小骄傲，声音明亮有活力。"
        },
        {
            "role": "assistant",
            "content": "领导！跟您汇报个好消息，刚刚成绩出来了，我不仅通过了，还拿了优秀！晚上的庆功宴我请客！"
        }
    ],
    audio={
        "format": "wav",
        "voice": "茉莉"  # 可选：mimo_default, 冰糖, 茉莉, 苏打, 白桦, Mia, Chloe, Milo, Dean
    }
)

message = completion.choices[0].message
audio_bytes = base64.b64decode(message.audio.data)
with open("output.wav", "wb") as f:
    f.write(audio_bytes)
print("音频已保存至 output.wav")
```

#### Python SDK（流式低延迟）
```python
import base64
import os
import numpy as np
import soundfile as sf
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("MIMO_API_KEY"),
    base_url="https://api.xiaomimimo.com/v1"
)

completion = client.chat.completions.create(
    model="mimo-v2.5-tts",
    messages=[
        {
            "role": "user",
            "content": "用温柔且富有磁性的声音播报晚安电台。"
        },
        {
            "role": "assistant",
            "content": "(磁性)夜已经深了，城市还在呼吸。我是今晚陪你的人，欢迎收听《午夜电台》。"
        }
    ],
    audio={
        "format": "pcm16",
        "voice": "苏打"
    },
    stream=True
)

collected_chunks = np.array([], dtype=np.float32)

for chunk in completion:
    if not chunk.choices:
        continue
    delta = chunk.choices[0].delta
    audio = getattr(delta, "audio", None)

    if audio is not None:
        pcm_bytes = base64.b64decode(audio["data"])
        np_pcm = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        collected_chunks = np.concatenate((collected_chunks, np_pcm))
        print(f"收到音频分片: {len(pcm_bytes)} 字节")

# 保存为 24kHz 单声道 WAV 文件
sf.write("output_stream.wav", collected_chunks, samplerate=24000)
print("流式音频拼接完成，已保存至 output_stream.wav")
```

#### cURL
```bash
curl --location --request POST 'https://api.xiaomimimo.com/v1/chat/completions' \
--header "api-key: $MIMO_API_KEY" \
--header 'Content-Type: application/json' \
--data-raw '{
    "model": "mimo-v2.5-tts",
    "messages": [
        {
            "role": "user",
            "content": "用轻快上扬的语调向领导报喜，语速稍快，带着查到成绩后压抑不住的激动与小骄傲。"
        },
        {
            "role": "assistant",
            "content": "领导！好消息，考试拿到优秀了！"
        }
    ],
    "audio": {
        "format": "wav",
        "voice": "冰糖"
    }
}'
```

---

### 5.2 文本描述音色定制 (`mimo-v2.5-tts-voicedesign`)

#### Python SDK
```python
import os
import base64
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("MIMO_API_KEY"),
    base_url="https://api.xiaomimimo.com/v1"
)

completion = client.chat.completions.create(
    model="mimo-v2.5-tts-voicedesign",
    messages=[
        {
            "role": "user",
            "content": "一位年迈的老先生，说带北方口音的普通话，语速缓慢而沉稳，嗓音略带沙哑和沧桑感，充满岁月的智慧。"
        },
        {
            "role": "assistant",
            "content": "那一年大雪封山，我们几个人围在火炉旁，听着窗外的风声，谁也没想到后来的变化会这么大。"
        }
    ],
    audio={
        "format": "wav",
        "optimize_text_preview": True
    }
)

message = completion.choices[0].message
audio_bytes = base64.b64decode(message.audio.data)
with open("voicedesign_output.wav", "wb") as f:
    f.write(audio_bytes)
```

#### cURL
```bash
curl --location --request POST 'https://api.xiaomimimo.com/v1/chat/completions' \
--header "api-key: $MIMO_API_KEY" \
--header 'Content-Type: application/json' \
--data-raw '{
    "model": "mimo-v2.5-tts-voicedesign",
    "messages": [
        {
            "role": "user",
            "content": "Give me a young, energetic male gamer tone, speaking excitedly."
        },
        {
            "role": "assistant",
            "content": "Let'\''s go! We finally won the championship!"
        }
    ],
    "audio": {
        "format": "wav",
        "optimize_text_preview": true
    }
}'
```

---

### 5.3 音频样本音色复刻 (`mimo-v2.5-tts-voiceclone`)

#### Python SDK
```python
import os
import base64
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("MIMO_API_KEY"),
    base_url="https://api.xiaomimimo.com/v1"
)

# 读取本地音频样本并进行 Base64 编码 (≤ 10MB, 支持 mp3/wav)
with open("sample_voice.wav", "rb") as f:
    voice_bytes = f.read()
voice_base64 = base64.b64encode(voice_bytes).decode("utf-8")

completion = client.chat.completions.create(
    model="mimo-v2.5-tts-voiceclone",
    messages=[
        {
            "role": "user",
            "content": "保持原声音色的同时，语调稍微带有一点欣慰与温和。"
        },
        {
            "role": "assistant",
            "content": "看到你现在的成长，我打心底里为你感到高兴。"
        }
    ],
    audio={
        "format": "wav",
        "voice": f"data:audio/wav;base64,{voice_base64}"
    }
)

message = completion.choices[0].message
audio_bytes = base64.b64decode(message.audio.data)
with open("cloned_output.wav", "wb") as f:
    f.write(audio_bytes)
```

#### cURL
```bash
curl --location --request POST 'https://api.xiaomimimo.com/v1/chat/completions' \
--header "api-key: $MIMO_API_KEY" \
--header 'Content-Type: application/json' \
--data-raw '{
    "model": "mimo-v2.5-tts-voiceclone",
    "messages": [
        {
            "role": "user",
            "content": ""
        },
        {
            "role": "assistant",
            "content": "这是一段基于参考音频复刻生成的合成语音。"
        }
    ],
    "audio": {
        "format": "wav",
        "voice": "data:audio/wav;base64,<BASE64_AUDIO_STRING>"
    }
}'
```
