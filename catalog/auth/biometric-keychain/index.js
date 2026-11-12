import crypto from 'node:crypto';

/**
 * BiometricKeychainVault provides in-memory AES-256-GCM encrypted secret storage
 * gated by biometric authorization callback hooks.
 */
export class BiometricKeychainVault {
  /**
   * @param {object} options
   * @param {string} options.masterPassword Required passphrase for key derivation (min 8 chars)
   * @param {Function} [options.promptBiometric] Optional authorization hook returning Promise<boolean>
   */
  constructor(options = {}) {
    if (!options.masterPassword || typeof options.masterPassword !== 'string' || options.masterPassword.trim().length < 8) {
      throw new Error('BiometricKeychainVault requires an explicit masterPassword of at least 8 characters.');
    }
    this.promptBiometric = options.promptBiometric || (async () => true);
    this.masterPassword = options.masterPassword;
    this.storage = new Map();
  }

  _deriveKey(salt) {
    return crypto.scryptSync(this.masterPassword, salt, 32);
  }

  /**
   * Encrypt and store secret under a key
   */
  async storeSecret(key, secretValue) {
    const authorized = await this.promptBiometric(`Authorize saving credential '${key}'`);
    if (!authorized) {
      throw new Error('Biometric authorization rejected');
    }

    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    const encKey = this._deriveKey(salt);

    const cipher = crypto.createCipheriv('aes-256-gcm', encKey, iv);
    const plaintext = typeof secretValue === 'string' ? secretValue : JSON.stringify(secretValue);
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    const record = {
      ciphertext,
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      tag: authTag.toString('hex'),
      updatedAt: Date.now()
    };

    this.storage.set(key, record);
    return true;
  }

  /**
   * Retrieve and decrypt secret
   */
  async getSecret(key) {
    const record = this.storage.get(key);
    if (!record) return null;

    const authorized = await this.promptBiometric(`Authorize accessing credential '${key}'`);
    if (!authorized) {
      throw new Error('Biometric authorization rejected');
    }

    const salt = Buffer.from(record.salt, 'hex');
    const iv = Buffer.from(record.iv, 'hex');
    const tag = Buffer.from(record.tag, 'hex');
    const encKey = this._deriveKey(salt);

    const decipher = crypto.createDecipheriv('aes-256-gcm', encKey, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(record.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  }

  /**
   * Delete secret
   */
  async deleteSecret(key) {
    return this.storage.delete(key);
  }

  /**
   * List all stored keys (does not reveal secrets)
   */
  listKeys() {
    return Array.from(this.storage.keys());
  }
}
