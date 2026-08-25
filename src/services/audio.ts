/**
 * 音频处理与 Web Audio API 播放引擎
 * 支持 PCM16 实时流式边收边播、PCM 转 WAV、音频合并与波形分析
 */

/**
 * 将 16-bit PCM (Little-Endian) 数据转换为 WAV Blob
 * @param pcmData Int16Array 或 Uint8Array
 * @param sampleRate 采样率，MiMo TTS 默认为 24000
 * @param numChannels 声道数，单声道为 1
 */
export function pcm16ToWavBlob(
  pcmData: Uint8Array | Int16Array,
  sampleRate: number = 24000,
  numChannels: number = 1
): Blob {
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmData.byteLength;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + dataSize, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 is PCM)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, byteRate, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, dataSize, true);

  // Write PCM data
  const pcmBytes = pcmData instanceof Uint8Array ? pcmData : new Uint8Array(pcmData.buffer);
  new Uint8Array(buffer, 44).set(pcmBytes);

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Base64 字符串转 Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  // 去除可能的 data URL 前缀
  const cleaned = base64.replace(/^data:audio\/[a-z0-9]+;base64,/, '');
  const binaryString = atob(cleaned);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * File / Blob 转 Base64 (包含 Data URI 前缀)
 */
export function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * 合并多个 WAV / PCM Blob 为单个完整 WAV 文件
 */
