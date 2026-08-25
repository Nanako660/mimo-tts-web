export interface VersionRelease {
  version: string;
  date: string;
  isLatest?: boolean;
  highlights?: string;
  features?: string[];
  fixes?: string[];
  improvements?: string[];
  docs?: string[];
}

export const GITHUB_REPO_URL = 'https://github.com/Nanako660/mimo-tts-web';

export const getAppVersion = (): string => {
  try {
    return typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0';
  } catch {
    return '1.0.0';
  }
};

export const getBuildTime = (): string => {
  try {
    if (typeof __BUILD_TIME__ !== 'undefined') {
      const date = new Date(__BUILD_TIME__);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
      }
      return __BUILD_TIME__;
    }
  } catch {
    // fallback
  }
  return '未知时间';
};

export const getCommitHash = (): string => {
  try {
    return typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : 'main';
  } catch {
    return 'main';
  }
};

export const getCommitUrl = (hash: string = getCommitHash()): string => {
  if (!hash || hash === 'unknown' || hash === 'main') {
    return `${GITHUB_REPO_URL}/commits/main`;
  }
  return `${GITHUB_REPO_URL}/commit/${hash}`;
};

export const getReleaseUrl = (version: string = getAppVersion()): string => {
  return `${GITHUB_REPO_URL}/releases/tag/v${version}`;
};

export const RELEASES_HISTORY: VersionRelease[] = [
  {
    version: '1.0.0',
    date: '2026-08-26',
    isLatest: true,
    highlights: 'MiMo-TTS Studio 首个正式版本发布，支持完整的单文件 Web 离线运行与版本管理闭环。',
    features: [
      '标准语音合成（Standard TTS）：支持 MiMo-TTS V2.5 官方音色、情感风格、多语种控制及参数微调',
      '音色设计（Voice Design）：支持自由输入自然语言 Prompt 描述定制独特色彩的虚拟音色',
      '声音复刻（Voice Clone）：支持上传/录制参考音频及对应参考文本完成 1:1 高保真复刻',
      '批量中心（Batch Center）：多句长文本智能切分、并发排队合成、打包 ZIP 一键导出',
      '音频可视化与剪辑：实时波形可视化、音频频谱分析、播放变速与格式下载',
      '数据持久化与安全：IndexedDB 存储大容量历史记录，API Key 本地 AES 加密隔离存储',
      '单文件离线发布（SingleFile）：支持单个 HTML 绿色运行，无需任何后端环境依赖',
      '现代化版本管理体系：集成 Conventional Commits、自动化 CHANGELOG、GitHub Release CI/CD',
    ],
    improvements: [
      '全面支持深色 (Dark) / 浅色 (Light) 主题一键无缝切换',
      '响应式移动端与桌面端自适应布局适配',
      '优化大文件音频下载与 ZIP 打包内存占用',
    ],
    docs: [
      '补充完善了完整的 README.md 部署说明与 API Key 获取指南',
      '添加 Conventional Commits 提交规范与自动化发版文档',
    ],
  },
];
