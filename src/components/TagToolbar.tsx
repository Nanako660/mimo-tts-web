import React, { useState } from 'react';
import { Sparkles, ChevronDown, Wand2, Mic } from 'lucide-react';
import { TAG_CATEGORIES } from '../utils/constants';

interface TagToolbarProps {
  onInsertTag: (tag: string, isAudioTag?: boolean) => void;
  onOpenDirectorModal?: () => void;
  showDirectorButton?: boolean;
}

export const TagToolbar: React.FC<TagToolbarProps> = ({
  onInsertTag,
  onOpenDirectorModal,
  showDirectorButton = true,
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const quickPills = [
    { label: '✨ 唱歌', tag: '(唱歌)' },
    { label: '😊 开心', tag: '(开心)' },
    { label: '🌸 温柔', tag: '(温柔)' },
    { label: '🎙️ 磁性', tag: '(磁性)' },
    { label: '🗣️ 东北话', tag: '(东北话)' },
    { label: '🥟 粤语', tag: '(粤语)' },
    { label: '😮‍💨 深呼吸', tag: '[深呼吸]', isAudioTag: true },
    { label: '🤭 轻笑', tag: '[轻笑]', isAudioTag: true },
    { label: '⏳ 沉默片刻', tag: '[沉默片刻]', isAudioTag: true },
    { label: '💔 哽咽', tag: '[哽咽]', isAudioTag: true },
  ];

  return (
    <div className="flex flex-col gap-2 p-2.5 bg-slate-100/80 dark:bg-slate-900/60 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl transition-all">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          <span>发音与动作标签助手</span>
          <span className="text-[11px] font-normal text-slate-400">（点击光标处插入）</span>
        </div>

        {showDirectorButton && onOpenDirectorModal && (
          <button
            type="button"
            onClick={onOpenDirectorModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 border border-orange-200 dark:border-orange-800 rounded-lg transition-colors shadow-sm"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>导演模式剧本向导</span>
          </button>
        )}
      </div>

      {/* 快捷标签药丸 */}
      <div className="flex flex-wrap items-center gap-1.5">
        {quickPills.map((pill) => (
          <button
            key={pill.tag}
            type="button"
            onClick={() => onInsertTag(pill.tag, pill.isAudioTag)}
            className="px-2 py-0.5 text-xs font-medium bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 border border-slate-200 dark:border-slate-700/80 hover:border-orange-300 dark:hover:border-orange-700 rounded-md transition-all active:scale-95 shadow-xs"
          >
            {pill.label}
          </button>
        ))}

        {/* 展开全量分类下拉 */}
        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setActiveCategory(activeCategory ? null : 'all')}
            className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md transition-colors"
          >
            <span>更多分类</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeCategory ? 'rotate-180' : ''}`} />
          </button>

          {activeCategory && (
            <div className="absolute left-0 top-full mt-1 z-30 w-80 max-h-72 overflow-y-auto p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl backdrop-blur-lg">
              <div className="flex flex-col gap-3">
                {TAG_CATEGORIES.map((cat) => (
                  <div key={cat.category} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{cat.category}</span>
                      <span className="text-[10px] text-slate-400">{cat.description}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cat.tags.map((t) => (
                        <button
                          key={t.tag}
                          type="button"
                          title={t.desc}
                          onClick={() => {
                            onInsertTag(t.tag, t.isAudioTag);
                            setActiveCategory(null);
                          }}
                          className="px-1.5 py-0.5 text-[11px] bg-slate-50 dark:bg-slate-800/80 hover:bg-orange-500 hover:text-white text-slate-600 dark:text-slate-300 rounded transition-colors"
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
