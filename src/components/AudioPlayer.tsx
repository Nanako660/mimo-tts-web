import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  Copy,
  Check,
  Music,
  FastForward,
  Sparkles,
} from 'lucide-react';
import { Visualizer } from './Visualizer';
import { StreamPlayStatus } from '../types';

interface AudioPlayerProps {
  audioUrl: string | null;
  audioBase64?: string;
  title?: string;
  subtitle?: string;
  analyser?: AnalyserNode | null;
  isStreaming?: boolean;
  streamStatus?: StreamPlayStatus;
  streamProgress?: { currentTime: number; duration: number };
  onStopStream?: () => void;
  onPlaybackRateChange?: (rate: number) => void;
  onDownload?: () => void;
  format?: string;
  autoPlay?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  audioBase64,
  title = '合成音频预览',
  subtitle,
  analyser,
  isStreaming = false,
  streamStatus = 'idle',
  streamProgress,
  onStopStream,
  onPlaybackRateChange,
  format = 'wav',
  autoPlay = true,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevAudioUrlRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [audioCtxAnalyser, setAudioCtxAnalyser] = useState<AnalyserNode | null>(null);

  const isStreamActive = isStreaming || streamStatus === 'receiving' || streamStatus === 'playing_buffer';

  // 始终确保 HTML5 <audio> 的 playbackRate 与状态同步
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // 初始化标准 Audio 标签的 Analyser 用于波形显示
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      audio.playbackRate = playbackRate;
    };
    const handlePlay = () => {
      audio.playbackRate = playbackRate;
      setIsPlaying(true);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };
    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, playbackRate]);

  // 当新音频 URL 传入时准备播放（仅在 URL 真正改变且 autoPlay 为 true 时播放，杜绝重播旧音频）
  useEffect(() => {
    if (audioUrl !== prevAudioUrlRef.current) {
      prevAudioUrlRef.current = audioUrl;

      if (audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = playbackRate;
        if (autoPlay && !isStreamActive) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        } else {
          setIsPlaying(false);
        }
      } else if (!audioUrl && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
      }
    }
  }, [audioUrl, autoPlay, isStreamActive, playbackRate]);

  const togglePlay = () => {
    if (isStreamActive) {
      // 流式发声过程中点击暂停：停止当前流式播放
      if (onStopStream) onStopStream();
      return;
    }
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const changeRate = () => {
    const rates = [1.0, 1.25, 1.5, 2.0, 0.75];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
    if (onPlaybackRateChange) {
      onPlaybackRateChange(nextRate);
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const handleCopyBase64 = async () => {
    if (!audioBase64) return;
    try {
      await navigator.clipboard.writeText(audioBase64);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `mimo_tts_${Date.now()}.${format === 'mp3' ? 'mp3' : 'wav'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const displayCurrentTime = isStreamActive ? (streamProgress?.currentTime || 0) : currentTime;
  const displayDuration = isStreamActive ? (streamProgress?.duration || 0) : duration;
  const displayIsPlaying = isStreamActive ? true : isPlaying;

  const getSubtitleText = () => {
    if (streamStatus === 'receiving') {
      return '正在实时流式接收并播放...';
    }
    if (streamStatus === 'playing_buffer') {
      return '音频已生成完毕，正在播放剩余缓冲...';
    }
    return subtitle || '点击播放试听合成效果';
  };

  if (!audioUrl && !isStreamActive) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl transition-all animate-slideUp">
      <audio ref={audioRef} />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Left: Info & Visualizer */}
        <div className="flex items-center gap-3 w-full md:w-1/3 min-w-0">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
            {streamStatus === 'receiving' ? (
              <Sparkles className="w-5 h-5 animate-spin" />
            ) : (
              <Music className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {title}
            </h4>
            <p className="text-[11px] text-slate-500 truncate">
              {getSubtitleText()}
            </p>
          </div>
        </div>

        {/* Center: Controls & Seekbar */}
        <div className="flex flex-col items-center gap-1.5 w-full md:w-2/5">
          {/* Visualizer Canvas in center */}
          <div className="w-full max-w-sm h-6">
            <Visualizer analyser={analyser || audioCtxAnalyser} isPlaying={displayIsPlaying} isStreaming={streamStatus === 'receiving'} className="h-6" />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleLoop}
              disabled={isStreamActive}
              title={isLooping ? '单曲循环：开' : '单曲循环：关'}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isLooping ? 'text-orange-500 bg-orange-50 dark:bg-orange-950/50' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transition-all active:scale-95"
              title={displayIsPlaying ? '暂停' : '播放'}
            >
              {displayIsPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={changeRate}
              title="切换播放倍速"
              className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              {playbackRate}x
            </button>
          </div>

          {/* Time & Progress Bar */}
          <div className="w-full flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>{formatTime(displayCurrentTime)}</span>
            <input
              type="range"
              min="0"
              max={displayDuration || 100}
              step="0.01"
              value={displayCurrentTime}
              onChange={handleSeek}
              disabled={isStreamActive}
              className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500 disabled:opacity-60"
            />
            <span>{formatTime(displayDuration)}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-2 w-full md:w-1/3 shrink-0">
          <button
            type="button"
            onClick={toggleMute}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isMuted ? '取消静音' : '静音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {audioBase64 && (
            <button
              type="button"
              onClick={handleCopyBase64}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="复制 Base64 音频数据"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制' : 'Base64'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            disabled={!audioUrl}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下载 {format.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
