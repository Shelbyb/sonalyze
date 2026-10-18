import crypto from 'node:crypto';
import { getCachedRuntimeSecret } from '@/lib/daywalker-auth';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const PREFIX = 'enc:v1:';

/**
 * Derives a 32-byte key from the master secret using HKDF.
 */
export function deriveKey(secret: string): Buffer {
  const salt = Buffer.from('sonalyze-encryption-salt-v1', 'utf-8');
  const info = Buffer.from('sonalyze-aes-256-gcm-key', 'utf-8');
  return Buffer.from(crypto.hkdfSync('sha256', secret, salt, info, 32));
}

export function getMasterSecret(): string {
  const baseSecret =
    process.env.ENCRYPTION_KEY ||
    process.env.DAYWALKER_ENCRYPTION_KEY ||
    process.env.NEXTAUTH_SECRET ||
    'sonalyze-fallback-encryption-secret-default-key-32-chars-minimum';

  const runtimeSecret = getCachedRuntimeSecret();
  if (runtimeSecret) {
    const derived = crypto.hkdfSync(
      'sha256',
      baseSecret,
      Buffer.from(runtimeSecret, 'utf-8'),
      Buffer.from('sonalyze-runtime-secret-wrapper', 'utf-8'),
      32,
    );
    return Buffer.from(derived).toString('hex');
  }

  return baseSecret;
}

export function getFallbackSecrets(): string[] {
  const primary = getMasterSecret();
  const fallbacks: string[] = [];

  const candidates = [
    process.env.ENCRYPTION_KEY,
    process.env.OLD_ENCRYPTION_KEY,
    process.env.PREVIOUS_ENCRYPTION_KEY,
    process.env.NEXTAUTH_SECRET,
    process.env.DAYWALKER_ENCRYPTION_KEY,
    process.env.BETTER_AUTH_SECRET,
    'sonalyze-fallback-encryption-secret-default-key-32-chars-minimum',
  ];

  for (const cand of candidates) {
    if (cand && cand.trim().length > 0 && cand !== primary && !fallbacks.includes(cand)) {
      fallbacks.push(cand);
    }
  }

  return fallbacks;
}

export function tryDecryptRaw(ciphertext: string, secretKey: string): string | null {
  if (!ciphertext || typeof ciphertext !== 'string' || !ciphertext.startsWith(PREFIX)) {
    return ciphertext;
  }

  const parts = ciphertext.slice(PREFIX.length).split(':');
  if (parts.length !== 3) {
    return null;
  }

  const [ivHex, tagHex, encryptedHex] = parts;
  try {
    const key = deriveKey(secretKey);
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const encryptedData = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

    return decrypted.toString('utf-8');
  } catch {
    return null;
  }
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Output format: enc:v1:<iv_hex>:<tag_hex>:<ciphertext_hex>
 */
export function encrypt(plaintext: string, secretKey = getMasterSecret()): string {
  if (!plaintext) return plaintext;
  const key = deriveKey(secretKey);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf-8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString('hex')}:${tag.toString('hex')}:${ciphertext.toString('hex')}`;
}

/**
 * Decrypts a ciphertext string created by `encrypt`.
 * If the string does not have the encrypted prefix `enc:v1:`, it returns the plaintext directly.
 * If secretKey is not explicitly provided, attempts master secret and falls back to candidate secrets.
 */
export function decrypt(ciphertext: string, secretKey?: string): string {
  if (!ciphertext || typeof ciphertext !== 'string' || !ciphertext.startsWith(PREFIX)) {
    return ciphertext;
  }

  if (secretKey) {
    const res = tryDecryptRaw(ciphertext, secretKey);
    return res !== null ? res : ciphertext;
  }

  // Try primary master secret
  const primaryRes = tryDecryptRaw(ciphertext, getMasterSecret());
  if (primaryRes !== null) {
    return primaryRes;
  }

  // Try fallback secrets
  for (const fallback of getFallbackSecrets()) {
    const fallbackRes = tryDecryptRaw(ciphertext, fallback);
    if (fallbackRes !== null) {
      return fallbackRes;
    }
  }

  return ciphertext;
}
