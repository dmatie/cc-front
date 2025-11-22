import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly key: string;
  private readonly enabled: boolean;
  private cryptoKey: CryptoKey | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.key = environment.encryption.key;
    this.enabled = environment.encryption.enabled;

    if (this.enabled && !this.key) {
      console.error('❌ Encryption is enabled but encryption key is not set!');
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

      const nonce = crypto.getRandomValues(new Uint8Array(12));

      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: nonce,
          tagLength: 128
        },
        this.cryptoKey!,
        data
      );

      const encryptedArray = new Uint8Array(encryptedBuffer);

      const tagSize = 16;
      const ciphertext = encryptedArray.slice(0, encryptedArray.length - tagSize);
      const tag = encryptedArray.slice(encryptedArray.length - tagSize);

      const combined = new Uint8Array(nonce.length + tag.length + ciphertext.length);
      combined.set(nonce, 0);
      combined.set(tag, nonce.length);
      combined.set(ciphertext, nonce.length + tag.length);

      const base64 = this.arrayBufferToBase64(combined.buffer);

      return { encryptedData: base64 };
    } catch (error) {
      console.error('❌ Encryption failed:', error);
      throw new Error('Encryption failed');
    }
  }

  async decrypt<T = any>(response: any): Promise<T> {
    if (!this.enabled || !response) {
      return response as T;
    }

    const encryptedData = response.EncryptedData || response.encryptedData;

    if (!encryptedData) {
      return response as T;
    }

    console.log('🔐 Starting decryption...');
    console.log('📦 Response object:', response);
    console.log('📝 Encrypted data (first 100 chars):', encryptedData.substring(0, 100));
    console.log('📏 Encrypted data length:', encryptedData.length);

    try {
      await this.ensureInitialized();

      console.log('✅ Crypto key initialized');
      console.log('🔑 Crypto key:', this.cryptoKey);

      const combined = this.base64ToArrayBuffer(encryptedData);
      const combinedArray = new Uint8Array(combined);

      console.log('📊 Combined array length:', combinedArray.length);

      const nonce = combinedArray.slice(0, 12);
      const tag = combinedArray.slice(12, 28);
      const ciphertext = combinedArray.slice(28);

      console.log('🎲 Nonce length:', nonce.length);
      console.log('🎲 Nonce bytes:', Array.from(nonce));
      console.log('🏷️  Tag length:', tag.length);
      console.log('🏷️  Tag bytes:', Array.from(tag));
      console.log('📦 Ciphertext length:', ciphertext.length);
      console.log('📦 First 20 ciphertext bytes:', Array.from(ciphertext.slice(0, 20)));

      const encryptedBytesWithTag = new Uint8Array(ciphertext.length + tag.length);
      encryptedBytesWithTag.set(ciphertext, 0);
      encryptedBytesWithTag.set(tag, ciphertext.length);

      console.log('🔓 Attempting decryption...');

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: nonce,
          tagLength: 128
        },
        this.cryptoKey!,
        encryptedBytesWithTag
      );

      console.log('✅ Decryption successful!');
      console.log('📏 Decrypted buffer length:', decryptedBuffer.byteLength);

      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decryptedBuffer);

      console.log('📝 Decrypted JSON (first 200 chars):', jsonString.substring(0, 200));

      const parsed = JSON.parse(jsonString);
      console.log('✅ JSON parsed successfully');

      return parsed as T;
    } catch (error) {
      console.error('❌ Decryption failed at step:', error);
      console.error('❌ Error name:', (error as any).name);
      console.error('❌ Error message:', (error as any).message);
      console.error('❌ Full error:', error);
      throw new Error('Decryption failed: ' + (error as any).message);
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
    let cleanedBase64 = base64;

    if (base64.includes('\\u')) {
      console.log('🔧 Decoding Unicode escape sequences...');
      cleanedBase64 = base64.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
        return String.fromCharCode(parseInt(match.replace('\\u', ''), 16));
      });
      console.log('✅ Cleaned base64 length:', cleanedBase64.length);
    }

    const binaryString = atob(cleanedBase64);
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
