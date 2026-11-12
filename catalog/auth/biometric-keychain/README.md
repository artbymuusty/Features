# Biometric Keychain Vault

Platform-agnostic biometric authentication and encrypted credential storage interface.

## Usage

```javascript
import { BiometricKeychainVault } from './index.js';

const vault = new BiometricKeychainVault({
  promptBiometric: async (reason) => {
    // Connect to TouchID / FaceID native prompt or WebAuthn
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
