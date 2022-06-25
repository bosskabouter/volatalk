import { importPrivateKey, peerIdToPublicKey, signMessage, verifyMessage } from './CryptoService';
import { convertAbToBase64, convertBase64ToAb } from './Generic';
import { IInvite, IUserProfile } from '../types';

export const INVITE_PARAMKEYS = { FROM: 'f', KEY: 'k', SIGNATURE: 's' };

/**
 * TODO: add expiration date
 */
export async function makeInviteURL(user: IUserProfile, inviteText: string): Promise<URL> {
  const privKey = await importPrivateKey(JSON.parse(user.security.privateKey));
  const signedMessage = user.peerid + inviteText;
  const sig: ArrayBuffer = await signMessage(signedMessage, privKey);
  const sigEncoded = convertAbToBase64(sig);

  const u = new URL(window.location.origin + '/');
  u.searchParams.append(INVITE_PARAMKEYS.FROM, user.peerid);
  u.searchParams.append(INVITE_PARAMKEYS.KEY, inviteText);
  u.searchParams.append(INVITE_PARAMKEYS.SIGNATURE, sigEncoded);
  return u;
}

/**
 * Extracts and Verifies invite parameters from URL search
 */
export async function extractInvite(params: URLSearchParams): Promise<IInvite | null> {
  const otherPeerId = params.get(INVITE_PARAMKEYS.FROM);
  const sigEncoded = params.get(INVITE_PARAMKEYS.SIGNATURE);
  const invitationText = params.get(INVITE_PARAMKEYS.KEY);

  if (
    !params.has(INVITE_PARAMKEYS.FROM) ||
    !otherPeerId ||
    !params.has(INVITE_PARAMKEYS.SIGNATURE) ||
    !sigEncoded ||
    !params.has(INVITE_PARAMKEYS.KEY) ||
    !invitationText
  ) {
    console.warn('Incomplete invitation data.');
    return null;
  }

  const sig: ArrayBuffer | null = sigEncoded ? convertBase64ToAb(sigEncoded) : new ArrayBuffer(0);

  if (!sig) return null;
  const invite: IInvite = {
    peerid: otherPeerId,
    signature: sig,
    text: invitationText,
  };
  const pk: CryptoKey | null = await peerIdToPublicKey(otherPeerId);

  const verified = pk && (await verifyMessage(otherPeerId + invitationText, sig, pk));

  if (verified) {
    return invite;
  } else {
    const msg = 'Invalid signature in invitation: ' + invitationText;
    console.warn(msg);
    alert(msg);
    return null;
  }
}
