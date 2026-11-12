# In-Memory Biometric Vault Adapter

In-memory AES-256-GCM encrypted credential vault with biometric authorization callback hooks.

> **Storage Notice:** Ephemeral in-memory storage. Secrets are held in memory and not persisted across process restarts.

## Usage

```javascript
import { BiometricKeychainVault } from './index.js';

const vault = new BiometricKeychainVault({
  masterPassword: 'my-secure-master-passphrase',
  promptBiometric: async (reason) => {
    // Connect to UI Touch ID / WebAuthn / Face ID verification prompt
    return true;
  }
});

await vault.storeSecret('api:key', 'secret_token_123');
const secret = await vault.getSecret('api:key');
```

## Running Tests

```bash
node --test test.js
```
