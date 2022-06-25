import {
  exportCryptoKey,
  generateKeyPair,
  importPrivateKey,
  importPublicKey,
  peerIdToPublicKey,
  signMessage,
  verifyMessage,
} from './CryptoService';

const aPeerId =
  '6NZKfVuTw6KF5PqWCgzxmdzUT3n3m98tJJkqLJEoySuQLJdtPTWdyYx5csveUwadZXRf7razVn63xFxoQEG4us8Sk67Kp63xmjxgcbnYzCpQx42kEhj72FAfCuAfhSLeBWtNJch91KE3JJuThTwUxrVtagitmFxy2qpvxhJNmSu7WCrvj9TG6P3mspEQLkZzWoStBMy9WP7qDSKSEppWK9b6CBNRQ8RMF65NJ4b1DECJibKBMfNn5h7CFDdnspeUfQtA1hPhBfbLD9wGwRD7Lsm';

let keyPair: CryptoKeyPair;
let exportedPrivKey: JsonWebKey;
let exportedPubKey: JsonWebKey;
let pubKeyBackAgain: CryptoKey;
let sig: ArrayBuffer;
test('generateKeyPair', async () => {
  keyPair = await generateKeyPair();
  expect(keyPair);
  expect(keyPair.privateKey);
  expect(keyPair.publicKey);
});
test('exportedPubKey', async () => {
  exportedPubKey = await exportCryptoKey(keyPair.publicKey);
  expect(exportedPubKey).toBeDefined();
});
test('exportedPrivKey', async () => {
  exportedPrivKey = await exportCryptoKey(keyPair.privateKey);
  expect(exportedPrivKey).toBeDefined();
});

test('peerIdToPublicKey', async () => {
  const ck = await peerIdToPublicKey(aPeerId);
  ck && (pubKeyBackAgain = ck);
  expect(pubKeyBackAgain).toBeDefined();
  //  expect(exportedPubKey).toEqual(pubKeyBackAgain);
});

test('peerIdToPublicKey', () => {
  expect(peerIdToPublicKey(aPeerId)).toBeDefined();
});
test('importPrivateKey', async () => {
  expect(await importPrivateKey(exportedPrivKey)).toBeDefined();
});
test('importPubKey', async () => {
  expect(await importPublicKey(exportedPubKey)).toBeDefined();
});
test('signMessage', async () => {
  sig = await signMessage('123', keyPair.privateKey);
  expect(sig).toBeDefined();
});
test('verifyValidMessage', async () => {
  const isValidSignature = await verifyMessage('123', sig, keyPair.publicKey);
  expect(isValidSignature).toBeDefined();
  expect(isValidSignature).toBeTruthy();
});
test('verifyMessageInvalidText', async () => {
  const isValidSignature = await verifyMessage('1234', sig, keyPair.publicKey);
  expect(isValidSignature).toBeDefined();
  expect(isValidSignature).toBeFalsy();
});
test('verifyMessageInvalidSig', async () => {
  const isValidSignature = await verifyMessage('123', new ArrayBuffer(0), keyPair.publicKey);
  expect(isValidSignature).toBeDefined();
  expect(isValidSignature).toBeFalsy();
});
test('verifyMessageInvalidKey', async () => {
  const isValidSignature = await verifyMessage('123', sig, (await generateKeyPair()).publicKey);
  expect(isValidSignature).toBeDefined();
  expect(isValidSignature).toBeFalsy();
});
