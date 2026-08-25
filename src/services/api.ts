import { TTSRequestPayload, TTSResponseData, AudioFormat } from '../types';
import { pcm16ToWavBlob, base64ToUint8Array } from './audio';

export interface SynthesisResult {
  audioBlob: Blob;
  audioBase64: string;
  format: AudioFormat;
  finalTextPreview?: string;
  tokensUsed?: number;
}

export class MiMoApiError extends Error {
  public statusCode?: number;
  public details?: any;

  constructor(message: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'MiMoApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

function parseErrorMessage(status: number, data: any): string {
  if (data?.error?.message) {
    return data.error.message;
  }
  switch (status) {
    case 400:
      return '400 请求格式错误：请检查入参、消息列表角色及音频参数是否符合规范。';
    case 401:
      return '401 认证失败：API Key 无效或未配置，请在右上角【设置】中配置正确的 API Key。';
    case 402:
      return '402 余额不足：账户额度已耗尽，请在控制台充值或检查 Token Plan 套餐。';
    case 403:
      return '403 拒绝访问：API Key 权限受限或当前地区暂不支持。';
    case 404:
      return '404 模型未找到：请确认模型 ID 是否为 mimo-v2.5-tts 系列。';
    case 421:
      return '421 内容拦截：输入文本触发安全风控策略，请调整敏感内容后重试。';
    case 429:
      return '429 请求超限：触发频率限制或并发超限，请稍后重试或降低并发。';
    case 500:
    case 503:
      return '500/503 服务端异常：MiMo 平台服务繁忙，请稍后重试。';
    default:
      return `请求失败 (HTTP ${status})：${typeof data === 'string' ? data : JSON.stringify(data)}`;
  }
}

/**
 * 非流式语音合成请求
 */
export async function callTTSNonStream(
  baseUrl: string,
  apiKey: string,
  payload: TTSRequestPayload
): Promise<SynthesisResult> {
  if (!apiKey) {
    throw new MiMoApiError('请先在右上角【设置】中输入并保存您的 MiMo API Key', 401);
  }

  const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
  const format = payload.audio?.format || 'wav';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      ...payload,
      stream: false,
    }),
  });

  if (!response.ok) {
    let errData;
    try {
      errData = await response.json();
    } catch {
      errData = await response.text();
    }
    throw new MiMoApiError(parseErrorMessage(response.status, errData), response.status, errData);
  }

  const data: TTSResponseData = await response.json();
  const choice = data.choices?.[0];
  const audioObj = choice?.message?.audio;

  if (!audioObj?.data) {
    throw new MiMoApiError('服务端未返回有效的音频数据，请检查合成文本或音色配置', 500, data);
  }

  const base64Data = audioObj.data;
  const uint8 = base64ToUint8Array(base64Data);

  let blob: Blob;
  if (format === 'pcm' || format === 'pcm16') {
    blob = pcm16ToWavBlob(uint8, 24000, 1);
  } else if (format === 'mp3') {
    blob = new Blob([uint8], { type: 'audio/mp3' });
  } else {
    blob = new Blob([uint8], { type: 'audio/wav' });
  }

  return {
    audioBlob: blob,
    audioBase64: base64Data,
    format,
    finalTextPreview: choice?.message?.final_text_preview,
    tokensUsed: data.usage?.total_tokens,
  };
}

/**
 * 流式低延迟语音合成请求（SSE 边收边播）
 */
export async function callTTSStream(
  baseUrl: string,
  apiKey: string,
  payload: TTSRequestPayload,
  onPCMChunk?: (chunk: Uint8Array) => void
): Promise<SynthesisResult> {
  if (!apiKey) {
    throw new MiMoApiError('请先在右上角【设置】中输入并保存您的 MiMo API Key', 401);
  }

  const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      ...payload,
      stream: true,
      audio: {
        ...payload.audio,
        format: 'pcm16', // 流式必须为 pcm16 保证实时无损解码
      },
    }),
  });

  if (!response.ok) {
    let errData;
    try {
      errData = await response.json();
    } catch {
      errData = await response.text();
    }
    throw new MiMoApiError(parseErrorMessage(response.status, errData), response.status, errData);
  }

  if (!response.body) {
    throw new MiMoApiError('流式响应体为空', 500);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  const collectedChunks: Uint8Array[] = [];
  let finalTextPreview: string | undefined;
  let totalTokens: number | undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // 保留未完成的行

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue; // 心跳注释

      if (trimmed.startsWith('data:')) {
        const jsonStr = trimmed.slice(5).trim();
        if (jsonStr === '[DONE]') {
          continue;
        }

        try {
          const parsed: TTSResponseData = JSON.parse(jsonStr);
          const choice = parsed.choices?.[0];

          if (choice?.delta?.final_text_preview) {
            finalTextPreview = choice.delta.final_text_preview;
          }
          if (parsed.usage?.total_tokens) {
            totalTokens = parsed.usage.total_tokens;
          }

          const chunkBase64 = choice?.delta?.audio?.data;
          if (chunkBase64) {
            const pcmBytes = base64ToUint8Array(chunkBase64);
            collectedChunks.push(pcmBytes);
            if (onPCMChunk) {
              onPCMChunk(pcmBytes);
            }
          }
        } catch {
          // 忽略非 JSON 数据行
        }
      }
    }
  }

  // 拼接全量 PCM16 字节并转为 WAV Blob
  const totalLength = collectedChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const mergedPCM = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of collectedChunks) {
    mergedPCM.set(chunk, offset);
    offset += chunk.length;
  }

  const finalBlob = pcm16ToWavBlob(mergedPCM, 24000, 1);

  return {
    audioBlob: finalBlob,
    audioBase64: '',
    format: 'pcm16',
    finalTextPreview,
    tokensUsed: totalTokens,
  };
}

/**
 * 测试 API 连通性
 */
export async function testConnection(baseUrl: string, apiKey: string): Promise<boolean> {
  const endpoint = `${baseUrl.replace(/\/+$/, '')}/models`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'api-key': apiKey,
    },
  });
  if (!response.ok) {
    throw new MiMoApiError(`连接失败 (HTTP ${response.status})`, response.status);
  }
  return true;
}
