import React, { useState, useRef } from 'react';
import {
  Play,
  Sparkles,
  Search,
  Check,
  RefreshCw,
  MessageSquare,
  Wand2,
  Music,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';
import { BUILT_IN_VOICES } from '../utils/constants';
import { BuiltInVoice, TTSModelId, AudioFormat } from '../types';
import { TagToolbar } from './TagToolbar';
import { DirectorModal } from './DirectorModal';

interface StandardTTSProps {
  onSynthesize: (params: {
    model: TTSModelId;
    synthesizeText: string;
    userPrompt?: string;
    voice: string;
    format: AudioFormat;
    stream: boolean;
  }) => Promise<void>;
  loading: boolean;
  isStreaming: boolean;
  defaultVoice?: string;
  defaultStream?: boolean;
}

export const StandardTTS: React.FC<StandardTTSProps> = ({
  onSynthesize,
  loading,
  isStreaming,
  defaultVoice = 'mimo_default',
  defaultStream = true,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<string>(defaultVoice);
  const [langFilter, setLangFilter] = useState<'全部' | '中文' | '英文'>('全部');
  const [genderFilter, setGenderFilter] = useState<'全部' | '女性' | '男性'>('全部');
  const [searchVoice, setSearchVoice] = useState('');

  const [synthesizeText, setSynthesizeText] = useState(
    '欢迎使用小米 MiMo 语音合成大模型！支持多情绪混合、方言、甚至细腻到字词粒度的呼吸与叹息声。'
  );
  const [userPrompt, setUserPrompt] = useState(
    '用轻快亲切的语调播报，声音充满朝气与亲和力。'
  );

  const [stream, setStream] = useState(defaultStream);
  const [format, setFormat] = useState<AudioFormat>('wav');
  const [isDirectorModalOpen, setIsDirectorModalOpen] = useState(false);

  const synthTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 过滤音色
  const filteredVoices = BUILT_IN_VOICES.filter((v) => {
    if (langFilter !== '全部' && v.language !== langFilter) return false;
    if (genderFilter !== '全部' && v.gender !== genderFilter && v.gender !== '中性') return false;
    if (searchVoice.trim()) {
      const q = searchVoice.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.recommendedTags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleInsertTag = (tag: string, isAudioTag?: boolean) => {
    const textarea = synthTextareaRef.current;
    if (!textarea) {
      setSynthesizeText((prev) => (isAudioTag ? `${prev} ${tag}` : `${tag}${prev}`));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = synthesizeText;

    if (!isAudioTag && tag.startsWith('(')) {
      // 整体风格标签置于开头
      if (current.startsWith('(') && current.includes(')')) {
        // 合并已有开头风格标签
        const existingEnd = current.indexOf(')');
        const inside = current.slice(1, existingEnd);
        const tagInner = tag.slice(1, -1);
        const next = `(${inside} ${tagInner})${current.slice(existingEnd + 1)}`;
        setSynthesizeText(next);
      } else {
        setSynthesizeText(`${tag}${current}`);
      }
    } else {
      // 句中音频标签插入在光标位置
      const next = current.substring(0, start) + tag + current.substring(end);
      setSynthesizeText(next);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    }
  };

  const handleApplyDirector = (prompt: string, sampleText?: string) => {
    setUserPrompt(prompt);
    if (sampleText) {
      setSynthesizeText(sampleText);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!synthesizeText.trim() || loading) return;

    onSynthesize({
      model: 'mimo-v2.5-tts',
      synthesizeText: synthesizeText.trim(),
      userPrompt: userPrompt.trim() || undefined,
      voice: selectedVoice,
      format: stream ? 'pcm16' : format,
      stream,
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-24 animate-fadeIn">
      {/* 顶部介绍 Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500 text-white rounded-xl shadow-md shadow-orange-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                标准语音合成 <span className="text-xs font-mono font-normal text-orange-500">mimo-v2.5-tts</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                支持精品预置音色、双重风格控制（自然语言指令 + 括号标签）、低延迟流式 PCM16 输出及一键唱歌模式
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleInsertTag('(唱歌)')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 hover:bg-orange-200 dark:hover:bg-orange-900/60 rounded-xl transition-colors"
            >
              <Music className="w-3.5 h-3.5" />
              <span>插入 (唱歌) 标签</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：音色库选择 (5 列) */}
        <div className="lg:col-span-5 flex flex-col gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">精品预置音色库</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                {filteredVoices.length} 款
              </span>
            </div>

            {/* 语言与性别过滤 */}
            <div className="flex items-center gap-1 text-xs">
              {(['全部', '中文', '英文'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLangFilter(l)}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    langFilter === l
                      ? 'bg-orange-500 text-white font-medium'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchVoice}
              onChange={(e) => setSearchVoice(e.target.value)}
              placeholder="搜索音色名称、特点、标签..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* 音色卡片列表 */}
          <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
            {filteredVoices.map((voice: BuiltInVoice) => {
              const isSelected = selectedVoice === voice.id;
              return (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 shadow-sm ring-1 ring-orange-500/30'
                      : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {voice.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {voice.language} · {voice.gender}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {voice.description}
                  </p>
                  {voice.recommendedTags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {voice.recommendedTags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 右侧：合成参数与文本编辑 (7 列) */}
        <div className="lg:col-span-7 flex flex-col gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          {/* 待合成文本区域 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <MessageSquare className="w-4 h-4 text-orange-500" />
                <span>目标朗读文本 (Assistant 角色消息)</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {synthesizeText.length} 字符
              </span>
            </div>

            {/* 标签辅助条 */}
            <TagToolbar
              onInsertTag={handleInsertTag}
              onOpenDirectorModal={() => setIsDirectorModalOpen(true)}
            />

            <textarea
              ref={synthTextareaRef}
              value={synthesizeText}
              onChange={(e) => setSynthesizeText(e.target.value)}
              rows={5}
              placeholder="请输入需要转换为语音的文本内容..."
              className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 dark:text-slate-200 leading-relaxed font-sans"
            />
          </div>

          {/* 语气与风格指令 (User Prompt) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Wand2 className="w-3.5 h-3.5 text-amber-500" />
                <span>发音风格与语气要求 (User 角色消息，选填)</span>
              </label>
              <button
                type="button"
                onClick={() => setIsDirectorModalOpen(true)}
                className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline"
              >
                使用导演模式剧本
              </button>
            </div>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              rows={3}
              placeholder="例如：用轻快上扬的语调向领导报喜，语速稍快，带着激动与骄傲..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* 输出配置 & 提交按钮 */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              {/* 流式开关 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stream}
                  onChange={(e) => setStream(e.target.checked)}
                  className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  低延迟流式输出
                </span>
              </label>

              {/* 音频格式 */}
              {!stream && (
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-400">格式：</span>
                  {(['wav', 'mp3'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormat(fmt)}
                      className={`px-2 py-0.5 rounded text-xs uppercase ${
                        format === fmt
                          ? 'bg-slate-800 dark:bg-slate-700 text-white font-bold'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={loading || !synthesizeText.trim()}
              className="flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl shadow-lg shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isStreaming ? '实时流式传输中...' : '生成语音中...'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>立即生成语音</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 导演模式弹窗 */}
      <DirectorModal
        isOpen={isDirectorModalOpen}
        onClose={() => setIsDirectorModalOpen(false)}
        onApply={handleApplyDirector}
      />
    </div>
  );
};
