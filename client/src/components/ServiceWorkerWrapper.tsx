import { FC, useContext, useEffect, useRef, useState } from 'react';
import { Button, Snackbar } from '@mui/material';
import { Workbox, WorkboxLifecycleWaitingEvent, WorkboxMessageEvent } from 'workbox-window';
import { UserContext } from '../providers/UserProvider';
import { DatabaseContext } from '../providers/DatabaseProvider';
import { convertBase64ToAb } from '../services/Generic';

const ServiceWorkerWrapper: FC = () => {
  const WEBPUSH_SERVER_PUBKEY =
    'BOzjBiLaa9psTJ5Nd5T8WEPQjq92HmPgzSr4Lvr53AVGsEhcQiWmjP8crRxS5CIq4KVxCbnBUl5v55axenXLjCg';

  const noServiceWorkerAvailable = !('serviceWorker' in navigator);
  const serviceWorkerScript =
    process.env.NODE_ENV === 'production' ? '/service-worker.js' : '/service-worker-testpush.js';

  const [showReload, setShowReload] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>();
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null | undefined>(
    undefined
  );

  const userCtx = useContext(UserContext);
  const db = useContext(DatabaseContext);

  const wb = useRef<Workbox | null>(null);

  const onSWUpdate = (e: WorkboxLifecycleWaitingEvent) => {
    console.info('onSWUpdate = (e) => ', e);

    setShowReload(true);
  };

  const onMessage = (messageEvent: WorkboxMessageEvent) => {
    console.info('onMessage = (messageEvent: WorkboxMessageEvent) => ', messageEvent);

    console.info('messageEvent.data', messageEvent.data);
    console.info('messageEvent.target', messageEvent.target);
    console.info('messageEvent.originalEvent', messageEvent.originalEvent);
    console.info('messageEvent.ports', messageEvent.ports);
    console.info('messageEvent.isExternal', messageEvent.isExternal);

    //setShowMessage(messageEvent.data);
  };

  useEffect(() => {
    if (noServiceWorkerAvailable) {
      console.warn(
        'No service worker in navigator available. Push messages and off-line browsing disabled.'
      );
      return;
    }

    wb.current = new Workbox(process.env.PUBLIC_URL + serviceWorkerScript);
    wb.current.addEventListener('waiting', onSWUpdate);
    wb.current.addEventListener('message', onMessage);
    wb.current
      .register()
      .then((reg) => {
        console.info('Registered Service Worker', reg);
        if (reg) {
          console.info('registered service worker', reg);
          setRegistration(reg);
        }
      })
      .catch((e) => {
        console.error('Error registering service worker', e);
      });
  }, [noServiceWorkerAvailable, serviceWorkerScript]);

  /**
   * Subscribes to the pushManager in the registration, only if user registered and he opted for push.
   * If not usePush, clear the subscription from his profile.
   */
  useEffect(() => {
    if (!db || !userCtx.user || !registration) return;

    const subPush = () => {
      console.log('Subscribe pushManager in registration', registration);
      registration.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertBase64ToAb(WEBPUSH_SERVER_PUBKEY),
        })
        .then((subscription) => {
          console.log('Push subscribed!', subscription);
          setPushSubscription(subscription);
        })
        .catch((e) => {
          console.error('Error subscribing push manager', e);
        });
    };
    if (userCtx.user.usePush) {
      subPush();
    } else {
      //clearing push subscription
      setPushSubscription(null);
    }
  }, [db, registration, userCtx.user]);

  /**
   * Saves the push subscription to users profile.
   */
  useEffect(() => {
    if (!db || !userCtx.user || !registration) return;
    console.info('Saving new push subscription!', pushSubscription);
    console.info('Overwriting old subscription', userCtx.user.pushSubscription);
    userCtx.user.pushSubscription = pushSubscription;
    db.userProfile.put(userCtx.user);
  }, [db, pushSubscription, registration, userCtx.user]);

  const reloadPage = () => {
    if ('serviceWorker' in navigator && wb.current !== null) {
      wb.current.getSW().then((sw) => {
        console.info('Posting a message to service worker...');
        sw.postMessage('Hi SW?!');
      });
      wb.current.addEventListener('controlling', (event) => {
        console.info("wb.current.addEventListener('controlling', (event)=>", event);
        setShowReload(false);
        window.location.reload();
      });

      wb.current.messageSkipWaiting();
    }
  };

  return (
    <Snackbar
      open={showReload}
      message="A new version is available!"
      onClick={reloadPage}
      data-test-id="screens-new-version-snackbar"
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      action={
        <Button color="inherit" size="small" onClick={reloadPage}>
          Reload
        </Button>
      }
    />
  );
};

export default ServiceWorkerWrapper;
