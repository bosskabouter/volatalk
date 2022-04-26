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
  if (!otherPeerId || !sigEncoded) {
    console.error('No invite identified: ' + params.getAll);
    return null;
  }

  let invitationText = params.get(INVITE_PARAM.KEY);

  if (invitationText) invitationText = decodeURI(invitationText);
  if (!invitationText) invitationText = '';

  console.debug('sigEncoded', sigEncoded);
  const signature = convertBase64ToAb(sigEncoded);
  console.debug('signature', signature);

  const invite: IInvite = { peerId: otherPeerId, signature: signature, text: invitationText };

  return importPublicKey(peerIdToPublicKey(otherPeerId)).then((pk) => {
    return verifyMessage(otherPeerId + invitationText, signature, pk).then((valid) => {
      if (valid) {
        console.info('Invitation verified.');
        return invite;
      } else {
        const msg = 'Invalid signature in invitation: ' + invitationText;
        console.warn(msg);
        alert(msg);

        return null;
      }
    });
  });
}
