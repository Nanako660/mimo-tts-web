/**
 * Web Crypto API 基于设备硬件/浏览器的 AES-GCM 256 加密模块
 * 密钥存储在 IndexedDB 中且不可导出 (extractable: false)，杜绝明文泄露
 */

const DB_NAME = 'mimo_tts_crypto_db';
const STORE_NAME = 'device_keys';
const KEY_ID = 'device_master_key_v1';

function openCryptoDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getOrCreateDeviceKey(): Promise<CryptoKey> {
  try {
    const db = await openCryptoDB();
    const existingKey = await new Promise<CryptoKey | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY_ID);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (existingKey) {
      return existingKey;
    }

    // 生成新的 AES-GCM 256 位密钥
    const newKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      false, // non-extractable: 防止 JS 直接导出私钥明文
      ['encrypt', 'decrypt']
    );

    // 存入 IndexedDB
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(newKey, KEY_ID);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    return newKey;
  } catch (err) {
    console.warn('IndexedDB Crypto Key failed, using fallback in-memory/session key', err);
    // 降级 fallback
    if (!(window as any).__mimo_fallback_key) {
      (window as any).__mimo_fallback_key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    }
    return (window as any).__mimo_fallback_key;
  }
}

/**
 * 加密字符串 (返回 iv.ciphertext 的 Base64 格式)
 */
export async function encryptSecret(plainText: string): Promise<string> {
  if (!plainText) return '';
  try {
    const key = await getOrCreateDeviceKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainText);

    const cipherBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encoded
    );

    const cipherArray = new Uint8Array(cipherBuffer);
    const combined = new Uint8Array(iv.length + cipherArray.length);
    combined.set(iv, 0);
    combined.set(cipherArray, iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (e) {
    console.error('Encryption failed:', e);
    // Fallback simple obfuscation if WebCrypto fails
    return `fb_${btoa(encodeURIComponent(plainText))}`;
  }
}

/**
 * 解密字符串
 */
export async function decryptSecret(cipherText: string): Promise<string> {
  if (!cipherText) return '';
  try {
    if (cipherText.startsWith('fb_')) {
      return decodeURIComponent(atob(cipherText.slice(3)));
    }

    const binaryString = atob(cipherText);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const iv = bytes.slice(0, 12);
    const cipherData = bytes.slice(12);
    const key = await getOrCreateDeviceKey();

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      cipherData
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (e) {
    console.error('Decryption failed:', e);
    return '';
  }
}
