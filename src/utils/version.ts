export interface VersionRelease {
  version: string;
  date: string;
  isLatest?: boolean;
  highlights?: string;
  features?: string[];
  fixes?: string[];
  improvements?: string[];
  docs?: string[];
  releaseUrl?: string;
}

export const GITHUB_REPO_URL = 'https://github.com/Nanako660/mimo-tts-web';
export const MIMO_OFFICIAL_URL = 'https://mimo.mi.com/';
export const GITHUB_RELEASES_API = 'https://api.github.com/repos/Nanako660/mimo-tts-web/releases';
export const GITHUB_RAW_CHANGELOG_URL = 'https://raw.githubusercontent.com/Nanako660/mimo-tts-web/main/CHANGELOG.md';

const CHANGELOG_CACHE_KEY = 'mimo_tts_changelog_cache_v1';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

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
  return `${GITHUB_REPO_URL}/releases/tag/v${version.replace(/^v/, '')}`;
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
    releaseUrl: `${GITHUB_REPO_URL}/releases/tag/v1.0.0`,
  },
];

/**
 * 解析 Markdown 文本中的分类条目列表
 */
export const parseReleaseSections = (markdownBody: string) => {
  const features: string[] = [];
  const fixes: string[] = [];
  const improvements: string[] = [];
  const docs: string[] = [];
  let highlights = '';

  const lines = markdownBody.split('\n');
  let currentCategory: 'features' | 'fixes' | 'improvements' | 'docs' | 'other' = 'other';

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 检查分类标题
    if (trimmed.startsWith('#') || trimmed.startsWith('###')) {
      const lower = trimmed.toLowerCase();
      if (lower.includes('feature') || lower.includes('新增功能') || lower.includes('feat')) {
        currentCategory = 'features';
      } else if (lower.includes('fix') || lower.includes('修复') || lower.includes('bug')) {
        currentCategory = 'fixes';
      } else if (lower.includes('perf') || lower.includes('优化') || lower.includes('improvement') || lower.includes('refactor')) {
        currentCategory = 'improvements';
      } else if (lower.includes('doc') || lower.includes('文档')) {
        currentCategory = 'docs';
      } else {
        currentCategory = 'other';
      }
      continue;
    }

    // 提取列表项
    if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
      let content = trimmed.replace(/^[\*\-]\s+/, '').trim();
      // 清理 Markdown 链接展示为更友好的文本，比如将 [hash](url) 规范化
      content = content.replace(/\[([0-9a-f]{7,8})\]\([^\)]+\)/g, '#$1');
      if (currentCategory === 'features') features.push(content);
      else if (currentCategory === 'fixes') fixes.push(content);
      else if (currentCategory === 'improvements') improvements.push(content);
      else if (currentCategory === 'docs') docs.push(content);
      else features.push(content);
    } else if (!highlights && !trimmed.startsWith('#') && !trimmed.startsWith('>')) {
      highlights = trimmed;
    }
  }

  return { features, fixes, improvements, docs, highlights };
};

/**
 * 解析 CHANGELOG.md 全文为 VersionRelease 数组
 */
export const parseChangelogMarkdown = (changelogContent: string): VersionRelease[] => {
  const releases: VersionRelease[] = [];
  const versionHeaderRegex = /##\s*(?:\[([^\]]+)\](?:\([^\)]+\))?|v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?))\s*(?:\(([^)]+)\))?/g;

  let matches: { version: string; date: string; index: number }[] = [];
  let match;
  while ((match = versionHeaderRegex.exec(changelogContent)) !== null) {
    const version = (match[1] || match[2] || '').replace(/^v/, '');
    const date = match[3] || new Date().toISOString().slice(0, 10);
    matches.push({ version, date, index: match.index });
  }

  if (matches.length === 0) return [];

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const startIndex = current.index;
    const endIndex = i + 1 < matches.length ? matches[i + 1].index : changelogContent.length;
    const body = changelogContent.slice(startIndex, endIndex);

    const { features, fixes, improvements, docs, highlights } = parseReleaseSections(body);

    releases.push({
      version: current.version,
      date: current.date,
      isLatest: i === 0,
      highlights,
      features,
      fixes,
      improvements,
      docs,
      releaseUrl: `${GITHUB_REPO_URL}/releases/tag/v${current.version}`,
    });
  }

  return releases;
};

