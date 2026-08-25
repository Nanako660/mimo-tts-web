import React, { useState, useEffect, useRef } from 'react';
import { Navbar, AppTab } from './components/Navbar';
import { StandardTTS } from './components/StandardTTS';
import { VoiceDesign } from './components/VoiceDesign';
import { VoiceClone } from './components/VoiceClone';
import { BatchCenter } from './components/BatchCenter';
import { SettingsModal } from './components/SettingsModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { AudioPlayer } from './components/AudioPlayer';
import { AppSettings, HistoryItem, TTSModelId, AudioFormat, StreamPlayStatus } from './types';
import { loadSettings, saveSettings, loadHistoryItems, saveHistoryItem, deleteHistoryItem, clearAllHistory } from './services/storage';
import { callTTSNonStream, callTTSStream } from './services/api';
import { PCMStreamPlayer } from './services/audio';
import { AlertCircle, X } from 'lucide-react';

export const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: '',
    baseUrl: 'https://api.xiaomimimo.com/v1',
    theme: 'dark',
    defaultFormat: 'wav',
    defaultModel: 'mimo-v2.5-tts',
    defaultVoice: 'mimo_default',
    streamOutput: true,
    concurrencyLimit: 2,
  });

  const [activeTab, setActiveTab] = useState<AppTab>('standard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 播放器状态
  // 播放器状态
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [currentAudioBase64, setCurrentAudioBase64] = useState<string | undefined>(undefined);
  const [playerTitle, setPlayerTitle] = useState<string>('合成音频预览');
  const [playerSubtitle, setPlayerSubtitle] = useState<string>('');
  const [playerFormat, setPlayerFormat] = useState<string>('wav');
  const [activeAnalyser, setActiveAnalyser] = useState<AnalyserNode | null>(null);
  const [playerAutoPlay, setPlayerAutoPlay] = useState<boolean>(true);
  const [streamStatus, setStreamStatus] = useState<StreamPlayStatus>('idle');
  const [currentPlaybackRate, setCurrentPlaybackRate] = useState<number>(1.0);
  const [streamProgress, setStreamProgress] = useState<{ currentTime: number; duration: number }>({
    currentTime: 0,
    duration: 0,
  });

  const streamPlayerRef = useRef<PCMStreamPlayer | null>(null);
  const streamTimerRef = useRef<number | null>(null);

  // 初始化加载设置与历史
  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      if (!s.apiKey) {
        setIsSettingsOpen(true);
      }
      applyTheme(s.theme);
    });

    loadHistoryItems().then(setHistory);
  }, []);

  const applyTheme = (theme: 'dark' | 'light') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleToggleTheme = () => {
    const nextTheme: 'dark' | 'light' = settings.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    const updated: AppSettings = { ...settings, theme: nextTheme };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    applyTheme(newSettings.theme);
    saveSettings(newSettings);
  };

  // 手动停止流式播放
  const handleStopStream = () => {
    if (streamPlayerRef.current) {
      streamPlayerRef.current.stop();
    }
    if (streamTimerRef.current) {
      window.clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    setStreamStatus('completed');
    setIsStreaming(false);
  };

  // 动态修改倍速
  const handlePlaybackRateChange = (newRate: number) => {
    setCurrentPlaybackRate(newRate);
    if (streamPlayerRef.current) {
      streamPlayerRef.current.setPlaybackRate(newRate);
    }
  };

  // 标准/音色设计/音色复刻合成触发器
  const handleSynthesize = async (params: {
    model: TTSModelId;
    synthesizeText: string;
    userPrompt?: string;
    voice?: string;
    voiceBase64?: string;
    format: AudioFormat;
    stream?: boolean;
    optimizeTextPreview?: boolean;
  }) => {
    if (!settings.apiKey) {
      setIsSettingsOpen(true);
      setErrorMessage('请先在设置中填写并保存您的 MiMo API Key');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    // 停止前序可能在播放的流与定时器，清空旧音频引用
    handleStopStream();
    setCurrentAudioUrl(null);
    setStreamProgress({ currentTime: 0, duration: 0 });

    const messages: any[] = [];
    if (params.userPrompt) {
      messages.push({ role: 'user', content: params.userPrompt });
    }
    if (params.synthesizeText) {
      messages.push({ role: 'assistant', content: params.synthesizeText });
    }

    const payload = {
      model: params.model,
      messages,
      audio: {
        voice: params.voice || params.voiceBase64,
        format: params.format,
        optimize_text_preview: params.optimizeTextPreview,
      },
    };

    try {
      if (params.stream && params.model === 'mimo-v2.5-tts') {
        // 阶段 1：接收与实时发声
        setPlayerAutoPlay(false);
        setIsStreaming(true);
        setStreamStatus('receiving');
        const player = new PCMStreamPlayer(24000);
        streamPlayerRef.current = player;
        const analyser = player.init(undefined, currentPlaybackRate);
        setActiveAnalyser(analyser);

        setPlayerTitle(`合成音频 (实时流式)`);
        setPlayerSubtitle(params.synthesizeText.slice(0, 30));
        setPlayerFormat('wav');

        // 启动实时流式进度监听定时器 (50ms 刷新率)
        streamTimerRef.current = window.setInterval(() => {
          if (streamPlayerRef.current) {
            const prog = streamPlayerRef.current.getCurrentProgress();
            setStreamProgress({ currentTime: prog.currentTime, duration: prog.duration });
          }
        }, 50);

        const result = await callTTSStream(
          settings.baseUrl,
          settings.apiKey,
          payload,
          (pcmChunk) => {
            player.feedPCMChunk(pcmChunk);
          }
        );

        // 阶段 2：网络响应已 100% 传输完毕，生成按钮立即解锁！
        setLoading(false);
        setStreamStatus('playing_buffer');
        const url = URL.createObjectURL(result.audioBlob);
        setCurrentAudioUrl(url);
        setCurrentAudioBase64('');
        setPlayerFormat('wav');

        // 保存历史
        const historyRecord = {
          id: `hist_${Date.now()}`,
          timestamp: Date.now(),
          model: params.model,
          mode: 'standard' as const,
          promptText: params.userPrompt || '',
          synthesizedText: params.synthesizeText,
          voice: params.voice,
          audioBlob: result.audioBlob,
          format: 'wav' as AudioFormat,
          finalTextPreview: result.finalTextPreview,
          tokensUsed: result.tokensUsed,
        };
        await saveHistoryItem(historyRecord);
        loadHistoryItems().then(setHistory);

        // 阶段 3：等待底层剩余音频发声完全结束
        await new Promise<void>((resolve) => {
          player.markStreamEnded(() => resolve());
          const prog = player.getCurrentProgress();
          const remainingSecs = Math.max(0, prog.duration - prog.currentTime);
          setTimeout(() => resolve(), (remainingSecs + 0.3) * 1000);
        });

        if (streamTimerRef.current) {
          window.clearInterval(streamTimerRef.current);
          streamTimerRef.current = null;
        }

        setStreamStatus('completed');
        setIsStreaming(false);
      } else {
        // 非流式常规合成：合成完成后自动播放一次
        setPlayerAutoPlay(true);
        setIsStreaming(false);
        setStreamStatus('idle');
        const result = await callTTSNonStream(settings.baseUrl, settings.apiKey, payload);

        setLoading(false);
        const url = URL.createObjectURL(result.audioBlob);
        setCurrentAudioUrl(url);
        setCurrentAudioBase64(result.audioBase64);
        setPlayerTitle(`合成音频 (${params.voice || params.model})`);
        setPlayerSubtitle(params.synthesizeText.slice(0, 30));
        setPlayerFormat(result.format);

        // 确定 mode
        let mode: HistoryItem['mode'] = 'standard';
        if (params.model === 'mimo-v2.5-tts-voicedesign') mode = 'voicedesign';
        if (params.model === 'mimo-v2.5-tts-voiceclone') mode = 'voiceclone';

        // 保存历史
        const historyRecord = {
          id: `hist_${Date.now()}`,
          timestamp: Date.now(),
          model: params.model,
          mode,
          promptText: params.userPrompt || '',
          synthesizedText: params.synthesizeText,
          voice: params.voice,
          audioBlob: result.audioBlob,
          format: result.format,
          finalTextPreview: result.finalTextPreview,
          tokensUsed: result.tokensUsed,
        };
        await saveHistoryItem(historyRecord);
        loadHistoryItems().then(setHistory);
      }
    } catch (err: any) {
      console.error('Synthesis error:', err);
      setErrorMessage(err.message || '语音合成请求失败，请检查配置或网络状态');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayFromItem = (url: string, title: string) => {
    handleStopStream();
    setPlayerAutoPlay(true);
    setCurrentAudioUrl(url);
    setPlayerTitle(title);
    setPlayerSubtitle('点击播放试听');
  };

  const handleDeleteHistory = async (id: string) => {
    await deleteHistoryItem(id);
    loadHistoryItems().then(setHistory);
  };

  const handleClearHistory = async () => {
    await clearAllHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-orange-500 selection:text-white transition-colors duration-200">
      {/* 顶部导航 */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasApiKey={Boolean(settings.apiKey)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        historyCount={history.length}
      />

      {/* 错误提示条 */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-4 animate-fadeIn">
          <div className="flex items-center justify-between p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 主体工作区 */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
        {activeTab === 'standard' && (
          <StandardTTS
            onSynthesize={handleSynthesize}
            loading={loading}
            isStreaming={isStreaming}
            defaultVoice={settings.defaultVoice}
            defaultStream={settings.streamOutput}
          />
        )}

        {activeTab === 'voicedesign' && (
          <VoiceDesign
            onSynthesize={handleSynthesize}
            loading={loading}
            isStreaming={isStreaming}
          />
        )}

        {activeTab === 'voiceclone' && (
          <VoiceClone
            onSynthesize={handleSynthesize}
            loading={loading}
          />
        )}

        {activeTab === 'batch' && (
          <BatchCenter
            apiKey={settings.apiKey}
            baseUrl={settings.baseUrl}
            concurrencyLimit={settings.concurrencyLimit}
            onAudioPlay={handlePlayFromItem}
          />
        )}
      </main>

      {/* 底部波形播放器 */}
      <AudioPlayer
        audioUrl={currentAudioUrl}
        audioBase64={currentAudioBase64}
        title={playerTitle}
        subtitle={playerSubtitle}
        analyser={activeAnalyser}
        isStreaming={isStreaming}
        streamStatus={streamStatus}
        streamProgress={streamProgress}
        onStopStream={handleStopStream}
        onPlaybackRateChange={handlePlaybackRateChange}
        format={playerFormat}
        autoPlay={playerAutoPlay}
      />

      {/* 设置弹窗 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* 历史抽屉 */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onPlay={handlePlayFromItem}
        onDelete={handleDeleteHistory}
        onClearAll={handleClearHistory}
      />
    </div>
  );
};
