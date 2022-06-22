import { encryptString, generateKeyFromString } from 'dha-encryption';
import { IContact, IMessage, IUserProfile } from '../types';

const WEBPUSH_SERVER_ADDRESS = 'https://peered.me:432/push';

const VOLA_SECRET_PUSH = '1a2b3c-but there is more to it - &*@^';

/**
 * Tries to send a message through Notification Push to a contact, if he opted in for this.
 * @param message
 * @param contact
 * @returns (a) 0 if contact does not have a subscription, (b) error code if post failed (127 for local error), or (c) timestamp if succeeded
 */
export default async function pushMessage(
  message: IMessage,
  contact: IContact,
  user: IUserProfile
): Promise<number> {
  if (!contact.pushSubscription) {
    console.log(`Contact without subscription. Not pushing message.`, message, contact);
    return 0;
  }

  return new Promise((resolve, _reject) => {
    //TODO encrypt with secret shared with contact somehow...

    const senderInfo = JSON.stringify({
      contactid: user.peerid,
      nickname: user.nickname,
      avatar: user.avatarThumb, // doesn't fit in small push. but now it is compressed ;)
    });

    //copy the message, we'll shorten it with relevant info. Push max 4k

    const copiedMessage: IMessage = JSON.parse(JSON.stringify(message));
    const TRUNCATE_PAYLOAD_LIMIT = 1440;
    if (copiedMessage.payload.length > TRUNCATE_PAYLOAD_LIMIT) {
      copiedMessage.payload =
        copiedMessage.payload.substring(0, TRUNCATE_PAYLOAD_LIMIT) + '... (open to read more)';
    }
    //temporarily put our shortened info sender not just id. test-push-sw no db to lookup name
    copiedMessage.sender = senderInfo;

    copiedMessage.receiver = contact.nickname; //he himself is receiver. save some space

    //Do not encrypt in test environment with simplified service-worker.
    const unEnctyptedPayload = JSON.stringify(copiedMessage);

    //for now we use a global volatalk key to encrypt... TOOD write a key for each contact in unencrypted local idb for service worker to be able to find and decrypt.
    const payload =
      process.env.NODE_ENV === 'production'
        ? encryptString(unEnctyptedPayload, generateKeyFromString(VOLA_SECRET_PUSH))
        : unEnctyptedPayload;
    //body matches the expected server input
    //TODO truncate too long message. max 4k
    const b = JSON.stringify({
      subscription: contact.pushSubscription,
      payload: payload,
    });

    console.log('Posting Push message', WEBPUSH_SERVER_ADDRESS, b);
    fetch(WEBPUSH_SERVER_ADDRESS, {
      method: 'POST',
      body: b, //corresponds to pushEvent.data.text() on service-worker side
      headers: { 'content-type': 'application/json' },
    })
      .then((resp) => {
        const success = resp.ok;
        console.log(`Post Push Message - success(${success})`, resp);
        resolve(success ? new Date().getTime() : resp.status);
      })
      .catch((err) => {
        console.error('Error posting push message', err, b);
        resolve(127);
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
