import { encryptString, generateKeyFromString } from 'dha-encryption';
import { IContact, IMessage, IUserProfile } from '../types';

const WEBPUSH_SERVER_ADDRESS = '/subscribe';

const POST_PUSH_HTTP_STATUS_SUCCESS = 201;
const VOLA_SECRET_PUSH = '1a2b3c-but there is more to it - &*@^';

/**
 * Tries to send a message through Notification Push to a contact, if he opted in for this.
 * @param message
 * @param contact
 * @returns
 */
export async function pushMessage(
  message: IMessage,
  contact: IContact,
  user: IUserProfile
): Promise<boolean> {
  if (!contact.pushSubscription) {
    console.log(`Contact without subscription. Not pushing message.`, message, contact);
    return false;
  }

  return new Promise((resolve, rejectj) => {
    //TODO encrypt with secret shared with contact somehow...

    const senderInfo = JSON.stringify({
      contactid: user.peerid,
      nickname: user.nickname,
      //  avatar: user.avatar, doesn't fit
    });
    //temporarily put our shortened info in push message, not just our id

    message.sender = senderInfo;

    //for now we use the receiver's peerid to encrypt. Discuss if we can write a key for each contact in unencrypted local storage for service worker to be able to find and decrypt.
    const encryptedMessage = encryptString(
      JSON.stringify(message),
      generateKeyFromString(VOLA_SECRET_PUSH)
    );
    //body matches the expected server input
    const body = JSON.stringify({
      subscription: contact.pushSubscription,
      payload: JSON.stringify(encryptedMessage),
    });

    console.log('Posting Push message to ' + WEBPUSH_SERVER_ADDRESS, body);
    fetch(WEBPUSH_SERVER_ADDRESS, {
      method: 'POST',
      body: body,
      headers: { 'content-type': 'application/json' },
    })
      .then((resp) => {
        const success = resp.status === POST_PUSH_HTTP_STATUS_SUCCESS;
        console.log(`Post Push Message - success(${success})`, resp);
        resolve(success);
      })
      .catch((err) => {
        console.error('Error posting push message', err, body);
        rejectj(err);
      });
  });
}

export function isNotifying() {
  return 'Notification' in window && Notification.permission === 'granted';
}
export function notifyMe() {
  // Let's check if the browser supports notifications
  if (!('Notification' in window)) {
    alert('This browser does not support notification!');
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === 'granted') {
    // If it's okay let's create a notification
    const notification = new Notification('Notification still working...');

    console.info('Notification ok', notification);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === 'granted') {
        const notification = new Notification('Notification working again!');
        console.info('Notification ok', notification);
      }
    });
  }

  // At last, if the user has denied notifications, and you
  // want to be respectful there is no need to bother them any more.
}
