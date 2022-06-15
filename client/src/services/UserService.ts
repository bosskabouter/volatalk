import { IUserProfile } from 'types';
import {
  exportCryptoKey,
  generateKeyPair,
  importPublicKey,
  signMessage,
  verifyMessage,
} from './CryptoService';
import {
  convertBase58ToBuf,
  convertBase58ToObject,
  convertBase58ToString,
  convertBufToBase58,
  convertObjectToBase58,
  convertStringToHex,
} from './Generic';

/**
 * Service creates and validates a valid peer id for user
 * A valid peerid consists of 2 parts;
 * a) Base58 encoded exported json webkey of the public exponent of users personal CryptoKey(ck).
 * b} signature of message (a) signed with private key of (ck)
 * seperated by '_' (undersore)
 * @param user
 */

const SEPARATOR = '_';

export default async function enrollUser(user: IUserProfile) {
  const keyPair = await generateKeyPair();

  const jsonPrivateKey = await exportCryptoKey(keyPair.privateKey);
  user.security.privateKey = JSON.stringify(jsonPrivateKey);

  const pubKey: JsonWebKey = await exportCryptoKey(keyPair.publicKey);
  const pubKeyB58 = convertObjectToBase58(pubKey).toString();

  const sig: ArrayBuffer = await signMessage(pubKeyB58, keyPair.privateKey);
  const sigB58 = convertBufToBase58(Buffer.from(sig));
  user.peerid = pubKeyB58 + SEPARATOR + sigB58;
  console.info('Enrolled user', user);
}

/**
 *
 * @param peerid
 * @returns true if valid, false otherwise
 */
export async function verifyAddress(peerid: string) {
  if (!peerid || peerid.trim().length < 20 || !peerid.includes('_')) return false;
  const peerSplit: string[] = peerid.split(SEPARATOR);

  const pubKeyB58 = peerSplit[0];
  const pubKey: JsonWebKey | null = convertBase58ToObject(pubKeyB58);

  const sigB58 = peerSplit[1];
  const sig = sigB58 ? convertBase58ToBuf(sigB58) : null;

  return (
    sig != null && pubKey !== null && verifyMessage(pubKeyB58, sig, await importPublicKey(pubKey))
  );
}
