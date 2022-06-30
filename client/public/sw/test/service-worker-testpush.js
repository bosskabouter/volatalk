//---------- SYNC WITH service-worker.ts

let contacts;
let user;

self.addEventListener('message', (event) => {
  console.info('Test SW received message event!', event);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // This allows the web app to trigger skipWaiting
    self.skipWaiting();
  } else if (event.data && event.data.type === 'UPDATE_CONTACTS') {
    contacts = event.data.contacts;
    user = event.data.user;
    console.log('Got User and his contacts!', user, contacts);
  }
});

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
  // payload = decryptString(payload, generateKeyFromString(user.peerid));
  // console.info('Decrypted push', data);

  const message = JSON.parse(payload);

  const contact = contacts.get(message.sender);

  if (!contact) {
    console.warn('Received Push from unknown contact', payload);
    return;
  } else console.log('Found contacts for pushmessage ', contact);

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
    badge: contact.avatar,
    //    image: contact.avatar,
    //    icon: 'https://volatalk.org/mstile-150x150.png',
    icon: contact.avatar,
    vibrate: [1000, 2000, 3000, 4000, 5000],
    actions: [actionOpen, actionClose],
    requireInteraction: message.urgent,
    renotify: message.urgent,
    data: contact.contactid,
  };
  self.registration.showNotification(contact.nickname, notificationOptions);
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
