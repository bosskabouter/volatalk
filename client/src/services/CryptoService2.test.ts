import { KeyObject } from 'crypto';
import { generateEncryptionKey, generateSignatureKey } from './CryptoService2';

const aPeerId =
  '6NZKfVuTw6KF5PqWCgzxmdzUT3n3m98tJJkqLJEoySuQLJdtPTWdyYx5csveUwadZXRf7razVn63xFxoQEG4us8Sk67Kp63xmjxgcbnYzCpQx42kEhj72FAfCuAfhSLeBWtNJch91KE3JJuThTwUxrVtagitmFxy2qpvxhJNmSu7WCrvj9TG6P3mspEQLkZzWoStBMy9WP7qDSKSEppWK9b6CBNRQ8RMF65NJ4b1DECJibKBMfNn5h7CFDdnspeUfQtA1hPhBfbLD9wGwRD7Lsm';

let signatureKey: KeyObject | undefined;
let encryptionKey: KeyObject | undefined;

test('encryptionKeyPair', async () => {
  encryptionKey = await generateEncryptionKey();

  expect(encryptionKey).toBeDefined();

  const buf = encryptionKey.export();

  expect(buf).toBeDefined();
  console.log('printing encryptionKey');
  printExportedKey(buf);
});

test('signatureKeyPair', async () => {
  signatureKey = await generateSignatureKey();

  expect(signatureKey).toBeDefined();

  const buf = signatureKey.export();

  expect(buf).toBeDefined();
  console.log('printing signatureKey: ' + buf);
  printExportedKey(buf);
});

function printExportedKey(buf: Buffer) {
  console.log('HEX: ' + buf.toString('hex'));
  console.log('Base64url: ' + buf.toString('base64url'));
  console.log('JSON: ' + JSON.stringify(buf.toJSON()));
}
test('exportedPubKey', async () => {
  console.log('nothing yet');
});
