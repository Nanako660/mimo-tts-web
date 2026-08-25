import { AppSettings, HistoryItem } from '../types';
import { encryptSecret, decryptSecret } from './crypto';

const SETTINGS_KEY = 'mimo_tts_settings_v1';
const HISTORY_DB_NAME = 'mimo_tts_history_db';
const HISTORY_STORE_NAME = 'history_records';

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  baseUrl: 'https://api.xiaomimimo.com/v1',
  theme: 'dark',
  defaultFormat: 'wav',
  defaultModel: 'mimo-v2.5-tts',
  defaultVoice: 'mimo_default',
  streamOutput: true,
  concurrencyLimit: 2,
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw);
    let plainApiKey = '';
    if (parsed.encryptedApiKey) {
      plainApiKey = await decryptSecret(parsed.encryptedApiKey);
    } else if (parsed.apiKey) {
      // 迁移旧版明文 API Key
      plainApiKey = parsed.apiKey;
      const encrypted = await encryptSecret(plainApiKey);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...parsed, encryptedApiKey: encrypted, apiKey: undefined }));
    }

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      apiKey: plainApiKey,
    };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    const encryptedKey = await encryptSecret(settings.apiKey);
    const toStore = {
      ...settings,
      encryptedApiKey: encryptedKey,
      apiKey: undefined, // 不在 localStorage 存明文
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(toStore));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

function openHistoryDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported'));
    }
    const request = indexedDB.open(HISTORY_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(HISTORY_STORE_NAME)) {
        const store = db.createObjectStore(HISTORY_STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveHistoryItem(item: Omit<HistoryItem, 'audioBlobUrl'> & { audioBlob: Blob }): Promise<void> {
  try {
    const db = await openHistoryDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(HISTORY_STORE_NAME, 'readwrite');
      const store = tx.objectStore(HISTORY_STORE_NAME);
      const req = store.put({
        id: item.id,
        timestamp: item.timestamp,
        model: item.model,
        mode: item.mode,
        promptText: item.promptText,
        synthesizedText: item.synthesizedText,
        voice: item.voice,
        audioBlob: item.audioBlob,
        format: item.format,
        duration: item.duration,
        finalTextPreview: item.finalTextPreview,
        tokensUsed: item.tokensUsed,
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save history item to IndexedDB:', err);
  }
}

export async function loadHistoryItems(): Promise<HistoryItem[]> {
  try {
    const db = await openHistoryDB();
    const records = await new Promise<any[]>((resolve, reject) => {
      const tx = db.transaction(HISTORY_STORE_NAME, 'readonly');
      const store = tx.objectStore(HISTORY_STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    // 转换 Blob 为 ObjectURL，并按时间降序排序
    return records
      .map((r) => ({
        id: r.id,
        timestamp: r.timestamp,
        model: r.model,
        mode: r.mode,
        promptText: r.promptText,
        synthesizedText: r.synthesizedText,
        voice: r.voice,
        format: r.format,
        duration: r.duration,
        finalTextPreview: r.finalTextPreview,
        tokensUsed: r.tokensUsed,
        audioBlobUrl: r.audioBlob ? URL.createObjectURL(r.audioBlob) : '',
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.warn('Failed to load history items:', err);
    return [];
  }
}

export async function deleteHistoryItem(id: string): Promise<void> {
  try {
    const db = await openHistoryDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(HISTORY_STORE_NAME, 'readwrite');
      const store = tx.objectStore(HISTORY_STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete history item:', err);
  }
}

export async function clearAllHistory(): Promise<void> {
  try {
    const db = await openHistoryDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(HISTORY_STORE_NAME, 'readwrite');
      const store = tx.objectStore(HISTORY_STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to clear history:', err);
  }
}
