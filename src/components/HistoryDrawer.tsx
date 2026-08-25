import React from 'react';
import {
  X,
  History,
  Play,
  Download,
  Trash2,
  Clock,
  Sparkles,
  Palette,
  Mic,
  RotateCcw,
} from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onPlay: (url: string, title: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onReuse?: (item: HistoryItem) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onPlay,
  onDelete,
  onClearAll,
  onReuse,
}) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const getModeIcon = (mode: HistoryItem['mode']) => {
    switch (mode) {
      case 'voicedesign':
        return <Palette className="w-3.5 h-3.5 text-purple-500" />;
      case 'voiceclone':
        return <Sparkles className="w-3.5 h-3.5 text-cyan-500" />;
      default:
        return <Mic className="w-3.5 h-3.5 text-orange-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slideLeft">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">生成历史记录</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="清空所有历史"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <History className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs">暂无生成记录</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-orange-300 dark:hover:border-orange-700 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                    {getModeIcon(item.mode)}
                    <span>{item.voice || item.model}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    {formatDate(item.timestamp)}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed font-sans">
                  {item.synthesizedText}
                </p>

                {item.finalTextPreview && (
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 line-clamp-2 italic bg-purple-50 dark:bg-purple-950/30 p-1.5 rounded">
                    润色后: {item.finalTextPreview}
                  </p>
                )}

                {item.promptText && (
                  <p className="text-[10px] text-slate-400 line-clamp-1">
                    Prompt: {item.promptText}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.tokensUsed ? `${item.tokensUsed} tokens` : ''} · {item.format.toUpperCase()}
                  </span>

                  <div className="flex items-center gap-1">
                    {onReuse && (
                      <button
                        type="button"
                        onClick={() => {
                          onReuse(item);
                          onClose();
                        }}
                        className="p-1 text-slate-400 hover:text-orange-500 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="重用文本与参数"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <a
                      href={item.audioBlobUrl}
                      download={`mimo_${item.id}.${item.format}`}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="下载音频"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="删除记录"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onPlay(item.audioBlobUrl, item.synthesizedText)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-xs transition-all active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>播放</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
