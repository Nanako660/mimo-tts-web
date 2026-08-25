import React, { useState } from 'react';
import { X, Sparkles, Wand2, Check, BookOpen } from 'lucide-react';
import { DIRECTOR_PRESETS } from '../utils/constants';
import { DirectorPreset } from '../types';

interface DirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (userPrompt: string, sampleText?: string) => void;
}

export const DirectorModal: React.FC<DirectorModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  if (!isOpen) return null;

  const [selectedPreset, setSelectedPreset] = useState<DirectorPreset>(DIRECTOR_PRESETS[0]);
  const [customRole, setCustomRole] = useState(selectedPreset.role);
  const [customScene, setCustomScene] = useState(selectedPreset.scene);
  const [customGuidance, setCustomGuidance] = useState(selectedPreset.guidance);
  const [customSampleText, setCustomSampleText] = useState(selectedPreset.sampleText);

  const handleSelectPreset = (preset: DirectorPreset) => {
    setSelectedPreset(preset);
    setCustomRole(preset.role);
    setCustomScene(preset.scene);
    setCustomGuidance(preset.guidance);
    setCustomSampleText(preset.sampleText);
  };

  const handleApply = () => {
    const formattedPrompt = `角色：${customRole.trim()}

场景：${customScene.trim()}

指导：
${customGuidance.trim()}`;

    onApply(formattedPrompt, customSampleText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">导演模式剧本向导</h3>
              <p className="text-xs text-slate-500">像给专业演员写剧本一样，从【角色、场景、指导】三维度塑造电影级演绎</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              选择参考预设模板：
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIRECTOR_PRESETS.map((p) => {
                const isSelected = selectedPreset.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`px-3 py-2 text-left rounded-xl border transition-all text-xs ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 font-semibold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="truncate">{p.title}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>【角色】身份与性格底色</span>
              </label>
              <textarea
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                rows={2}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 dark:text-slate-200"
                placeholder="人物身份、性格、说话习惯..."
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>【场景】此刻发生的情境与心理状态</span>
              </label>
              <textarea
                value={customScene}
                onChange={(e) => setCustomScene(e.target.value)}
                rows={2}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 dark:text-slate-200"
                placeholder="时间、地点、事件、情绪起伏..."
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>【指导】演绎要领（语速、停顿、气声与咬字肌理）</span>
              </label>
              <textarea
                value={customGuidance}
                onChange={(e) => setCustomGuidance(e.target.value)}
                rows={4}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 dark:text-slate-200 font-mono"
                placeholder="语速、停顿、气息、重音细节要求..."
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>配套示范朗读台词（选填）：</span>
              </label>
              <textarea
                value={customSampleText}
                onChange={(e) => setCustomSampleText(e.target.value)}
                rows={2}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 dark:text-slate-200"
                placeholder="待朗读的台词内容..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-lg shadow-sm shadow-orange-500/30 transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>应用导演剧本到工作台</span>
          </button>
        </div>
      </div>
    </div>
  );
};
