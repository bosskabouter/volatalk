import { IUserProfile } from 'types';
import { exportCryptoKey, generateKeyPair, importPublicKey } from './CryptoService';
import { convertBase58ToObject, convertObjectToBase58 } from './Generic';

/**
 * Service creates and validates a valid peer id for user
 * A valid peerid 
 *  Base58 encoded exported json webkey of the public exponent of users personal CryptoKey(ck).

 * @param user
 */

export default async function enrollUser(user: IUserProfile): Promise<IUserProfile> {
  const keyPair = await generateKeyPair();

  const jsonPrivateKey = await exportCryptoKey(keyPair.privateKey);
  user.security.privateKey = JSON.stringify(jsonPrivateKey);
  const pubKey: JsonWebKey = await exportCryptoKey(keyPair.publicKey);
  const pubKeyB58 = convertObjectToBase58(pubKey).toString();

  user.peerid = pubKeyB58;
  return user;
}

/**
 *
 * @param peerid
 * @returns true if valid, false otherwise
 */
export async function verifyAddress(peerid: string): Promise<boolean> {
  try {
    const pubKey: JsonWebKey | null = convertBase58ToObject(peerid);

    return pubKey !== null && (await importPublicKey(pubKey)) != null;
  } catch (error) {
    return false;
  }
}
