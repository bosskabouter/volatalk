import { encryptString, generateKeyFromString } from 'dha-encryption';
import { IContact, IMessage, IUserProfile } from '../../types';

const WEBPUSH_SERVER_ADDRESS = 'https://peered.me:432/push';

/**
 * Tries to send a message through Notification Push to a contact, if he opted in for this.
 * @param message
 * @param contact
 * @returns (a) 0 if contact does not have a subscription, (b) error code if post failed (127 for local error), or (c) timestamp if succeeded
 */
export default async function pushMessage(message: IMessage, contact: IContact): Promise<number> {
  if (!contact.pushSubscription) {
    console.info(`Contact without subscription. Not pushing message.`, message, contact);
    return 0;
  }

  return new Promise((resolve, _reject) => {
    const copiedMessage: IMessage = JSON.parse(JSON.stringify(message));
    const TRUNCATE_PAYLOAD_LIMIT = 2 * 1000;
    if (copiedMessage.payload.length > TRUNCATE_PAYLOAD_LIMIT) {
      copiedMessage.payload =
        copiedMessage.payload.substring(0, TRUNCATE_PAYLOAD_LIMIT) + '... (open to read more)';
    }

    //Do not encrypt in test environment with simplified service-worker.
    const unEnctyptedPayload = JSON.stringify(copiedMessage);

    const payload =
      process.env.NODE_ENV === 'production'
        ? encryptString(unEnctyptedPayload, generateKeyFromString(contact.peerid))
        : unEnctyptedPayload;
    //body matches the expected server input
    const b = JSON.stringify({
      //TODO encrypt [contact.pushSubscription] with a server public key so only he can see the actual subscription
      subscription: contact.pushSubscription,
      payload: payload,
    });

    console.debug('Posting Push message', WEBPUSH_SERVER_ADDRESS, b);
    fetch(WEBPUSH_SERVER_ADDRESS, {
      method: 'POST',
      body: b, //corresponds to pushEvent.data.text() on service-worker (receiver) side
      headers: { 'content-type': 'application/json' },
    })
      .then((resp) => {
        const success = resp.ok;
        console.info(`Post Push Message - success(${success})`, resp);
        resolve(success ? new Date().getTime() : resp.status);
      })
      .catch((err) => {
        console.error('Error posting push message', err, b);
        resolve(566);
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

  Notification.requestPermission().then((permission) => {
    // If the user accepts, let's create a notification
    if (permission === 'granted') {
      const options: NotificationOptions = {
        badge: 'https://volatalk.org/mstile-150x150.png',
        // renotify: true,
        image: 'https://volatalk.org/mstile-150x150.png',
        //tag: 'id' + Math.random(), //msg.id
        requireInteraction: false,
        vibrate: [1000, 2000, 3000, 4000, 5000],
        silent: false,
        icon: 'https://volatalk.org/mstile-150x150.png',
        // data: 'data here',
        // body: 'body here',
      };

      const notification = new Notification('Notification working!!', options);

      notification.addEventListener('click', (event) => {
        console.log('Clicked on notification!', event);
      });

      notification.onclick = (event) => {
        console.log('Clicked on notification2!', event);
        //navigate
      };
      console.info('Notification ok', notification);
    }
  });
}
