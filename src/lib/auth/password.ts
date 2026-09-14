import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

/**
 * Hashes a plaintext password using Node.js scrypt with a 16-byte cryptographically secure salt.
 * Format: `<salt_hex>:<hash_hex>`
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifies a plaintext password against a stored `<salt>:<hash>` string using timingSafeEqual
 * to eliminate timing attack vectors.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (!storedHash || !storedHash.includes(":")) {
      return false;
    }
    const [salt, originalHashHex] = storedHash.split(":");
    if (!salt || !originalHashHex) {
      return false;
    }
    const derivedKey = scryptSync(password, salt, KEY_LENGTH);
    const originalKey = Buffer.from(originalHashHex, "hex");

    if (derivedKey.length !== originalKey.length) {
      return false;
    }
    return timingSafeEqual(derivedKey, originalKey);
  } catch {
    return false;
  }
}
