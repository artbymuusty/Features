import assert from 'node:assert/strict';
import test from 'node:test';
import { BiometricKeychainVault } from './index.js';

test('BiometricKeychainVault: requires explicit master password', () => {
  assert.throws(
    () => new BiometricKeychainVault(),
    /requires an explicit masterPassword/
  );

  assert.throws(
    () => new BiometricKeychainVault({ masterPassword: 'short' }),
    /at least 8 characters/
  );
});

test('BiometricKeychainVault: encrypt, store and retrieve secret', async () => {
  const vault = new BiometricKeychainVault({
    promptBiometric: async () => true,
    masterPassword: 'super-secret-passphrase'
  });

  await vault.storeSecret('api:github', { token: 'ghp_xyz1234567890' });
  const retrieved = await vault.getSecret('api:github');

  assert.deepEqual(retrieved, { token: 'ghp_xyz1234567890' });
  assert.deepEqual(vault.listKeys(), ['api:github']);
});

test('BiometricKeychainVault: rejects access when authorization fails', async () => {
  let allowPrompt = false;
  const vault = new BiometricKeychainVault({
    promptBiometric: async () => allowPrompt,
    masterPassword: 'super-secret-passphrase'
  });

  allowPrompt = true;
  await vault.storeSecret('secret:key', 'secret-val');

  allowPrompt = false;
  await assert.rejects(
    async () => vault.getSecret('secret:key'),
    /Biometric authorization rejected/
  );
});

test('BiometricKeychainVault: delete secret and returns null for unknown key', async () => {
  const vault = new BiometricKeychainVault({ masterPassword: 'super-secret-passphrase' });
  await vault.storeSecret('token:a', '123');
  assert.equal(await vault.getSecret('unknown'), null);

  await vault.deleteSecret('token:a');
  assert.equal(await vault.getSecret('token:a'), null);
});
