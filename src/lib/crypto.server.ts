import crypto from 'crypto';

/**
 * Secure encryption/decryption utilities for sensitive data
 * Uses AES-256-GCM for authenticated encryption
 */

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits
const TAG_LENGTH = 16; // 128 bits for GCM auth tag

/**
 * Derive a key from the encryption key using PBKDF2
 */
function deriveKey(encryptionKey: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(encryptionKey, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt sensitive data (tokens, secrets, etc.)
 * @param plaintext - The data to encrypt
 * @param encryptionKey - The master encryption key from environment
 * @returns Base64-encoded string containing salt, iv, tag, and encrypted data
 */
export function encrypt(plaintext: string, encryptionKey: string): string {
  try {
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derive key from master key and salt
    const key = deriveKey(encryptionKey, salt);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ]);
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    // Combine salt + iv + tag + encrypted data
    const combined = Buffer.concat([salt, iv, tag, encrypted]);
    
    // Return base64 encoded
    return combined.toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt sensitive data
 * @param ciphertext - Base64-encoded string from encrypt()
 * @param encryptionKey - The master encryption key from environment
 * @returns Decrypted plaintext
 */
export function decrypt(ciphertext: string, encryptionKey: string): string {
  try {
    // Decode base64
    const combined = Buffer.from(ciphertext, 'base64');
    
    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    // Derive key from master key and salt
    const key = deriveKey(encryptionKey, salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Hash an API key for storage (one-way hash)
 * Uses SHA-256 for secure, irreversible hashing
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Generate a cryptographically secure random string
 * @param length - Length of the random string
 * @returns Random hex string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

/**
 * Generate a webhook signing secret
 * @returns Base64-encoded random secret
 */
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * Generate an API key with prefix
 * @param prefix - Key prefix (e.g., 'eq_live_')
 * @returns Full API key
 */
export function generateApiKey(prefix: string = 'eq_live_'): string {
  const randomPart = crypto.randomBytes(24).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  return `${prefix}${randomPart}`;
}

/**
 * Verify webhook signature (HMAC-SHA256)
 * @param payload - Raw request body
 * @param signature - Signature from header
 * @param secret - Webhook secret
 * @returns true if signature is valid
 */
export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    return false;
  }
}

/**
 * Generate OAuth state token for CSRF protection
 * @returns Secure random state token
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString('base64url');
}
