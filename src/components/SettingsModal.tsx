import React, { useState } from 'react';
import {
  X,
  Key,
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { AppSettings } from '../types';
import { testConnection } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  if (!isOpen) return null;

  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl || 'https://api.xiaomimimo.com/v1');
  const [streamOutput, setStreamOutput] = useState(settings.streamOutput ?? true);
  const [concurrencyLimit, setConcurrencyLimit] = useState(settings.concurrencyLimit || 2);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleTest = async () => {
    if (!apiKey) {
      setTestResult({ ok: false, message: '请先输入 API Key 再进行测试' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      await testConnection(baseUrl, apiKey);
      setTestResult({ ok: true, message: '连通性测试成功！MiMo 接口响应正常。' });
    } catch (e: any) {
      setTestResult({ ok: false, message: e.message || '连接失败，请检查网络或密钥有效性' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSave({
      ...settings,
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
      streamOutput,
      concurrencyLimit,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">API 与安全设置</h3>
              <p className="text-xs text-slate-500">配置小米 MiMo API 凭据与网络端点</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Security Notice */}
          <div className="flex items-start gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div className="leading-relaxed">
              <strong>浏览器端专属硬件级加密：</strong>您的 API Key 经由 Web Crypto API (AES-GCM 256) 设备硬件密钥加密后仅存储在当前浏览器本地，绝不经过任何第三方服务器。
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Key className="w-3.5 h-3.5 text-orange-500" />
                <span>MiMo API Key</span>
              </label>
              <a
                href="https://platform.xiaomimimo.com/console/balance"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] text-orange-600 dark:text-orange-400 hover:underline"
              >
                <span>获取 API Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="请输入您的 MiMo API Key (如 mm-xxxx...)"
                className="w-full text-xs px-3.5 py-2.5 pr-20 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 dark:text-slate-200 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-0.5 rounded"
              >
                {showKey ? '隐藏' : '显示'}
              </button>
            </div>
          </div>

          {/* Base URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Globe className="w-3.5 h-3.5 text-orange-500" />
                <span>API Base URL</span>
              </label>
              <button
                type="button"
                onClick={() => setBaseUrl('https://api.xiaomimimo.com/v1')}
                className="text-[11px] text-slate-400 hover:text-orange-500"
              >
                重置为默认
              </button>
            </div>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.xiaomimimo.com/v1"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 dark:text-slate-200 font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              支持自定义反向代理地址或企业专属 Token Plan 接口端点。
            </p>
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">默认开启流式</span>
                <span className="text-[10px] text-slate-400">实时边收边播低延迟</span>
              </div>
              <input
                type="checkbox"
                checked={streamOutput}
                onChange={(e) => setStreamOutput(e.target.checked)}
                className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex flex-col justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">批量并发上限</span>
                <span className="text-xs font-mono font-bold text-orange-500">{concurrencyLimit} 个</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={concurrencyLimit}
                onChange={(e) => setConcurrencyLimit(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500 mt-2"
              />
            </div>
          </div>

          {/* Test connection result */}
          {testResult && (
            <div
              className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
                testResult.ok
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              )}
              <span className="leading-relaxed">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !apiKey}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{testing ? '测试连通性...' : '测试连接'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-lg shadow-sm shadow-orange-500/30 transition-all active:scale-95"
            >
              保存配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
