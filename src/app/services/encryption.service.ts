import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly key: string;
  private readonly enabled: boolean;
  private cryptoKey: CryptoKey | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.key = (import.meta as any).env.VITE_ENCRYPTION_KEY || '';
    this.enabled = (import.meta as any).env.VITE_ENCRYPTION_ENABLED === 'true';

    if (this.enabled && !this.key) {
      console.error('❌ Encryption is enabled but VITE_ENCRYPTION_KEY is not set!');
      this.enabled = false;
    }

    if (this.enabled) {
      this.initPromise = this.initCryptoKey();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async encrypt(payload: any): Promise<any> {
    if (!this.enabled) {
      return payload;
    }

    try {
      await this.ensureInitialized();

      const jsonString = JSON.stringify(payload);
      const encoder = new TextEncoder();
      const data = encoder.encode(jsonString);

      const iv = crypto.getRandomValues(new Uint8Array(12));

      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128
        },
        this.cryptoKey!,
        data
      );

      const encryptedArray = new Uint8Array(encryptedBuffer);
      const combined = new Uint8Array(iv.length + encryptedArray.length);
      combined.set(iv, 0);
      combined.set(encryptedArray, iv.length);

      const base64 = this.arrayBufferToBase64(combined.buffer);

      return { encryptedData: base64 };
    } catch (error) {
      console.error('❌ Encryption failed:', error);
      throw new Error('Encryption failed');
    }
  }

  async decrypt<T = any>(response: any): Promise<T> {
    if (!this.enabled || !response || !response.encryptedData) {
      return response as T;
    }

    try {
      await this.ensureInitialized();

      const combined = this.base64ToArrayBuffer(response.encryptedData);
      const combinedArray = new Uint8Array(combined);

      const iv = combinedArray.slice(0, 12);
      const encryptedData = combinedArray.slice(12);

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128
        },
        this.cryptoKey!,
        encryptedData
      );

      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decryptedBuffer);

      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error('❌ Decryption failed:', error);
      throw new Error('Decryption failed');
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  private async initCryptoKey(): Promise<void> {
    try {
      const keyBuffer = this.base64ToArrayBuffer(this.key);

      this.cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      console.log('✅ Encryption key initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize crypto key:', error);
      throw new Error('Failed to initialize encryption key');
    }
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
