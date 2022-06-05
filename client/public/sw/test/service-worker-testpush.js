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
  //payload = decryptString(payload, generateKeyFromString(VOLA_SECRET_PUSH));
  //console.info('Decrypted push', data);

  const message = JSON.parse(payload);

  const senderInfo = JSON.parse(message.sender);
  const action = {
    title: 'Accept',
    action: 'handleThis' + senderInfo.contactid,
  };

  const idString = senderInfo.contactid.substring(225, 252);
  console.log('Identicon ID String: ' + idString);
  //const icon = 'data:image/svg+xml;base64,' + new Identicon(idString, options).toString();

  self.registration.showNotification(senderInfo.nickname, {
    body: message.payload,
    vibrate: [2000, 2500],
    //  actions: [action],
    //requireInteraction: true,
    //icon: 'https://volatalk.org/mstile-150x150.png',
    icon: senderInfo.avatar,
  });
});
