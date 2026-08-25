import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Wand2,
  Play,
  RefreshCw,
  MessageSquare,
  Sliders,
  Check,
  Lightbulb,
} from 'lucide-react';
import { VOICE_DESIGN_PRESETS } from '../utils/constants';
import { TTSModelId, AudioFormat } from '../types';

interface VoiceDesignProps {
  onSynthesize: (params: {
    model: TTSModelId;
    synthesizeText: string;
    userPrompt?: string;
    format: AudioFormat;
    optimizeTextPreview?: boolean;
  }) => Promise<void>;
  loading: boolean;
  isStreaming: boolean;
}

export const VoiceDesign: React.FC<VoiceDesignProps> = ({
  onSynthesize,
  loading,
}) => {
  const [voicePrompt, setVoicePrompt] = useState(
    '一位年迈的老先生，说带北方口音的普通话，语速缓慢而沉稳，嗓音略带沙哑和沧桑感，充满岁月的智慧。'
  );
  const [synthesizeText, setSynthesizeText] = useState(
    '那一年大雪封山，我们几个人围在火炉旁，听着窗外的风声，谁也没想到后来的变化会这么大。'
  );
  const [optimizeTextPreview, setOptimizeTextPreview] = useState(true);
  const [format, setFormat] = useState<AudioFormat>('wav');

  // 维度组合辅助
  const [selectedGenderAge, setSelectedGenderAge] = useState('年迈老爷爷');
  const [selectedTimbre, setSelectedTimbre] = useState('略带沙哑沧桑');
  const [selectedMood, setSelectedMood] = useState('沉稳智慧');
  const [selectedSpeed, setSelectedSpeed] = useState('语速缓慢悠长');

  const handleSelectPreset = (p: { title: string; prompt: string; sampleText: string }) => {
    setVoicePrompt(p.prompt);
    setSynthesizeText(p.sampleText);
  };

  const handleBuildPromptFromDimensions = () => {
    const generated = `${selectedGenderAge}，声音${selectedTimbre}，语气${selectedMood}，${selectedSpeed}。`;
    setVoicePrompt(generated);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!voicePrompt.trim() || loading) return;

    onSynthesize({
      model: 'mimo-v2.5-tts-voicedesign',
      synthesizeText: synthesizeText.trim(),
      userPrompt: voicePrompt.trim(),
      format,
      optimizeTextPreview,
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-24 animate-fadeIn">
      {/* 顶部介绍 Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent border border-purple-500/20 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-500 to-pink-500 text-white rounded-xl shadow-md shadow-purple-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                文本描述音色设计 <span className="text-xs font-mono font-normal text-purple-500">mimo-v2.5-tts-voicedesign</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                无需音频样本，通过纯自然语言 Prompt 精准创造任意音色，支持目标文本智能润色与自动配文
              </p>
            </div>
          </div>

          {/* 智能润色开关 */}
          <label className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer shadow-xs">
            <input
              type="checkbox"
              checked={optimizeTextPreview}
              onChange={(e) => setOptimizeTextPreview(e.target.checked)}
              className="w-4 h-4 accent-purple-500 rounded"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>智能文本润色 (optimize_text_preview)</span>
            </span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：Prompt 模板与快速维度构建 (5 列) */}
        <div className="lg:col-span-5 flex flex-col gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">经典音色 Prompt 库</span>
            </div>
            <span className="text-xs text-slate-400">点击直接载入</span>
          </div>

          {/* 预设卡片 */}
          <div className="grid grid-cols-1 gap-2.5">
            {VOICE_DESIGN_PRESETS.map((preset) => (
              <button
                key={preset.title}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="flex flex-col text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/30 dark:hover:bg-purple-950/30 transition-all"
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  {preset.title}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.prompt}
                </p>
              </button>
            ))}
          </div>

          {/* 快速维度拼装器 */}
          <div className="flex flex-col gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-500" />
                <span>快速维度拼装</span>
              </span>
              <button
                type="button"
                onClick={handleBuildPromptFromDimensions}
                className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
              >
                生成并填入 ➔
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">年龄与性别</label>
                <select
                  value={selectedGenderAge}
                  onChange={(e) => setSelectedGenderAge(e.target.value)}
                  className="w-full text-xs px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  <option value="年迈老爷爷">年迈老爷爷 (70岁+)</option>
                  <option value="沉稳中年男性">沉稳中年男性 (45岁)</option>
                  <option value="阳光清爽青年男声">阳光青年男声 (20岁)</option>
                  <option value="温柔知性年轻女性">年轻知性女声 (25岁)</option>
                  <option value="甜美软萌少女">甜美少女 (18岁)</option>
                  <option value="天真幼态童声">天真童声 (7岁)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">音色质感</label>
                <select
                  value={selectedTimbre}
                  onChange={(e) => setSelectedTimbre(e.target.value)}
                  className="w-full text-xs px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  <option value="略带沙哑沧桑">略带沙哑沧桑</option>
                  <option value="磁性醇厚有穿透力">磁性醇厚有穿透力</option>
                  <option value="清脆甜美贴耳">清脆甜美贴耳</option>
                  <option value="空灵悠远">空灵悠远</option>
                  <option value="金属冷峻无感情">金属冷峻无感情</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">情绪语气</label>
                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  className="w-full text-xs px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  <option value="沉稳智慧、从容不迫">沉稳智慧</option>
                  <option value="温柔治愈、充满关怀">温柔治愈</option>
                  <option value="高亢兴奋、充满爆发力">高亢兴奋</option>
                  <option value="冰冷威严、极具压迫感">冰冷威严</option>
                  <option value="疲惫慵懒、漫不经心">疲惫慵懒</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">语速节奏</label>
                <select
                  value={selectedSpeed}
                  onChange={(e) => setSelectedSpeed(e.target.value)}
                  className="w-full text-xs px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  <option value="语速缓慢悠长">语速缓慢悠长</option>
                  <option value="语速适中自然">语速适中自然</option>
                  <option value="语速极快如连珠炮">语速极快如连珠炮</option>
                  <option value="节奏感强、顿挫分明">节奏感强、顿挫分明</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：Prompt 与目标朗读文本编辑 (7 列) */}
        <div className="lg:col-span-7 flex flex-col gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          {/* 音色描述 Prompt (必填) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Palette className="w-4 h-4 text-purple-500" />
                <span>音色设计描述 (Voice Prompt, 必填)</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {voicePrompt.length} 字符
              </span>
            </div>
            <textarea
              value={voicePrompt}
              onChange={(e) => setVoicePrompt(e.target.value)}
              rows={4}
              placeholder="请输入清晰的音色描述（如：一位年迈的老先生，北方口音，嗓音沙哑沧桑，语速缓慢沉稳...）"
              className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-800 dark:text-slate-200 leading-relaxed font-sans"
            />
          </div>

          {/* 目标朗读文本 (选填/必填) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <MessageSquare className="w-4 h-4 text-purple-500" />
                <span>目标朗读文本 (Assistant 角色，可选)</span>
              </label>
              {optimizeTextPreview && (
                <span className="text-[11px] text-purple-500">
                  ✨ 开启润色时若为空，将自动根据音色 Prompt 智能配文
                </span>
              )}
            </div>
            <textarea
              value={synthesizeText}
              onChange={(e) => setSynthesizeText(e.target.value)}
              rows={4}
              placeholder="请输入需要朗读的台词或文本..."
              className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-800 dark:text-slate-200 leading-relaxed font-sans"
            />
          </div>

          {/* 提示指南 */}
          <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-900/40 rounded-xl text-xs text-purple-900 dark:text-purple-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Lightbulb className="w-3.5 h-3.5 text-purple-500" />
              <span>Prompt 编写高分技巧：</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
              • 推荐 1~4 句简练描述核心特征，避免混响、回声等后期音频特效词。<br />
              • 台词风格应与音色特征相符（例如给温柔治愈女声搭配晚安短文）。
            </p>
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
                      ? 'bg-purple-600 text-white font-bold'
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
              disabled={loading || !voicePrompt.trim()}
              className="flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:to-pink-700 rounded-xl shadow-lg shadow-purple-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>音色设计合成中...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>设计音色并生成</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
