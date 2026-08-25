import React from 'react';
import {
  Mic,
  Palette,
  Layers,
  Sparkles,
  Settings,
  History,
  Sun,
  Moon,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export type AppTab = 'standard' | 'voicedesign' | 'voiceclone' | 'batch';

interface NavbarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  hasApiKey: boolean;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  historyCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  hasApiKey,
  onOpenSettings,
  onOpenHistory,
  theme,
  onToggleTheme,
  historyCount = 0,
}) => {
  const tabs = [
    { id: 'standard', label: '标准合成', icon: Mic, badge: 'V2.5' },
    { id: 'voicedesign', label: '音色设计', icon: Palette, badge: 'Prompt' },
    { id: 'voiceclone', label: '音色复刻', icon: Sparkles, badge: 'Clone' },
    { id: 'batch', label: '批量中心', icon: Layers, badge: 'Batch' },
  ] as const;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                MiMo-TTS
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900">
                Studio
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block">小米语音合成大模型工作台</p>
          </div>
        </div>

        {/* Center Tabs */}
        <nav className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Key Status Indicator */}
          <button
            type="button"
            onClick={onOpenSettings}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
              hasApiKey
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900 animate-pulse'
            }`}
          >
            {hasApiKey ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>密钥已加密就绪</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>请配置 API Key</span>
              </>
            )}
          </button>

          {/* History */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="生成历史记录"
          >
            <History className="w-5 h-5" />
            {historyCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 text-[9px] font-bold bg-orange-500 text-white rounded-full flex items-center justify-center">
                {historyCount > 99 ? '99+' : historyCount}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="切换深色/浅色主题"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="设置 API Key 与网络参数"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
