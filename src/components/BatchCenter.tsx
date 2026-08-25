import React, { useState, useRef } from 'react';
import {
  Layers,
  UploadCloud,
  Play,
  Pause,
  RotateCcw,
  Download,
  Trash2,
  FileText,
  Package,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Combine,
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { BUILT_IN_VOICES } from '../utils/constants';
import { BatchTaskItem, TTSModelId, AudioFormat } from '../types';
import { callTTSNonStream } from '../services/api';
import { mergeAudioBlobs } from '../services/audio';

interface BatchCenterProps {
  apiKey: string;
  baseUrl: string;
  concurrencyLimit?: number;
  onAudioPlay: (url: string, title: string) => void;
}

export const BatchCenter: React.FC<BatchCenterProps> = ({
  apiKey,
  baseUrl,
  concurrencyLimit = 2,
  onAudioPlay,
}) => {
  const [tasks, setTasks] = useState<BatchTaskItem[]>([]);
  const [globalVoice, setGlobalVoice] = useState('mimo_default');
  const [globalModel, setGlobalModel] = useState<TTSModelId>('mimo-v2.5-tts');
  const [globalPrompt, setGlobalPrompt] = useState('');
  const [format, setFormat] = useState<AudioFormat>('wav');

  const [rawText, setRawText] = useState('');
  const [splitMode, setSplitMode] = useState<'line' | 'paragraph'>('line');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0, failed: 0 });
  const [isExporting, setIsExporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cancelRef = useRef(false);

  // 解析并导入文本为任务
  const handleImportText = () => {
    if (!rawText.trim()) return;

    let lines: string[] = [];
    if (splitMode === 'line') {
      lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    } else {
      lines = rawText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    }

    const newTasks: BatchTaskItem[] = lines.map((text, idx) => ({
      id: `batch_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
      index: tasks.length + idx + 1,
      text,
      userPrompt: globalPrompt || undefined,
      voice: globalVoice,
      model: globalModel,
      status: 'pending',
    }));

    setTasks((prev) => [...prev, ...newTasks]);
    setRawText('');
  };

  // 文件导入 (TXT, CSV, JSON)
  const handleFileImport = (file: File) => {
    if (!file) return;
    const reader = new FileReader();

    if (file.name.endsWith('.json')) {
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (Array.isArray(json)) {
            const newTasks: BatchTaskItem[] = json.map((item, idx) => ({
              id: `batch_${Date.now()}_${idx}`,
              index: tasks.length + idx + 1,
              text: typeof item === 'string' ? item : item.text || item.content || '',
              userPrompt: item.prompt || item.userPrompt || globalPrompt || undefined,
              voice: item.voice || globalVoice,
              model: item.model || globalModel,
              status: 'pending' as const,
            })).filter((t) => t.text);
            setTasks((prev) => [...prev, ...newTasks]);
          }
        } catch {
          alert('JSON 格式错误，请确保文件包含文本数组或对象列表');
        }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.csv')) {
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const rows = content.split('\n').map((r) => r.trim()).filter(Boolean);
        // 若首行为标题行跳过
        const startIdx = rows[0]?.toLowerCase().includes('text') ? 1 : 0;
        const newTasks: BatchTaskItem[] = rows.slice(startIdx).map((row, idx) => {
          const cols = row.split(',');
          return {
            id: `batch_${Date.now()}_${idx}`,
            index: tasks.length + idx + 1,
            text: cols[0]?.replace(/^["']|["']$/g, '') || '',
            userPrompt: cols[1]?.replace(/^["']|["']$/g, '') || globalPrompt || undefined,
            voice: cols[2]?.replace(/^["']|["']$/g, '') || globalVoice,
            model: globalModel,
            status: 'pending' as const,
          };
        }).filter((t) => t.text);
        setTasks((prev) => [...prev, ...newTasks]);
      };
      reader.readAsText(file);
    } else {
      // 纯文本 TXT
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
        const newTasks: BatchTaskItem[] = lines.map((text, idx) => ({
          id: `batch_${Date.now()}_${idx}`,
          index: tasks.length + idx + 1,
          text,
          userPrompt: globalPrompt || undefined,
          voice: globalVoice,
          model: globalModel,
          status: 'pending' as const,
        }));
        setTasks((prev) => [...prev, ...newTasks]);
      };
      reader.readAsText(file);
    }
  };

  // 开始批量合成
  const handleStartBatch = async () => {
    if (!apiKey) {
      alert('请先在右上角【设置】中配置您的 MiMo API Key');
      return;
    }
    const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'failed');
    if (pendingTasks.length === 0) return;

    setIsProcessing(true);
    setIsPaused(false);
    cancelRef.current = false;

    let completedCount = tasks.filter((t) => t.status === 'success').length;
    let failedCount = 0;

    // 工作池并发执行器
    const queue = [...pendingTasks];
    const runWorker = async () => {
      while (queue.length > 0 && !cancelRef.current) {
        const task = queue.shift();
        if (!task) break;

        // 更新状态为 processing
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: 'processing', error: undefined } : t))
        );

        try {
          const messages: any[] = [];
          if (task.userPrompt) {
            messages.push({ role: 'user', content: task.userPrompt });
          }
          messages.push({ role: 'assistant', content: task.text });

          const result = await callTTSNonStream(baseUrl, apiKey, {
            model: task.model,
            messages,
            audio: {
              voice: task.voice,
              format,
            },
          });

          const blobUrl = URL.createObjectURL(result.audioBlob);
          completedCount++;
          setTasks((prev) =>
            prev.map((t) =>
              t.id === task.id
                ? {
                    ...t,
                    status: 'success',
                    audioBlob: result.audioBlob,
                    audioBlobUrl: blobUrl,
                    audioBase64: result.audioBase64,
                    tokensUsed: result.tokensUsed,
                  }
                : t
            )
          );
        } catch (err: any) {
          failedCount++;
          setTasks((prev) =>
            prev.map((t) =>
              t.id === task.id
                ? {
                    ...t,
                    status: 'failed',
                    error: err.message || '合成失败',
                  }
                : t
            )
          );
        }

        setProgress({
          completed: completedCount,
          total: tasks.length,
          failed: failedCount,
        });

        // 避免过于密集触发速率限制
        await new Promise((r) => setTimeout(r, 200));
      }
    };

    const workers = Array.from({ length: Math.min(concurrencyLimit, pendingTasks.length) }, () =>
      runWorker()
    );

    await Promise.all(workers);
    setIsProcessing(false);
  };

  const handlePauseBatch = () => {
    cancelRef.current = true;
    setIsProcessing(false);
    setIsPaused(true);
  };

  const handleClearAll = () => {
    if (isProcessing) return;
    tasks.forEach((t) => t.audioBlobUrl && URL.revokeObjectURL(t.audioBlobUrl));
    setTasks([]);
    setProgress({ completed: 0, total: 0, failed: 0 });
  };

  // 打包导出为 ZIP
  const handleExportZip = async () => {
    const successTasks = tasks.filter((t) => t.status === 'success' && t.audioBlob);
    if (successTasks.length === 0) {
      alert('没有已成功生成的音频可供导出');
      return;
    }

    setIsExporting(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('mimo_tts_batch_audio');

      const manifest: any[] = [];

      successTasks.forEach((t, i) => {
        const filename = `${String(i + 1).padStart(3, '0')}_${t.text.slice(0, 12).replace(/[\\/:*?"<>|]/g, '')}.${format}`;
        if (folder && t.audioBlob) {
          folder.file(filename, t.audioBlob);
        }
        manifest.push({
          index: i + 1,
          filename,
          text: t.text,
          voice: t.voice,
          model: t.model,
          prompt: t.userPrompt,
          tokensUsed: t.tokensUsed,
        });
      });

      // 附加清单文件
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `mimo_tts_batch_${Date.now()}.zip`);
    } catch (e) {
      console.error('ZIP generation failed:', e);
      alert('打包导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  // 合并为一个完整大音频并导出
  const handleMergeAndExport = async () => {
    const successTasks = tasks.filter((t) => t.status === 'success' && t.audioBlob);
    if (successTasks.length === 0) {
      alert('没有已成功生成的音频可供合并');
      return;
    }

    setIsExporting(true);
    try {
      const blobs = successTasks.map((t) => t.audioBlob as Blob);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const mergedBlob = await mergeAudioBlobs(blobs, audioCtx, 24000);
      saveAs(mergedBlob, `mimo_tts_merged_${Date.now()}.wav`);
    } catch (e: any) {
      alert(`合并音频失败: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const successCount = tasks.filter((t) => t.status === 'success').length;
  const percent = tasks.length > 0 ? Math.round((successCount / tasks.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 pb-24 animate-fadeIn">
      {/* 顶部介绍 Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                全功能批量合成中心
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                支持多行文本切分、TXT/CSV/JSON 批量导入、并发调度控制、单条试听、一键 ZIP 打包与无损音频拼接合并
              </p>
            </div>
          </div>

          {/* 进度概览 */}
          {tasks.length > 0 && (
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  已完成 {successCount} / {tasks.length} ({percent}%)
                </div>
                <div className="text-[10px] text-slate-400">并发限制: {concurrencyLimit} 线程</div>
              </div>
              <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 批量输入与全局设置 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：输入与导入 (5 列) */}
        <div className="lg:col-span-5 flex flex-col gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>批量文本输入 / 文件导入</span>
            </span>
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setSplitMode('line')}
                className={`px-2 py-0.5 rounded ${
                  splitMode === 'line'
                    ? 'bg-emerald-500 text-white font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                按行切分
              </button>
              <button
                type="button"
                onClick={() => setSplitMode('paragraph')}
                className={`px-2 py-0.5 rounded ${
                  splitMode === 'paragraph'
                    ? 'bg-emerald-500 text-white font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                按段落切分
              </button>
            </div>
          </div>

          {/* 文本输入框 */}
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={5}
            placeholder={`在此粘贴多行文本...\n每一${splitMode === 'line' ? '行' : '个段落'}将作为一个独立的语音合成任务。`}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-slate-200 leading-relaxed font-sans"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleImportText}
              disabled={!rawText.trim()}
              className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all disabled:opacity-50"
            >
              解析并添加至任务队列
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <UploadCloud className="w-4 h-4 text-emerald-500" />
              <span>导入文件</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,.json"
              onChange={(e) => e.target.files?.[0] && handleFileImport(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* 全局音色与模型设定 */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              默认参数设定（应用于新增任务）：
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">默认音色</label>
                <select
                  value={globalVoice}
                  onChange={(e) => setGlobalVoice(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {BUILT_IN_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.language})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">输出格式</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as AudioFormat)}
                  className="w-full text-xs px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 uppercase"
                >
                  <option value="wav">WAV (无损)</option>
                  <option value="mp3">MP3</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">全局语气与风格要求 (选填)</label>
              <input
                type="text"
                value={globalPrompt}
                onChange={(e) => setGlobalPrompt(e.target.value)}
                placeholder="如：用欢快活泼的语调朗读..."
                className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* 右侧：任务队列与批量导出 (7 列) */}
        <div className="lg:col-span-7 flex flex-col gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          {/* 任务列表头与操作按钮 */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">任务列表</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                {tasks.length} 项
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!isProcessing ? (
                <button
                  type="button"
                  onClick={handleStartBatch}
                  disabled={tasks.length === 0}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>开始批量合成</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseBatch}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span>暂停</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleClearAll}
                disabled={isProcessing || tasks.length === 0}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                title="清空列表"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 任务列表 Table */}
          <div className="flex-1 overflow-y-auto max-h-[380px] border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/80">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <Layers className="w-10 h-10 mb-2 opacity-40" />
                <span className="text-xs">暂无批量任务，请在左侧输入或导入文件</span>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-950/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-6 text-[11px] font-mono text-slate-400 shrink-0">
                      #{task.index}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate">
                        {task.text}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>音色: {task.voice}</span>
                        {task.tokensUsed && <span>· 消耗 {task.tokensUsed} tokens</span>}
                      </div>
                    </div>
                  </div>

                  {/* 状态 & 操作 */}
                  <div className="flex items-center gap-2 shrink-0">
                    {task.status === 'pending' && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>等待中</span>
                      </span>
                    )}
                    {task.status === 'processing' && (
                      <span className="flex items-center gap-1 text-[11px] text-orange-500 font-medium">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>合成中...</span>
                      </span>
                    )}
                    {task.status === 'success' && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>成功</span>
                      </span>
                    )}
                    {task.status === 'failed' && (
                      <span
                        className="flex items-center gap-1 text-[11px] text-red-500"
                        title={task.error}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="max-w-[80px] truncate">{task.error || '失败'}</span>
                      </span>
                    )}

                    {task.audioBlobUrl && (
                      <button
                        type="button"
                        onClick={() => onAudioPlay(task.audioBlobUrl!, `任务 #${task.index}: ${task.text}`)}
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors"
                        title="试听音频"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 底部批量导出按钮组 */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-400">
              已就绪音频: <span className="font-bold text-slate-700 dark:text-slate-200">{successCount}</span> 个
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMergeAndExport}
                disabled={isExporting || successCount === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all disabled:opacity-50"
                title="将所有批量音频无缝拼接合并为一个单一音频文件"
              >
                <Combine className="w-3.5 h-3.5 text-emerald-500" />
                <span>合并单一大音频</span>
              </button>

              <button
                type="button"
                onClick={handleExportZip}
                disabled={isExporting || successCount === 0}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Package className="w-3.5 h-3.5" />
                )}
                <span>{isExporting ? '打包导出中...' : '一键打包 ZIP 下载'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
