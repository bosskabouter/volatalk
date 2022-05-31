import {
  importPrivateKey,
  importPublicKey,
  peerIdToPublicKey,
  signMessage,
  verifyMessage,
} from './Crypto';
import { convertAbToBase64, convertBase64ToAb } from './Generic';
import { IInvite, IUserProfile } from '../types';

export const INVITE_PARAMKEYS = { FROM: 'f', KEY: 'k', SIGNATURE: 's' };

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
      //redirect to homepage. router will save invite to localstorage in case new user / not logged in
      const hostEnvUrl = window.location.origin + '/';

      const realURL = new URL(hostEnvUrl);
      realURL.searchParams.append(INVITE_PARAMKEYS.FROM, user.peerid);

      realURL.searchParams.append(INVITE_PARAMKEYS.KEY, inviteText);

      realURL.searchParams.append(INVITE_PARAMKEYS.SIGNATURE, sigEncoded);

      console.debug('Signed invitation: ' + realURL);
      return realURL;
    });
  });
}

/**
 * Extracts and Verifies invite parameters from URL search
 */
export async function extractInvite(params: URLSearchParams) {
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
