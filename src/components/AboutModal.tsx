import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Github,
  Tag,
  Calendar,
  GitCommit,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  Heart,
  ChevronRight,
  Info,
  FileText,
  RefreshCw,
  Globe,
  Radio,
} from 'lucide-react';
import {
  getAppVersion,
  getBuildTime,
  getCommitHash,
  getCommitUrl,
  getReleaseUrl,
  GITHUB_REPO_URL,
  MIMO_OFFICIAL_URL,
  RELEASES_HISTORY,
  VersionRelease,
  fetchRemoteChangelog,
} from '../utils/version';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'about' | 'changelog';
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'about',
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'changelog'>(defaultTab);
  const [releases, setReleases] = useState<VersionRelease[]>(RELEASES_HISTORY);
  const [loadingChangelog, setLoadingChangelog] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('');

  const version = getAppVersion();
  const buildTime = getBuildTime();
  const commitHash = getCommitHash();
  const commitUrl = getCommitUrl(commitHash);
  const releaseUrl = getReleaseUrl(version);

  const loadChangelog = async (force: boolean = false) => {
    setLoadingChangelog(true);
    try {
      const result = await fetchRemoteChangelog(force);
      setReleases(result.releases);
      if (result.source === 'github_releases') {
        setSyncStatus('已同步最新 GitHub Releases');
      } else if (result.source === 'github_raw') {
        setSyncStatus('已从 GitHub Raw CHANGELOG 同步');
      } else if (result.source === 'cache') {
        setSyncStatus(`本地缓存 (${result.lastUpdatedText})`);
      } else {
        setSyncStatus('离线内置数据');
      }
    } catch {
      setSyncStatus('同步失败，已展示本地数据');
    } finally {
      setLoadingChangelog(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadChangelog(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>MiMo-TTS Studio</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900">
                  v{version}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                小米语音合成大模型工作台 · 版本与系统信息
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Refresh Bar */}
        <div className="flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex">
            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'about'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>关于项目</span>
            </button>
            <button
              onClick={() => setActiveTab('changelog')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'changelog'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>更新日志</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {releases.length}
              </span>
            </button>
          </div>

          {activeTab === 'changelog' && (
            <div className="flex items-center gap-2">
              {syncStatus && (
                <span className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                  {syncStatus}
                </span>
              )}
              <button
                type="button"
                onClick={() => loadChangelog(true)}
                disabled={loadingChangelog}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg transition-colors disabled:opacity-50"
                title="强制从 GitHub 检查并拉取最新 Release / CHANGELOG"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loadingChangelog ? 'animate-spin text-orange-500' : ''}`}
                />
                <span className="hidden sm:inline">从 GitHub 刷新</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300">
          {activeTab === 'about' ? (
            <div className="space-y-6">
              {/* Version & Build Metadata Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  构建元信息
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                    <span className="text-slate-400 block mb-1">当前版本</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      v{version}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                    <span className="text-slate-400 block mb-1">构建时间</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {buildTime}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                    <span className="text-slate-400 block mb-1">Git Commit</span>
                    <a
                      href={commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <GitCommit className="w-3 h-3" />
                      {commitHash}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Core Features Overview */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  核心功能概览
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5">
                    <div className="p-1.5 bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-lg shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        MiMo-TTS V2.5 官方支持
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        支持标准合成、自然语言音色设计、高保真声音复刻与并发批量处理。
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5">
                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        零服务端 · 隐私安全
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        API 密钥本地 AES 加密，纯客户端直连小米开放平台，历史数据离线存储。
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        独立单文件 HTML 运行
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        支持将全部资源打包至单个独立 HTML 页面，双击即用，无需配置 Node 环境。
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-lg shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        全自动版本与发版体系
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        规范提交、自动 CHANGELOG、GitHub Release CI/CD 与实时云端同步。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Links */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  相关链接
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <a
                    href={MIMO_OFFICIAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 bg-slate-50/50 dark:bg-slate-800/30 transition-all hover:shadow-sm group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        小米 MiMo 官网 (mimo.mi.com)
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </a>

                  <a
                    href={GITHUB_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 bg-slate-50/50 dark:bg-slate-800/30 transition-all hover:shadow-sm group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Github className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        GitHub 仓库
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </a>

                  <a
                    href={`${GITHUB_REPO_URL}/releases`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 bg-slate-50/50 dark:bg-slate-800/30 transition-all hover:shadow-sm group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Tag className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        发布版本与离线包下载
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </a>

                  <a
                    href={`${GITHUB_REPO_URL}/issues`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 bg-slate-50/50 dark:bg-slate-800/30 transition-all hover:shadow-sm group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        问题反馈与功能建议
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {loadingChangelog && releases.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
                  <span className="text-xs">正在从 GitHub 获取最新更新日志...</span>
                </div>
              ) : (
                releases.map((rel) => (
                  <div
                    key={rel.version}
                    className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-4"
                  >
                    {/* Release Title Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                          v{rel.version}
                        </span>
                        {rel.isLatest && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                            最新版本
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {rel.date}
                        </span>
                        <a
                          href={rel.releaseUrl || releaseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5 font-medium"
                        >
                          GitHub Release <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {rel.highlights && (
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800/90 p-3 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                        {rel.highlights}
                      </p>
                    )}

                    {/* Features */}
                    {rel.features && rel.features.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                          ✨ 新增功能 (Features)
                        </h4>
                        <ul className="space-y-1 pl-4 text-xs text-slate-600 dark:text-slate-300 list-disc marker:text-orange-400">
                          {rel.features.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvements */}
                    {rel.improvements && rel.improvements.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                          ⚡️ 性能与优化 (Improvements)
                        </h4>
                        <ul className="space-y-1 pl-4 text-xs text-slate-600 dark:text-slate-300 list-disc marker:text-blue-400">
                          {rel.improvements.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Bug Fixes */}
                    {rel.fixes && rel.fixes.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                          🐛 缺陷修复 (Bug Fixes)
                        </h4>
                        <ul className="space-y-1 pl-4 text-xs text-slate-600 dark:text-slate-300 list-disc marker:text-rose-400">
                          {rel.fixes.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Docs */}
                    {rel.docs && rel.docs.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                          📝 文档更新 (Documentation)
                        </h4>
                        <ul className="space-y-1 pl-4 text-xs text-slate-600 dark:text-slate-300 list-disc marker:text-slate-400">
                          {rel.docs.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <a
              href={MIMO_OFFICIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-700 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
            >
              Xiaomi MiMo-TTS
            </a>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
