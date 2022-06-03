'use strict';
/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */
exports.__esModule = true;
// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.
//TODO USE UNENCRYPTED DB FOR PUSH SECRET KEY EXCHANGE
//import { AppDatabase } from 'Database/Database';
var dha_encryption_1 = require('dha-encryption');
var workbox_core_1 = require('workbox-core');
workbox_core_1.clientsClaim();
// Any other custom service worker logic can go here.
//TODO get users secret shared with contacts from localstorage
var VOLA_SECRET_PUSH = '1a2b3c-but there is more to it - &*@^';
self.addEventListener('push', function (pushEvent) {
  console.info('Push Event received!', pushEvent);
  console.info('pushEvent.target', pushEvent.target, pushEvent.currentTarget);
  console.info('pushEvent.timeStamp', pushEvent.timeStamp);
  if (!pushEvent.data) {
    console.warn('No push data available');
    return;
  }
  var data = JSON.parse(pushEvent.data.text());
  console.info('Found Encrypted push text', data);
  data = dha_encryption_1.decryptString(
    data,
    dha_encryption_1.generateKeyFromString(VOLA_SECRET_PUSH)
  );
  console.info('Decrypted push', data);
  var message = JSON.parse(data);
  var senderInfo = JSON.parse(message.sender);
  var action = {
    title: 'Accept',
    action: 'someAction',
  };
  /*
    const identiconOptions: IdenticonOptions = {
      //foreground: [0, 0, 0, 255], // rgba black
      //background: [255, 255, 255, 255], // rgba white
      margin: 0.1, // 20% margin
      size: 256, // 256px square
      format: 'svg', // use SVG instead of PNG
    };
    const idString = senderInfo.contactid.substring(225, 252);
  
    const identicon =
      'data:image/svg+xml;base64,' + new Identicon(idString, identiconOptions).toString();
  */
  var identicon = 'https://volatalk.org/mstile-150x150.png';
  var notificationOptions = {
    body: message.payload,
    vibrate: [2000, 2500],
    actions: [action],
    requireInteraction: true,
    //icon: 'https://volatalk.org/mstile-150x150.png',
    //    icon: identicon,
    image: identicon,
  };
  self.registration.showNotification(senderInfo.nickname, notificationOptions);
});
