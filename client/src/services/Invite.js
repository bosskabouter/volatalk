/**
 *
 */

import { sendContactRequest } from "Contact";
import {
  importPrivateKey,
  importPublicKey,
  peerIdToPublicKey,
  signMessage,
  verifyMessage,
} from "./Crypto";
import { convertAbToBase64, convertBase64ToAb, getUrlParam } from "./Generic";
import { createNotification } from "./peerpm-notify";
import { user } from "./User";

const URL_PARAM_INVITE_FROM_PEERID = "f";
const URL_PARAM_INVITE_KEY = "w";
const URL_PARAM_INVITE_SIGNATURE = "s";

function initInvites() {
  checkReceivedInvite();
}
/**
 * TODO: add expiration date
 */
function makeInvite(inviteText) {
  return importPrivateKey(user.privateKey).then((pk) => {
    let signedMessage = user.peerid + inviteText;
    console.debug("Signing message: " + signedMessage);
    return signMessage(signedMessage, pk).then((signature) => {
      console.debug("signature", signature);
      let sigEncoded = convertAbToBase64(signature);
      console.debug("sigEncoded", sigEncoded);
      let hostEnvUrl = window.location.origin + window.location.pathname;
      let url =
        hostEnvUrl +
        "?" +
        "(URL_PARAM_INVITE_FROM_PEERID)" +
        "=" +
        user.peerid +
        "&" +
        URL_PARAM_INVITE_KEY +
        "=" +
        encodeURI(inviteText) +
        "&" +
        URL_PARAM_INVITE_SIGNATURE +
        "=" +
        sigEncoded;
      console.debug("Signed invitation: " + url);
      return url;
    });
  });
}

/**Did we receive an invite from someone, let's 'try to connect
 */
function checkReceivedInvite(url) {
  let otherPeerId = getUrlParam(URL_PARAM_INVITE_FROM_PEERID, url);
  let invitationText = decodeURI(getUrlParam(URL_PARAM_INVITE_KEY, url));
  let sigEncoded = getUrlParam(URL_PARAM_INVITE_SIGNATURE, url);
  if (!sigEncoded) return;
  console.debug("sigEncoded", sigEncoded);
  let signature = convertBase64ToAb(sigEncoded);
  console.debug("signature", signature);

  if (otherPeerId && invitationText && signature)
    importPublicKey(peerIdToPublicKey(otherPeerId)).then((pk) => {
      verifyMessage(otherPeerId + invitationText, signature, pk).then(
        (valid) => {
          if (valid) {
            console.info(
              "Invitation verified. Sending contact request: " +
                invitationText +
                ", peerid: " +
                otherPeerId
            );
            sendContactRequest(otherPeerId, invitationText);
          } else {
            let msg = "Invalid signature in invitation: " + invitationText;
            console.warn(msg);
            alert(msg);
          }
        }
      );
    });
}

/**
 */
function shareInvite(inviteText) {
  function shareMobile(u) {
    const TITLE_INVITE = "VolaTALK Invite";
    const shareData = {
      title: TITLE_INVITE,
      text: inviteText,
      url: u,
    };

    navigator.share(shareData);
    console.log("Shared data: " + shareData);
  }

  /**
   */
  function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      alert("older browsers do not implement clipboard, please update.");
      return;
    }
    navigator.clipboard.writeText(text).then(
      function () {
        console.debug("Async: Copying to clipboard was successful!");
      },
      function (err) {
        let msg = "Sorry, could not copy text to clipboard ";
        alert(msg);
        console.error(msg + err, err);
      }
    );
  }

  makeInvite(inviteText).then((urlInvite) => {
    if (navigator.canShare) {
      shareMobile(urlInvite);
    } else {
      copyTextToClipboard(urlInvite);
      createNotification(
        "Inivitation ready",
        "Invite copied to clipboard. \r\n\r\nPlease send to your contact through email or other media."
      );
    }
  });
}

/**
 */

export { initInvites, shareInvite, makeInvite };
