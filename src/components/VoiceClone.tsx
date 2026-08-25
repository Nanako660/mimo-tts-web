import React, { useState, useRef } from 'react';
import {
  Sparkles,
  UploadCloud,
  FileAudio,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  MessageSquare,
  Wand2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { TTSModelId, AudioFormat } from '../types';
import { fileToBase64 } from '../services/audio';

interface VoiceCloneProps {
  onSynthesize: (params: {
    model: TTSModelId;
    synthesizeText: string;
    userPrompt?: string;
    voiceBase64: string;
    format: AudioFormat;
  }) => Promise<void>;
  loading: boolean;
}

export const VoiceClone: React.FC<VoiceCloneProps> = ({
  onSynthesize,
  loading,
}) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [sampleBase64, setSampleBase64] = useState<string>('');
  const [sampleAudioUrl, setSampleAudioUrl] = useState<string | null>(null);
  const [isSamplePlaying, setIsSamplePlaying] = useState(false);
  const sampleAudioRef = useRef<HTMLAudioElement | null>(null);

  const [synthesizeText, setSynthesizeText] = useState(
    '这是一段基于您上传的声音样本精准复刻合成的语音，完美保留了原声的音色特征与说话习惯。'
  );
  const [userPrompt, setUserPrompt] = useState(
    '保持原声音色的同时，语调稍微带有一点欣慰与温和。'
  );
  const [format, setFormat] = useState<AudioFormat>('wav');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileProcess = async (file: File) => {
    if (!file) return;
    if (!['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/x-wav'].includes(file.type) && !file.name.match(/\.(wav|mp3)$/i)) {
      alert('请上传 WAV 或 MP3 格式的音频样本文件');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('音频样本大小不能超过 10 MB');
      return;
    }

    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setSampleAudioUrl(url);

    try {
      const base64Uri = await fileToBase64(file);
      setSampleBase64(base64Uri);
    } catch (e) {
      console.error('Base64 conversion failed:', e);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveSample = () => {
    setAudioFile(null);
    setSampleBase64('');
    if (sampleAudioUrl) {
      URL.revokeObjectURL(sampleAudioUrl);
      setSampleAudioUrl(null);
    }
    setIsSamplePlaying(false);
  };

  const toggleSamplePlay = () => {
    if (!sampleAudioRef.current || !sampleAudioUrl) return;
    if (isSamplePlaying) {
      sampleAudioRef.current.pause();
      setIsSamplePlaying(false);
    } else {
      sampleAudioRef.current.play();
      setIsSamplePlaying(true);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sampleBase64 || !synthesizeText.trim() || loading) return;

    onSynthesize({
      model: 'mimo-v2.5-tts-voiceclone',
      synthesizeText: synthesizeText.trim(),
      userPrompt: userPrompt.trim() || undefined,
      voiceBase64: sampleBase64,
      format,
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-24 animate-fadeIn">
      {/* 顶部介绍 Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-transparent border border-cyan-500/20 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-500 text-white rounded-xl shadow-md shadow-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                音频样本音色复刻 <span className="text-xs font-mono font-normal text-cyan-500">mimo-v2.5-tts-voiceclone</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                上传短音频样本（MP3/WAV），高保真复刻目标音色并合成任意文本，支持语气指令微调
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：音频样本上传与试听 (5 列) */}
        <div className="lg:col-span-5 flex flex-col gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">声音样本 (≤ 10MB)</span>
            </div>
            {sampleBase64 && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>样本已就绪</span>
              </span>
            )}
          </div>

          {/* 拖拽上传区域 */}
          {!audioFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                dragOver
                  ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 hover:border-cyan-400 hover:bg-cyan-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".wav,.mp3,audio/wav,audio/mp3,audio/mpeg"
                onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
                className="hidden"
              />
              <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-full mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                点击选择或将音频拖入此区域
              </span>
              <span className="text-[10px] text-slate-400 text-center leading-relaxed">
                支持 .wav / .mp3 格式（建议 5~15 秒清晰无杂音干声）
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl">
              {sampleAudioUrl && (
                <audio
                  ref={sampleAudioRef}
                  src={sampleAudioUrl}
                  onEnded={() => setIsSamplePlaying(false)}
                />
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-cyan-500 text-white rounded-lg shrink-0">
                    <FileAudio className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {audioFile.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {(audioFile.size / 1024).toFixed(1)} KB · {audioFile.type || 'audio'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleSamplePlay}
                    className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white transition-colors"
                    title={isSamplePlaying ? '暂停' : '播放原声'}
                  >
                    {isSamplePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveSample}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    title="移除此样本"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 样本规范提示 */}
          <div className="p-3 bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/50 dark:border-cyan-900/40 rounded-xl text-xs text-cyan-900 dark:text-cyan-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-cyan-500" />
              <span>克隆样本规范：</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
              • 推荐 16kHz 以上单声道无背景音乐的人声录音。<br />
              • 音频已自动转换为标准 Base64 编码并附加 Data URI 头传输。
            </p>
          </div>
        </div>

        {/* 右侧：克隆目标文本与语气设置 (7 列) */}
        <div className="lg:col-span-7 flex flex-col gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          {/* 目标朗读文本 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <MessageSquare className="w-4 h-4 text-cyan-500" />
                <span>克隆朗读目标文本 (Assistant 角色)</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {synthesizeText.length} 字符
              </span>
            </div>
            <textarea
              value={synthesizeText}
              onChange={(e) => setSynthesizeText(e.target.value)}
              rows={4}
              placeholder="请输入需要用复刻音色朗读的文本内容..."
              className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-800 dark:text-slate-200 leading-relaxed font-sans"
            />
          </div>

          {/* 语气与风格指令 */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Wand2 className="w-3.5 h-3.5 text-cyan-500" />
              <span>语气与情感微调指令 (User 角色，可选)</span>
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              rows={3}
              placeholder="例如：保持原声音色，语速稍慢，语气充满长辈的慈爱与关怀..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* 底部操作条 */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400">输出格式：</span>
              {(['wav', 'mp3'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`px-2 py-0.5 rounded text-xs uppercase ${
                    format === fmt
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={loading || !sampleBase64 || !synthesizeText.trim()}
              className="flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 hover:from-cyan-700 hover:to-blue-700 rounded-xl shadow-lg shadow-cyan-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>音色复刻合成中...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>复刻音色并合成</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
