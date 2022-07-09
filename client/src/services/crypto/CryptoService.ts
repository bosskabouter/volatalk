import { convertBase58ToObject } from '../util/Generic';

const ENC_FORMAT_JWK = 'jwk';
const ENC_ALGORITHM_ECDSA = 'ECDSA';
const ENC_ALGORITHM_ECDSA_HASH = 'SHA-384';
const ENC_ALGORITHM_ECDSA_NAMEDCURVE = 'P-384';

/**
 *
 * @param peerid
 * @param userJsonPrivateKey
 * @returns stringified signature ArrayBuffer
 */
export function generateSignature(peerid: string, userJsonPrivateKey: string): Promise<string> {
  return importPrivateKey(JSON.parse(userJsonPrivateKey)).then(async (privKey) => {
    return JSON.stringify(Array.from(new Uint8Array(await signMessage(peerid, privKey))));
  });
}

/**
 *
 * @param {*} peerid
 * @returns
 */
export async function peerIdToPublicKey(pubKeyB58: string): Promise<CryptoKey | null> {
  const pubJsonWebKey: JsonWebKey | null = convertBase58ToObject(pubKeyB58);
  return pubJsonWebKey && importPublicKey(pubJsonWebKey);
}

/**
 * Generate a sign/verify key pair,
 * @returns
 */
export async function generateKeyPair() {
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
export function importPrivateKey(jwk: JsonWebKey) {
  return importCryptoKey(jwk, true);
}

/**
 *
 * @param {*} jwk
 */
export function importPublicKey(jwk: JsonWebKey) {
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
export function exportCryptoKey(key: CryptoKey): Promise<JsonWebKey> {
  return window.crypto.subtle.exportKey(ENC_FORMAT_JWK, key);
}

/**
 *
 * @param {*} message
 * @param {*} signingKey
 * @returns
 */
export function signMessage(message: string, signingKey: CryptoKey) {
  const encodedMessage = new TextEncoder().encode(message);
  return window.crypto.subtle
    .sign(
      {
        name: ENC_ALGORITHM_ECDSA,
        hash: ENC_ALGORITHM_ECDSA_HASH,
      },
      signingKey,
      encodedMessage
    )
    .catch((error) => {
      console.error('Error signing message with key: ', message, signMessage, error);
      throw error;
    });
}

/**
 *
 * @param {*} message
 * @param {*} publicKey
 */
export function verifyMessage(message: string, signature: BufferSource, publicKey: CryptoKey) {
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
