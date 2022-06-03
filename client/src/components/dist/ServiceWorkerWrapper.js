'use strict';
exports.__esModule = true;
var react_1 = require('react');
var material_1 = require('@mui/material');
var workbox_window_1 = require('workbox-window');
var UserProvider_1 = require('../providers/UserProvider');
var DatabaseProvider_1 = require('../providers/DatabaseProvider');
var Generic_1 = require('../services/Generic');
var ServiceWorkerWrapper = function () {
  var WEBPUSH_SERVER_PUBKEY =
    'BOzjBiLaa9psTJ5Nd5T8WEPQjq92HmPgzSr4Lvr53AVGsEhcQiWmjP8crRxS5CIq4KVxCbnBUl5v55axenXLjCg';
  var _a = react_1.useState(false),
    showReload = _a[0],
    setShowReload = _a[1];
  var _b = react_1.useState(),
    pushSubscription = _b[0],
    setPushSubscription = _b[1];
  var userCtx = react_1.useContext(UserProvider_1.UserContext);
  var db = react_1.useContext(DatabaseProvider_1.DatabaseContext);
  var wb = react_1.useRef(null);
  var onSWUpdate = function (e) {
    console.info('onSWUpdate = (e) => ', e);
    setShowReload(true);
  };
  var onMessage = function (messageEvent) {
    console.info('onMessage = (messageEvent: WorkboxMessageEvent) => ', messageEvent);
    console.info('messageEvent.data', messageEvent.data);
    console.info('messageEvent.target', messageEvent.target);
    console.info('messageEvent.originalEvent', messageEvent.originalEvent);
    console.info('messageEvent.ports', messageEvent.ports);
    console.info('messageEvent.isExternal', messageEvent.isExternal);
    //setShowMessage(messageEvent.data);
  };
  react_1.useEffect(function () {
    if (
      !('serviceWorker' in navigator)
      //|| process.env.NODE_ENV !== 'production'
    )
      return;
    var serviceWorkerScript =
      process.env.NODE_ENV === 'production' ? '/service-worker.js' : '/service-worker-testpush.js';
    wb.current = new workbox_window_1.Workbox(process.env.PUBLIC_URL + serviceWorkerScript);
    wb.current.addEventListener('waiting', onSWUpdate);
    wb.current.addEventListener('message', onMessage);
    wb.current
      .register()
      .then(function (registration) {
        //user gave permission to register
        console.info('wb.current.register().then((registration) => ', registration);
        if (registration) {
          console.info('registered service worker', registration);
          //registration.pushManager
          registration.pushManager
            .subscribe({
              userVisibleOnly: true,
              applicationServerKey: Generic_1.convertBase64ToAb(WEBPUSH_SERVER_PUBKEY),
            })
            .then(function (subscription) {
              console.log('Push subscribed!', subscription);
              setPushSubscription(subscription);
            })
            ['catch'](function (e) {
              console.error('Error subscribing push manager', e);
            });
        }
      })
      ['catch'](function (e) {
        console.error('Error registering service worker', e);
      });
  }, []);
  /**
   * Saves the push subscription to users profile.
   */
  react_1.useEffect(
    function () {
      if (db && userCtx.user && pushSubscription && userCtx.user) {
        console.info('Saving new push subscription!', pushSubscription);
        console.info('Overwriting old subscription', userCtx.user.pushSubscription);
        userCtx.user.pushSubscription = pushSubscription;
        db.userProfile.put(userCtx.user);
      }
    },
    [db, pushSubscription, userCtx.user]
  );
  var reloadPage = function () {
    if ('serviceWorker' in navigator && wb.current !== null) {
      wb.current.getSW().then(function (sw) {
        console.info('Posting a message to service worker...');
        sw.postMessage('Hi SW?!');
      });
      wb.current.addEventListener('controlling', function (event) {
        console.info("wb.current.addEventListener('controlling', (event)=>", event);
        setShowReload(false);
        window.location.reload();
      });
      wb.current.messageSkipWaiting();
    }
  };
  return React.createElement(material_1.Snackbar, {
    open: showReload,
    message: 'A new version is available!',
    onClick: reloadPage,
    'data-test-id': 'screens-new-version-snackbar',
    anchorOrigin: { vertical: 'top', horizontal: 'center' },
    action: React.createElement(
      material_1.Button,
      { color: 'inherit', size: 'small', onClick: reloadPage },
      'Reload'
    ),
  });
};
exports['default'] = ServiceWorkerWrapper;
