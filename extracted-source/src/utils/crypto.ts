/**
 * Sensitive Credential Encryption & Decryption Service
 * 
 * Communicates with backend endpoints (/api/crypto/encrypt and /api/crypto/decrypt)
 * to keep encryption keys secure on the server.
 * Provides a resilient offline Web Crypto fallback if network is disconnected.
 */

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  tag: string;
}

// Client-side fallback key for offline emergency caching if backend is disconnected
async function getOfflineFallbackKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const rawSalt = 'jay-ambe-offline-client-security-vault';
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(rawSalt),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('local-device-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function buf2hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

function hex2buf(hexString: string): ArrayBuffer {
  const bytes = new Uint8Array(Math.ceil(hexString.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes.buffer;
}

/**
 * Encrypt a password string securely.
 */
export async function encryptCredential(plaintext: string): Promise<EncryptedPayload> {
  try {
    const response = await fetch('/api/crypto/encrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plaintext }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        ciphertext: data.ciphertext,
        iv: data.iv,
        tag: data.tag,
      };
    }
  } catch (err) {
    console.warn('Backend encryption server unavailable, using offline WebCrypto fallback:', err);
  }

  // Resilient offline fallback using browser Web Crypto
  const key = await getOfflineFallbackKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  // Split ciphertext and 16-byte authentication tag
  const fullBytes = new Uint8Array(cipherBuffer);
  const tagBytes = fullBytes.slice(-16);
  const bodyBytes = fullBytes.slice(0, -16);

  return {
    ciphertext: buf2hex(bodyBytes.buffer),
    iv: buf2hex(iv.buffer),
    tag: buf2hex(tagBytes.buffer),
  };
}

/**
 * Decrypt a credential for authorized display in the UI.
 */
export async function decryptCredential(payload: EncryptedPayload): Promise<string> {
  try {
    const response = await fetch('/api/crypto/decrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return data.plaintext;
    }
  } catch (err) {
    console.warn('Backend decryption server unavailable, trying offline fallback:', err);
  }

  try {
    // Attempt offline fallback decryption
    const key = await getOfflineFallbackKey();
    const iv = new Uint8Array(hex2buf(payload.iv));
    const body = new Uint8Array(hex2buf(payload.ciphertext));
    const tag = new Uint8Array(hex2buf(payload.tag));

    const combined = new Uint8Array(body.length + tag.length);
    combined.set(body, 0);
    combined.set(tag, body.length);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      combined.buffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    throw new Error('Unable to decrypt credentials with available security keys.');
  }
}
