import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const ivLength = 16;
const saltLength = 64;

export function encrypt(text: string, key: string): string {
  const salt = crypto.randomBytes(saltLength);
  const iv = crypto.randomBytes(ivLength);
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha256');
  const cipher = crypto.createCipheriv(algorithm, derivedKey, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, authTag, encrypted]).toString('base64');
}

export function decrypt(encryptedData: string, key: string): string {
  const buffer = Buffer.from(encryptedData, 'base64');
  const salt = buffer.subarray(0, saltLength);
  const iv = buffer.subarray(saltLength, saltLength + ivLength);
  const authTag = buffer.subarray(saltLength + ivLength, saltLength + ivLength + 16);
  const encrypted = buffer.subarray(saltLength + ivLength + 16);
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha256');
  const decipher = crypto.createDecipheriv(algorithm, derivedKey, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted, undefined, 'utf8') + decipher.final('utf8');
}
