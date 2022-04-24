import {
  importPrivateKey,
  importPublicKey,
  peerIdToPublicKey,
  signMessage,
  verifyMessage,
} from './Crypto';
import { convertAbToBase64, convertBase64ToAb, getUrlParam } from './Generic';
import { IUserProfile } from 'Database/Database';

const URL_PARAM_INVITE_FROM_PEERID = 'f';
const URL_PARAM_INVITE_KEY = 'w';
const URL_PARAM_INVITE_SIGNATURE = 's';

interface IInvite {
  readonly user: IUserProfile;
  readonly signatureB64: string;
  readonly url: URL;
  text?: string;
}
/**
 * TODO: add expiration date
 */
export function makeInvite(user: IUserProfile, inviteText: string) {
  return importPrivateKey(JSON.parse(user.privateKey)).then((pk) => {
    const signedMessage = user.peerid + inviteText;
    console.debug('Signing message: ' + signedMessage);
    return signMessage(signedMessage, pk).then((signature) => {
      console.debug('signature', signature);
      const sigEncoded = convertAbToBase64(signature);
      console.debug('sigEncoded', sigEncoded);
      const hostEnvUrl = window.location.origin + window.location.pathname;
      const url: URL = new URL(
        hostEnvUrl +
          '?' +
          URL_PARAM_INVITE_FROM_PEERID +
          '=' +
          user.peerid +
          '&' +
          URL_PARAM_INVITE_KEY +
          '=' +
          encodeURI(inviteText) +
          '&' +
          URL_PARAM_INVITE_SIGNATURE +
          '=' +
          sigEncoded
      );
      console.debug('Signed invitation: ' + url);
      return { user: user, text: inviteText, signatureB64: sigEncoded, url: URL };
    });
  });
}

/**Did we receive an invite from someone, let's 'try to connect
 */
export function checkReceivedInvite() {
  const otherPeerId = getUrlParam(URL_PARAM_INVITE_FROM_PEERID);
  const sigEncoded = getUrlParam(URL_PARAM_INVITE_SIGNATURE);
  if (!otherPeerId || !sigEncoded) return;

  let invitationText = getUrlParam(URL_PARAM_INVITE_KEY);
  if (invitationText) invitationText = decodeURI(invitationText);

  console.debug('sigEncoded', sigEncoded);
  const signature = convertBase64ToAb(sigEncoded);
  console.debug('signature', signature);

  importPublicKey(peerIdToPublicKey(otherPeerId)).then((pk) => {
    verifyMessage(otherPeerId + invitationText, signature, pk).then((valid) => {
      if (valid) {
        console.info(
          'Invitation verified. Sending contact request: ' +
            invitationText +
            ', peerid: ' +
            otherPeerId
        );
        //sendContactRequest(otherPeerId, invitationText);
      } else {
        const msg = 'Invalid signature in invitation: ' + invitationText;
        console.warn(msg);
        alert(msg);
      }
    });
  });
}

