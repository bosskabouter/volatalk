import {
  importPrivateKey,
  importPublicKey,
  peerIdToPublicKey,
  signMessage,
  verifyMessage,
} from './Crypto';
import { convertAbToBase64, convertBase64ToAb } from './Generic';
import { IUserProfile } from 'Database/Database';

export const INVITE_PARAM = { FROM: 'f', KEY: 'k', SIGNATURE: 's' };

export interface IInvite {
  peerId: string;
  text: string;
  signature: ArrayBuffer;
}
/**
 * TODO: add expiration date
 */
export function makeInviteURL(user: IUserProfile, inviteText: string) {
  return importPrivateKey(JSON.parse(user.privateKey)).then((pk) => {
    const signedMessage = user.peerid + inviteText;
    console.debug('Signing message: ' + signedMessage);
    return signMessage(signedMessage, pk).then((signature) => {
      console.debug('signature', signature);
      const sigEncoded = convertAbToBase64(signature);
      console.debug('sigEncoded', sigEncoded);
      const hostEnvUrl = window.location.origin + '/acceptInvite';

      const realURL = new URL(hostEnvUrl);
      realURL.searchParams.append(INVITE_PARAM.FROM, user.peerid);

      realURL.searchParams.append(INVITE_PARAM.KEY, inviteText);

      realURL.searchParams.append(INVITE_PARAM.SIGNATURE, sigEncoded);

      console.debug('Signed invitation: ' + realURL);
      return realURL;
    });
  });
}

/**Did we receive an invite from someone, let's 'try to connect
 */
export async function extractInvite(params: URLSearchParams) {
  const otherPeerId = params.get(INVITE_PARAM.FROM);
  const sigEncoded = params.get(INVITE_PARAM.SIGNATURE);
  const invitationText = params.get(INVITE_PARAM.KEY);

  if (
    !params.has(INVITE_PARAM.FROM) ||
    !otherPeerId ||
    !params.has(INVITE_PARAM.SIGNATURE) ||
    !sigEncoded ||
    !params.has(INVITE_PARAM.KEY) ||
    !invitationText
  ) {
    alert('Incomplete invitation data.');
    return null;
  }

  console.debug('sigEncoded', sigEncoded);
  const sig = sigEncoded ? convertBase64ToAb(sigEncoded) : new ArrayBuffer(0);
  console.debug('signature', sig);

  const invite: IInvite = {
    peerId: otherPeerId,
    signature: sig,
    text: invitationText,
  };
  const pk = await importPublicKey(peerIdToPublicKey(otherPeerId));

  const verified = await verifyMessage(otherPeerId + invitationText, sig, pk);

  if (verified) {
    console.info('Invitation verified.');
    return invite;
  } else {
    const msg = 'Invalid signature in invitation: ' + invitationText;
    console.warn(msg);
    alert(msg);
    return null;
  }
}
