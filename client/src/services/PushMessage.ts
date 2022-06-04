import { encryptString, generateKeyFromString } from 'dha-encryption';
import { IContact, IMessage, IUserProfile } from '../types';

const WEBPUSH_SERVER_ADDRESS = 'https://volatalk.org/subscribe';

const POST_PUSH_HTTP_STATUS_SUCCESS = 201;
const VOLA_SECRET_PUSH = '1a2b3c-but there is more to it - &*@^';

/**
 * Tries to send a message through Notification Push to a contact, if he opted in for this.
 * @param message
 * @param contact
 * @returns (a) 0 if contact does not have a subscription, (b) error code if post failed. (c) time if success
 */
export async function pushMessage(
  message: IMessage,
  contact: IContact,
  user: IUserProfile
): Promise<number> {
  if (!contact.pushSubscription) {
    console.log(`Contact without subscription. Not pushing message.`, message, contact);
    return 0;
  }

  return new Promise((resolve, rejectj) => {
    //TODO encrypt with secret shared with contact somehow...

    const senderInfo = JSON.stringify({
      contactid: user.peerid,
      nickname: user.nickname,
      //  avatar: user.avatar, doesn't fit in small push
    });
    //temporarily put our shortened info in push message, not just our id

    message.sender = senderInfo;

    //for now we use a global volatalk key to encrypt... TOOD write a key for each contact in unencrypted local idb for service worker to be able to find and decrypt.

    const encodedMessage = JSON.stringify(message);
    //Do not encrypt in test environment with simplified service-worker.
    const encryptedMessage =
      process.env.NODE_ENV === 'production'
        ? JSON.stringify(encryptString(encodedMessage, generateKeyFromString(VOLA_SECRET_PUSH)))
        : encodedMessage;
    //body matches the expected server input
    //TODO truncate too long message. max 4k
    const body = JSON.stringify({
      subscription: contact.pushSubscription,
      payload: encryptedMessage,
    });

    console.log('Posting Push message', WEBPUSH_SERVER_ADDRESS, body);
    fetch(WEBPUSH_SERVER_ADDRESS, {
      method: 'POST',
      body: body,
      headers: { 'content-type': 'application/json' },
    })
      .then((resp) => {
        const success = resp.status === POST_PUSH_HTTP_STATUS_SUCCESS;
        console.log(`Post Push Message - success(${success})`, resp);
        resolve(success ? new Date().getTime() : resp.status);
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
    console.info('Notification permission === granted');
  }

  // Otherwise, we need to ask the user for permission
  // else if (Notification.permission !== 'denied')
  // Normally, if the user has denied notifications, you want to be respectful there is no need to bother them any more.
  // But this function was executed by user action, so try to regain permission

  Notification.requestPermission().then(function (permission) {
    // If the user accepts, let's create a notification
    if (permission === 'granted') {
      const notification = new Notification('Notification working!');
      console.info('Notification ok', notification);
    }
  });
}
