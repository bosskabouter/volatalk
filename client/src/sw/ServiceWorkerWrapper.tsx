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
    process.env.NODE_ENV === 'production'
      ? '/service-worker.js'
      : '/sw/test/service-worker-testpush.js';

  const [showReload, setShowReload] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>();

  const { user } = useContext(UserContext);

  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(
    user?.pushSubscription ? user.pushSubscription : null
  );

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
    } else if (registration || wb.current) {
      //ran already
      return;
    }

    wb.current = new Workbox(process.env.PUBLIC_URL + serviceWorkerScript);
    wb.current.addEventListener('waiting', onSWUpdate);
    wb.current.addEventListener('message', onMessage);
    wb.current
      .register()
      .then((reg) => {
        if (reg) {
          console.debug('Service worker registration', reg);
          setRegistration(reg);
        }
      })
      .catch((e) => {
        console.error('Error registering service worker', e);
      });
  }, [noServiceWorkerAvailable, registration, serviceWorkerScript]);

  /**
   * Wait for the user to register and activate the registration to activate,
   * then Subscribe to the pushManager, if the user opted for this.
   * If not usePush, clear the subscription from his profile, in case he recently was subscribed.
   */
  useEffect(() => {
    if (!db || !user?.id || !registration?.active || pushSubscription) return;
    console.debug('useEffect subscription registration');
    const subscribePush = () => {
      console.debug('Registration', registration);
      registration.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertBase64ToAb(WEBPUSH_SERVER_PUBKEY),
        })
        .then((subscription) => {
          console.info('Subscription', subscription);
          setPushSubscription(subscription);
        })
        .catch((e) => {
          console.error('Error subscribing push manager', e);
        });
    };
    if (user?.usePush) {
      subscribePush();
    } else {
      setPushSubscription(null);
    }
  }, [db, registration, user, registration?.active, pushSubscription]);

  /**
   * Saves the push subscription to users profile.
   */
  useEffect(() => {
    if (!db || !user || !registration || !user.id || !pushSubscription) return;
    console.info('Overwriting previous push subscription', user.pushSubscription);
    console.info('New push subscription', pushSubscription);
    user.pushSubscription = pushSubscription;
    db.userProfile.update(1, { pushSubscription: pushSubscription });
  }, [db, pushSubscription, registration, user, user?.id]);

  const reloadPage = () => {
    if ('serviceWorker' in navigator && wb.current !== null) {
      wb.current.getSW().then((sw) => {
        console.info('Posting a message to service worker...');
        sw.postMessage('Hi SW? It is me... LeClerc!');
      });
      wb.current.addEventListener('controlling', (event) => {
        console.info('Controlling', event);
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