export interface FetchChangelogResult {
  releases: VersionRelease[];
  source: 'github_releases' | 'github_raw' | 'cache' | 'builtin';
  lastUpdatedText: string;
}

/**
 * 自动从 GitHub 远程动态获取最新版本日志
 * 策略：GitHub Releases API -> GitHub Raw CHANGELOG.md -> LocalStorage 缓存 -> 内置静态数据
 */
export const fetchRemoteChangelog = async (force: boolean = false): Promise<FetchChangelogResult> => {
  // 1. 检查缓存
  if (!force) {
    try {
      const cachedStr = localStorage.getItem(CHANGELOG_CACHE_KEY);
      if (cachedStr) {
        const cachedData = JSON.parse(cachedStr);
        if (Date.now() - cachedData.timestamp < CACHE_TTL_MS && Array.isArray(cachedData.releases) && cachedData.releases.length > 0) {
          return {
            releases: cachedData.releases,
            source: 'cache',
            lastUpdatedText: new Date(cachedData.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          };
        }
      }
    } catch {
      // ignore cache error
    }
  }

  // 2. 尝试从 GitHub Releases API 获取
  try {
    const response = await fetch(GITHUB_RELEASES_API, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (response.ok) {
      const ghReleases: any[] = await response.json();
      if (Array.isArray(ghReleases) && ghReleases.length > 0) {
        const parsed: VersionRelease[] = ghReleases.map((item, index) => {
          const version = (item.tag_name || item.name || '').replace(/^v/, '');
          const date = item.published_at ? item.published_at.slice(0, 10) : item.created_at?.slice(0, 10) || '';
          const { features, fixes, improvements, docs, highlights } = parseReleaseSections(item.body || '');

          return {
            version,
            date,
            isLatest: index === 0,
            highlights: highlights || (features.length === 0 ? item.body : undefined),
            features,
            fixes,
            improvements,
            docs,
            releaseUrl: item.html_url || `${GITHUB_REPO_URL}/releases/tag/v${version}`,
          };
        });

        // 写入缓存
        localStorage.setItem(
          CHANGELOG_CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), releases: parsed })
        );

        return {
          releases: parsed,
          source: 'github_releases',
          lastUpdatedText: '刚刚同步',
        };
      }
    }
  } catch (err) {
    console.warn('GitHub Releases API fetch failed, trying raw CHANGELOG.md:', err);
  }

  // 3. 尝试从 GitHub Raw CHANGELOG.md 获取
  try {
    const rawRes = await fetch(GITHUB_RAW_CHANGELOG_URL);
    if (rawRes.ok) {
      const rawText = await rawRes.text();
      const parsed = parseChangelogMarkdown(rawText);
      if (parsed.length > 0) {
        localStorage.setItem(
          CHANGELOG_CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), releases: parsed })
        );

        return {
          releases: parsed,
          source: 'github_raw',
          lastUpdatedText: '刚刚同步 (Raw)',
        };
      }
    }
  } catch (err) {
    console.warn('GitHub Raw CHANGELOG fetch failed:', err);
  }

  // 4. 尝试读取过期缓存
  try {
    const cachedStr = localStorage.getItem(CHANGELOG_CACHE_KEY);
    if (cachedStr) {
      const cachedData = JSON.parse(cachedStr);
      if (Array.isArray(cachedData.releases) && cachedData.releases.length > 0) {
        return {
          releases: cachedData.releases,
          source: 'cache',
          lastUpdatedText: '离线缓存',
        };
      }
    }
  } catch {
    // ignore
  }

  // 5. 回退内置数据
  return {
    releases: RELEASES_HISTORY,
    source: 'builtin',
    lastUpdatedText: '内置版本',
  };
};
