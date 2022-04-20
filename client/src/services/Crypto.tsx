import { BufferSource } from 'stream/web';
import { convertAb2str, convertHexToString, convertStringToHex } from './Generic';

const ENC_FORMAT_JWK = 'jwk';
const ENC_ALGORITHM_ECDSA = 'ECDSA';
const ENC_ALGORITHM_ECDSA_HASH = 'SHA-384';
const ENC_ALGORITHM_ECDSA_NAMEDCURVE = 'P-384';
/**
 *
 * @param {*} publicKey
 * @returns
 */
function peerIdFromPublicKey(publicKey: JsonWebKey) {
  const hexPeerid = convertStringToHex(JSON.stringify(publicKey, null, ' '));
  console.debug('PeerID <= public key: ' + publicKey, hexPeerid);
  return hexPeerid;
}

/**
 *
 * @param {*} peerid
 * @returns
 */
function peerIdToPublicKey(peerid: string) {
  const cryptoKey = JSON.parse(convertHexToString(peerid));
  console.debug('PeerID => public key: ' + cryptoKey, peerid);
  return cryptoKey;
}

/**
 * Generate a sign/verify key pair,
 * @returns
 */
async function generateKeyPair() {
  return window.crypto.subtle.generateKey(
    {
      name: ENC_ALGORITHM_ECDSA,
      namedCurve: ENC_ALGORITHM_ECDSA_NAMEDCURVE,
    },
    true,
    ['sign', 'verify']
  );
}

/**
 *
 * @param {*} jwk
 */
function importPrivateKey(jwk: JsonWebKey) {
  return importCryptoKey(jwk, true);
}

/**
 *
 * @param {*} jwk
 */
function importPublicKey(jwk: JsonWebKey) {
  return importCryptoKey(jwk, false);
}
/**
 *
 * @param {*} jwk
 * @param {*} isPrivate
 * @returns
 */
// importKey(format: "jwk", keyData: JsonWebKey, algorithm: AlgorithmIdentifier | RsaHashedImportParams | EcKeyImportParams | HmacImportParams | AesKeyAlgorithm, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey>;

function importCryptoKey(jwk: JsonWebKey, isPrivate: boolean) {
  const keyUsages: KeyUsage[] = isPrivate ? ['sign'] : ['verify'];
  const encryptionAlgorithm: EcKeyImportParams = {
    name: ENC_ALGORITHM_ECDSA,
    namedCurve: ENC_ALGORITHM_ECDSA_NAMEDCURVE,
  };
  return window.crypto.subtle
    .importKey(ENC_FORMAT_JWK, jwk, encryptionAlgorithm, true, keyUsages)
    .catch((error) => {
      console.warn('Key Invalid: ' + jwk + ' REASON => ' + error, error);
      throw error;
    });
}

/**
 *
 * @param {*} key
 * @returns
 */
function exportCryptoKey(key: CryptoKey) {
  return window.crypto.subtle.exportKey(ENC_FORMAT_JWK, key);
}

/**
 *
 * @param {*} message
 * @param {*} signingKey
 * @returns
 */
function signMessage(message: string, signingKey: CryptoKey) {
  return window.crypto.subtle.sign(
    {
      name: ENC_ALGORITHM_ECDSA,
      hash: ENC_ALGORITHM_ECDSA_HASH,
    },
    signingKey,
    new TextEncoder().encode(message)
  );
}

/**
 *
 * @param {*} message
 * @param {*} publicKey
 */
function verifyMessage(message: string, signature: BufferSource, publicKey: CryptoKey) {
  return window.crypto.subtle.verify(
    {
      name: ENC_ALGORITHM_ECDSA,
      hash: { name: ENC_ALGORITHM_ECDSA_HASH },
    },
    publicKey,
    signature,
    new TextEncoder().encode(message)
  );
}

/**
 *
 * @param {*} text
 */
function digestSHA256(text: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return crypto.subtle.digest('SHA-256', data).then((sha) => {
    return convertAb2str(sha);
  });
}

/*
Get the encoded message, encrypt it and display a representation
of the ciphertext in the "Ciphertext" element.
*/
function encrypt(text: string, key: CryptoKey) {
  const encoded = new TextEncoder().encode(text);
  window.crypto.subtle
    .encrypt(
      {
        name: 'RSA-OAEP',
      },
      key,
      encoded
    )
    .then((ciphertext) => {
      return new Uint8Array(ciphertext, 0, 5);
    });
}

/*
Fetch the ciphertext and decrypt it.
Write the decrypted message into the "Decrypted" box.
*/
function decrypt(ciphertext: BufferSource, key: CryptoKey) {
  window.crypto.subtle
    .decrypt(
      {
        name: 'RSA-OAEP',
      },
      key,
      ciphertext
    )
    .then((decrypted) => {
      const dec = new TextDecoder();
      return dec.decode(decrypted);
    });
}

export {
  peerIdFromPublicKey,
  peerIdToPublicKey,
  generateKeyPair,
  importPrivateKey,
  importPublicKey,
  exportCryptoKey,
  signMessage,
  verifyMessage,
  encrypt,
  decrypt,
  digestSHA256,
};
