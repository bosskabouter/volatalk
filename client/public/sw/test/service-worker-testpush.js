const VOLA_SECRET_PUSH = '1a2b3c-but there is more to it - &*@^';

self.addEventListener('push', (pushEvent) => {
  console.info('Push Event received!', pushEvent);
  console.info('pushEvent.target', pushEvent.target, pushEvent.currentTarget);
  console.info('pushEvent.timeStamp', pushEvent.timeStamp);

  if (!pushEvent.data || !pushEvent.data.text()) {
    console.warn('No push data available');
    return;
  }

  // test push not encrypted, see equivalent prod code in
  // /service-worker.ts
  let payload /* IMessage JSON */ = pushEvent.data.text();

  console.info('Unencrypted test push data.text', payload);
  // payload = decryptString(
  //   payload,
  //   generateKeyFromString(VOLA_SECRET_PUSH)
  // );
  // console.info('Decrypted push', data);

  const message = JSON.parse(payload);

  //message.sender contains not only contactid, but also nickname
  const senderInfo = JSON.parse(message.sender);
  // const senderInfo: {
  //   contactid: string;
  //   nickname: string;
  //   avatar: string;
  // } = JSON.parse(message.sender);

  const actionOpen = {
    title: 'Open',
    action: 'open',
  };
  const actionClose = {
    title: 'Close',
    action: 'close',
  };

  const notificationOptions = {
    body: message.payload,
    badge: senderInfo.avatar,
    image: senderInfo.avatar,
    icon: 'https://volatalk.org/mstile-150x150.png',
    vibrate: [1000, 2000, 3000, 4000, 5000],
    actions: [actionOpen, actionClose],
    requireInteraction: message.urgent,
    renotify: message.urgent,
    data: senderInfo.contactid,
  };
  self.registration.showNotification(senderInfo.nickname, notificationOptions);
});

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Clients/openWindow
 * https://w3c.github.io/ServiceWorker/#clients-openwindow
 *
 */
self.addEventListener(
  'notificationclick',
  function (event) {
    console.info('Clicked pushed notification', event);
    event.notification.close();

    console.log('self.location.origin', self.location.origin);
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientsArr) => {
        console.log('Open windows: ' + clientsArr);
        // If a Window tab matching the targeted URL already exists, focus that;
        const hadWindowToFocus = clientsArr.some((windowClient) =>
          windowClient.url.includes(self.location.origin) ? (windowClient.focus(), true) : false
        );
        // Otherwise, open a new tab to the applicable URL and focus it.
        if (!hadWindowToFocus)
          self.clients
            .openWindow(self.location.origin + '/messages/' + event.notification.data)
            .then((windowClient) => (windowClient ? windowClient.focus() : null));
      })
    );
  },
  false
);
