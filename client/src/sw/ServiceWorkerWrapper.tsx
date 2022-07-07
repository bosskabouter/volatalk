import { FC, useContext, useEffect, useRef, useState } from 'react';
import { Button, Snackbar } from '@mui/material';
import { Workbox, WorkboxLifecycleWaitingEvent, WorkboxMessageEvent } from 'workbox-window';
import { UserContext } from '../providers/UserProvider';
import { DatabaseContext } from '../providers/DatabaseProvider';
import { convertBase64ToAb } from '../services/Generic';

const ServiceWorkerWrapper: FC = () => {
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

  const [pushSubscription, setPushSubscription] = useState<PushSubscription>();

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
    if (noServiceWorkerAvailable) {
      console.warn(
        'No service worker in navigator available. Push messages and off-line browsing disabled.'
      );
      return;
    }

    wb.current = new Workbox(process.env.PUBLIC_URL + serviceWorkerScript);
    console.debug('Created Workbox', wb.current);
    wb.current.addEventListener('waiting', onSWUpdate);
    wb.current.addEventListener('message', onMessage);
    wb.current
      .register()
      .then(async (reg) => {
        if (!reg) {
          console.warn('No registration returned');
          return;
        }
        console.debug('Service worker registration', reg);
        setRegistration(reg);
        if (!user?.usePush) return;
        const ps = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertBase64ToAb(WEBPUSH_SERVER_PUBKEY),
        });

        setPushSubscription(ps);
        console.debug('setPushSubscription', ps);

        const contacts = await db?.selectContactsMap();
        const msg = {
          type: 'UPDATE_CONTACTS',
          user: JSON.parse(JSON.stringify(user)),
          contacts: contacts,
        };
        console.debug('UPDATING_CONTACTS', msg);

        wb.current?.messageSW(msg).then((res) => {
          console.info('UDATED CONTACTS IN SERVICE WORKER', res);
          alert('UDATED CONTACTS IN SERVICE WORKER' + res);
        });
      })

      .catch((e) => {
        console.error('Error registering service worker', e);
      });
  }, [db, noServiceWorkerAvailable, serviceWorkerScript, user]);

  /**
   * Saves the push subscription to users profile.
   */
  useEffect(() => {
    if (!db || !user || !registration || !user.id || !pushSubscription) return;
    console.debug('Old with New push subscription', user.pushSubscription, pushSubscription);
    user.pushSubscription = pushSubscription;

    db.userProfile.update(1, { pushSubscription: pushSubscription });
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
