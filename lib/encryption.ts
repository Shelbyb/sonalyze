import crypto from 'node:crypto';

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
  return (
    process.env.ENCRYPTION_KEY ||
    process.env.DAYWALKER_ENCRYPTION_KEY ||
    process.env.NEXTAUTH_SECRET ||
    'sonalyze-fallback-encryption-secret-default-key-32-chars-minimum'
  );
}

export function getFallbackSecrets(): string[] {
  const primary = getMasterSecret();
  const fallbacks: string[] = [];

  const candidates = [
    process.env.OLD_ENCRYPTION_KEY,
    process.env.PREVIOUS_ENCRYPTION_KEY,
    process.env.NEXTAUTH_SECRET,
    process.env.DAYWALKER_ENCRYPTION_KEY,
    process.env.BETTER_AUTH_SECRET,
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

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

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
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf-8'),
    cipher.final(),
  ]);
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

/**
 * Checks if a string is encrypted with `enc:v1:`.
 */
export function isEncrypted(value: unknown): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX);
}

/**
 * Verifies if ciphertext can be decrypted using the given secret key (or default master/fallback keys).
 */
export function canDecrypt(ciphertext: string, secretKey?: string): boolean {
  if (!isEncrypted(ciphertext)) return true;
  if (secretKey) {
    return tryDecryptRaw(ciphertext, secretKey) !== null;
  }
  if (tryDecryptRaw(ciphertext, getMasterSecret()) !== null) {
    return true;
  }
  for (const fallback of getFallbackSecrets()) {
    if (tryDecryptRaw(ciphertext, fallback) !== null) {
      return true;
    }
  }
  return false;
}

/**
 * Re-encrypts ciphertext from an old secret key to a new secret key.
 */
export function reencrypt(ciphertext: string, oldSecretKey: string, newSecretKey = getMasterSecret()): string {
  if (!ciphertext || !isEncrypted(ciphertext)) {
    return ciphertext;
  }

  const decrypted = tryDecryptRaw(ciphertext, oldSecretKey);
  if (decrypted === null) {
    throw new Error('Unable to decrypt ciphertext with the provided old secret key.');
  }

  return encrypt(decrypted, newSecretKey);
}

/**
 * Encrypts sensitive keys within an object.
 */
export function encryptSensitiveFields<T extends Record<string, unknown>>(
  obj: T,
  sensitiveKeys: readonly (keyof T | string)[] | (keyof T | string)[],
  secretKey = getMasterSecret(),
): T {
  const result = { ...obj } as Record<string, unknown>;
  for (const key of sensitiveKeys) {
    const val = result[key as string];
    if (typeof val === 'string' && val.length > 0 && !isEncrypted(val)) {
      result[key as string] = encrypt(val, secretKey);
    }
  }
  return result as T;
}

/**
 * Decrypts sensitive keys within an object.
 */
export function decryptSensitiveFields<T extends Record<string, unknown>>(
  obj: T,
  sensitiveKeys: readonly (keyof T | string)[] | (keyof T | string)[],
  secretKey?: string,
): T {
  const result = { ...obj } as Record<string, unknown>;
  for (const key of sensitiveKeys) {
    const val = result[key as string];
    if (typeof val === 'string' && isEncrypted(val)) {
      result[key as string] = decrypt(val, secretKey);
    }
  }
  return result as T;
}

/**
 * Timing-safe string comparison.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}
