globalThis.crypto = require('crypto').webcrypto;
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;

const aPeerId =
  '6NZKfVuTw6KF5PqWCgzxmdzUT3n3m98tJJkqLJEoySuQLJdtPTWdyYx5csveUwadZXRf7razVn63xFxoQEG4us986ar2jGjPiyVnKndVKqhUC4Krm2495xU2SfhidykP5TwAumYhKeVobt4TCszV7TvRzUbJ2BeqT7SQDLWxBb1B42Sxqz3MJmsX2qtw8JbMKW4jv3GhZRzDSzS7AK7qxGgth3UzKEg2kp7jq7jcUBgfh3p4wyi6VAyM12yAfJuwg8e2dHEcL41nU5Yb7oDSXLs_3c56bMGKrwg4yUGUuxG641QnrtpbpQTDQEejDivohCtE26LaHNDFrTh1QqVRtiEgF8x8VNS9SYDuDBZbVFPytKFby6H9bh1ay8Ge6GxhGGErN9SmAWcGuPj326Uohfgrmva4oqWJr';

import {
  exportCryptoKey,
  generateKeyPair,
  importPrivateKey,
  importPublicKey,
  peerIdToPublicKey,
  signMessage,
  verifyMessage,
} from './CryptoService';

let keyPair: CryptoKeyPair;
let peerid: string;
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
  expect(peerIdToPublicKey(peerid)).toBeDefined();
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
