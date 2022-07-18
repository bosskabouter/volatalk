import { FC, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { Button, Snackbar } from '@mui/material';
import { Workbox, WorkboxLifecycleWaitingEvent, WorkboxMessageEvent } from 'workbox-window';
import { UserContext } from '../providers/UserProvider';
import { DatabaseContext } from '../providers/DatabaseProvider';
import { convertBase64ToAb } from '../services/util/Generic';

const ServiceWorkerWrapper: FC = () => {
  /**
   * Global Web push pubKey
   * TODO: Create private push server keys for each subscription, if possible
   */
  const WEBPUSH_SERVER_PUBKEY =
    'BKO5xaLdDEzHQIjdm5rRT9QWUOp3SCl7VDfO3dj0LYMno6IlTZ7njpFvWYWMEWvxL2ici5FmzqrPaxAEywyB1WA';

  const noServiceWorkerAvailable = !('serviceWorker' in navigator);
  const serviceWorkerScript =
    process.env.NODE_ENV === 'production'
      ? '/service-worker.js'
      : '/sw/test/service-worker-testpush.js';

  const [showReload, setShowReload] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>();

  const { user, setUser } = useContext(UserContext);

  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null);

  const db = useContext(DatabaseContext);

  const wb = useRef<Workbox | null>(null);

  const onSWUpdate = (e: WorkboxLifecycleWaitingEvent) => {
    console.info('onSWUpdate = (WorkboxLifecycleWaitingEvent) => ', e);
    setShowReload(true);
  };

  const onMessage = (messageEvent: WorkboxMessageEvent) => {
    console.info('onMessage = (messageEvent: WorkboxMessageEvent) => ', messageEvent);
    console.debug('messageEvent.data', messageEvent.data);
    console.debug('messageEvent.target', messageEvent.target);
    console.debug('messageEvent.originalEvent', messageEvent.originalEvent);
    console.debug('messageEvent.ports', messageEvent.ports);
    console.debug('messageEvent.isExternal', messageEvent.isExternal);
  };

  useEffect(() => {
    if (!user) return;
    if (noServiceWorkerAvailable) {
      console.warn(
        'No service worker in navigator available. Push messages and off-line browsing disabled.'
      );
      return;
    }
    if (registration) return;

    wb.current = new Workbox(process.env.PUBLIC_URL + serviceWorkerScript);
    console.debug('Created Workbox', wb.current);
    wb.current.addEventListener('waiting', onSWUpdate);
    wb.current.addEventListener('message', onMessage);

    const handleRegistration = async (rgstrn?: ServiceWorkerRegistration) => {
      if (!rgstrn) {
        console.warn('No registration returned');
        return;
      }
      console.debug('Service worker registration', rgstrn);
      setRegistration(rgstrn);

      let ps = await rgstrn.pushManager.getSubscription().catch((e) => {
        alert('Could not find existing subscription: ' + e);
        ps = null;
      });

      if (user.usePush) {
        !ps &&
          (ps = await rgstrn.pushManager
            .subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertBase64ToAb(WEBPUSH_SERVER_PUBKEY),
            })
            .catch((e) => {
              alert('Subscribe failed: ' + e);
            }));
      } else {
        if (ps) {
          ps.unsubscribe().then((ok) => alert('unsubscribed: ' + ok));
          ps = null;
        }
      }

      setPushSubscription(ps ? ps : null);
      //alert('Got PushSubscription: ' + ps);

      //send updated user and contacts info to service worker. Otherwise SW needs access to db
      const contacts = await db?.selectContactsMap();
      const msg = {
        type: 'UPDATE_CONTACTS',
        user: JSON.parse(JSON.stringify(user)),
        contacts: contacts,
      };

      wb.current?.messageSW(msg).then((res) => {
        console.info('UDATED CONTACTS IN SERVICE WORKER', res);
      });
    };

    wb.current
      .register()
      .then(handleRegistration)
      .catch((e) => {
        alert('Error registering service worker: ' + e);
        if (pushSubscription) {
          pushSubscription
            .unsubscribe()
            .then((ok) => alert('unsubscribed after error: ' + ok + +' => ' + e));
        }
        console.error('Error registering service worker', e);
      });
  }, [db, noServiceWorkerAvailable, pushSubscription, registration, serviceWorkerScript, user]);

  /**
   * Saves the push subscription to users profile.
   */
  useEffect(() => {
    if (!db || !user || !registration || !user.id || !pushSubscription) return;
    console.debug('Old with New push subscription', user.pushSubscription, pushSubscription);
    //alert('Got pushSubscription:' + pushSubscription);
    user.pushSubscription = pushSubscription;

    db.userProfile.put(user);
    setUser(user);
  }, [db, pushSubscription, registration, setUser, user]);

  const reloadPage = () => {
    if ('serviceWorker' in navigator && wb.current) {
      wb.current.addEventListener('controlling', (event) => {
        console.debug('Controlling', event);
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
