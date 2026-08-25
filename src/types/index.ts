export type TTSModelId = 'mimo-v2.5-tts' | 'mimo-v2.5-tts-voicedesign' | 'mimo-v2.5-tts-voiceclone';

export type AudioFormat = 'wav' | 'mp3' | 'pcm' | 'pcm16';

export type StreamPlayStatus = 'idle' | 'receiving' | 'playing_buffer' | 'completed';

export interface BuiltInVoice {
  id: string;
  name: string;
  language: '中文' | '英文';
  gender: '女性' | '男性' | '中性';
  description: string;
  recommendedTags?: string[];
}

export interface AppSettings {
  apiKey: string;
  baseUrl: string;
  theme: 'dark' | 'light';
  defaultFormat: AudioFormat;
  defaultModel: TTSModelId;
  defaultVoice: string;
  streamOutput: boolean;
  concurrencyLimit: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface TTSAudioConfig {
  format?: AudioFormat;
  voice?: string;
  optimize_text_preview?: boolean;
}

export interface TTSRequestPayload {
  model: TTSModelId;
  messages: ChatMessage[];
  audio?: TTSAudioConfig;
  stream?: boolean;
}

export interface TTSResponseChoice {
  index: number;
  finish_reason: string | null;
  message?: {
    role: string;
    content: string;
    audio?: {
      id: string;
      data: string; // Base64
      expires_at: number | null;
      transcript: string | null;
    };
    final_text_preview?: string;
  };
  delta?: {
    role?: string;
    content?: string;
    audio?: {
      id?: string;
      data?: string; // Base64
      expires_at?: number | null;
      transcript?: string | null;
    };
    final_text_preview?: string;
  };
}

export interface TTSResponseUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details?: {
    cached_tokens: number;
  };
  completion_tokens_details?: {
    reasoning_tokens: number;
  };
}

export interface TTSResponseData {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: TTSResponseChoice[];
  usage?: TTSResponseUsage;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  model: TTSModelId;
  mode: 'standard' | 'voicedesign' | 'voiceclone' | 'batch';
  promptText: string;
  synthesizedText: string;
  voice?: string;
  audioBlobUrl: string;
  audioBase64?: string;
  format: AudioFormat;
  duration?: number;
  finalTextPreview?: string;
  tokensUsed?: number;
}

export interface BatchTaskItem {
  id: string;
  index: number;
  text: string;
  userPrompt?: string;
  voice?: string;
  model: TTSModelId;
  status: 'pending' | 'processing' | 'success' | 'failed';
  audioBlobUrl?: string;
  audioBlob?: Blob;
  audioBase64?: string;
  error?: string;
  duration?: number;
  tokensUsed?: number;
}

export interface TagCategory {
  category: string;
  description: string;
  tags: {
    label: string;
    tag: string;
    isAudioTag?: boolean; // True for [tag], false for (tag)
    desc?: string;
  }[];
}

export interface DirectorPreset {
  id: string;
  title: string;
  role: string;
  scene: string;
  guidance: string;
  sampleText: string;
}