export async function mergeAudioBlobs(
  blobs: Blob[],
  audioContext: AudioContext,
  sampleRate: number = 24000
): Promise<Blob> {
  if (blobs.length === 0) {
    throw new Error('没有可合并的音频');
  }
  if (blobs.length === 1) {
    return blobs[0];
  }

  // 解码所有音频为 AudioBuffer
  const audioBuffers: AudioBuffer[] = [];
  for (const blob of blobs) {
    const arrayBuffer = await blob.arrayBuffer();
    try {
      const decoded = await audioContext.decodeAudioData(arrayBuffer);
      audioBuffers.push(decoded);
    } catch {
      // 若标准解码失败，尝试作为 PCM16 解码
      const pcmBytes = new Uint8Array(arrayBuffer);
      const float32 = new Float32Array(pcmBytes.length / 2);
      const dataView = new DataView(pcmBytes.buffer);
      for (let i = 0; i < float32.length; i++) {
        float32[i] = dataView.getInt16(i * 2, true) / 32768.0;
      }
      const buffer = audioContext.createBuffer(1, float32.length, sampleRate);
      buffer.copyToChannel(float32, 0);
      audioBuffers.push(buffer);
    }
  }

  // 计算总长度
  const totalLength = audioBuffers.reduce((acc, buf) => acc + buf.length, 0);
  const outBuffer = audioContext.createBuffer(1, totalLength, sampleRate);
  const outChannel = outBuffer.getChannelData(0);

  let offset = 0;
  for (const buf of audioBuffers) {
    const channelData = buf.getChannelData(0);
    outChannel.set(channelData, offset);
    offset += buf.length;
  }

  // 转换为 PCM16 Int16Array
  const int16Array = new Int16Array(totalLength);
  for (let i = 0; i < totalLength; i++) {
    const s = Math.max(-1, Math.min(1, outChannel[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  return pcm16ToWavBlob(int16Array, sampleRate, 1);
}

/**
 * PCM16 低延迟流式实时播放器（边收边播）
 */
export class PCMStreamPlayer {
  private audioCtx: AudioContext | null = null;
  private nextPlayTime: number = 0;
  private startTime: number = 0;
  private sampleRate: number = 24000;
  private analyser: AnalyserNode | null = null;
  private isPlaying: boolean = false;
  private pcmChunks: Uint8Array[] = [];
  private activeSources: AudioBufferSourceNode[] = [];
  private totalDuration: number = 0;
  private isStreamEnded: boolean = false;
  private onPlaybackComplete?: () => void;
  private playbackRate: number = 1.0;

  constructor(sampleRate: number = 24000) {
    this.sampleRate = sampleRate;
  }

  public init(externalCtx?: AudioContext, initialRate: number = 1.0): AnalyserNode {
    this.stop(); // 停止并清理前序播放

    this.playbackRate = initialRate > 0 ? initialRate : 1.0;

    if (!this.audioCtx) {
      this.audioCtx = externalCtx || new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.sampleRate,
      });
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (!this.analyser) {
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.connect(this.audioCtx.destination);
    }

    this.startTime = this.audioCtx.currentTime;
    this.nextPlayTime = this.audioCtx.currentTime;
    this.isPlaying = true;
    this.pcmChunks = [];
    this.activeSources = [];
    this.totalDuration = 0;
    this.isStreamEnded = false;
    return this.analyser;
  }

  public setPlaybackRate(newRate: number) {
    if (newRate <= 0 || newRate === this.playbackRate) return;
    const oldRate = this.playbackRate;
    this.playbackRate = newRate;

    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // 动态调整所有已入队但仍在发声的 AudioBufferSourceNode 的 playbackRate
    for (const source of this.activeSources) {
      try {
        source.playbackRate.setValueAtTime(newRate, now);
      } catch {}
    }

    // 重新缩放未来剩余未播放缓冲的 nextPlayTime 时间戳
    if (this.nextPlayTime > now) {
      const remainingTimeAtOldRate = this.nextPlayTime - now;
      const remainingTimeAtNewRate = (remainingTimeAtOldRate * oldRate) / newRate;
      this.nextPlayTime = now + remainingTimeAtNewRate;
    }
  }

  public feedPCMChunk(pcmBytes: Uint8Array) {
    if (!this.audioCtx || !this.analyser || !this.isPlaying) return;

    this.pcmChunks.push(pcmBytes);

    // 16bit PCM 转 Float32
    const numSamples = pcmBytes.length / 2;
    const chunkDuration = numSamples / this.sampleRate;
    this.totalDuration += chunkDuration;

    const float32 = new Float32Array(numSamples);
    const dataView = new DataView(pcmBytes.buffer, pcmBytes.byteOffset, pcmBytes.byteLength);

    for (let i = 0; i < numSamples; i++) {
      float32[i] = dataView.getInt16(i * 2, true) / 32768.0;
    }

    const audioBuffer = this.audioCtx.createBuffer(1, numSamples, this.sampleRate);
    audioBuffer.copyToChannel(float32, 0);

    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = this.playbackRate;
    source.connect(this.analyser);

    const currentTime = this.audioCtx.currentTime;
    if (this.nextPlayTime < currentTime) {
      this.nextPlayTime = currentTime + 0.02; // 微量缓冲防爆音
      if (this.pcmChunks.length === 1) {
        this.startTime = currentTime;
      }
    }

    source.start(this.nextPlayTime);
    this.nextPlayTime += (audioBuffer.duration / this.playbackRate);

    this.activeSources.push(source);
    source.onended = () => {
      const idx = this.activeSources.indexOf(source);
      if (idx !== -1) {
        this.activeSources.splice(idx, 1);
      }
      if (this.activeSources.length === 0 && this.isStreamEnded) {
        this.isPlaying = false;
        if (this.onPlaybackComplete) {
          this.onPlaybackComplete();
        }
      }
    };
  }

  public markStreamEnded(onComplete?: () => void) {
    this.isStreamEnded = true;
    this.onPlaybackComplete = onComplete;
    if (this.activeSources.length === 0) {
      this.isPlaying = false;
      if (onComplete) onComplete();
    }
  }

  public getCurrentProgress(): { currentTime: number; duration: number; isPlaying: boolean } {
    if (!this.audioCtx) {
      return { currentTime: 0, duration: this.totalDuration, isPlaying: false };
    }
    const elapsedReal = Math.max(0, this.audioCtx.currentTime - this.startTime);
    const elapsedAudioTime = elapsedReal * this.playbackRate;
    const currentTime = Math.min(this.totalDuration, elapsedAudioTime);
    return {
      currentTime,
      duration: this.totalDuration,
      isPlaying: this.isPlaying && (currentTime < this.totalDuration || !this.isStreamEnded),
    };
  }

  public getCollectedWavBlob(): Blob {
    const totalBytes = this.pcmChunks.reduce((acc, c) => acc + c.length, 0);
    const merged = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of this.pcmChunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    return pcm16ToWavBlob(merged, this.sampleRate, 1);
  }

  public stop() {
    this.isPlaying = false;
    this.nextPlayTime = 0;
    this.isStreamEnded = true;
    for (const src of this.activeSources) {
      try {
        src.stop();
        src.disconnect();
      } catch {}
    }
    this.activeSources = [];
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }
}
