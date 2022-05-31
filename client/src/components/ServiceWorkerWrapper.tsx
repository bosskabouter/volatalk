import { FC, useContext, useEffect, useRef, useState } from 'react';
import { Button, Snackbar } from '@mui/material';
import { Workbox, WorkboxLifecycleWaitingEvent, WorkboxMessageEvent } from 'workbox-window';
import { UserContext } from '../providers/UserProvider';
import { DatabaseContext } from '../providers/DatabaseProvider';
import { convertBase64ToAb } from '../services/Generic';

const ServiceWorkerWrapper: FC = () => {
  const WEBPUSH_SERVER_PUBKEY =
    'BChZg2Ky1uKIDRdYWapWKZXZ19VvFedmK0bjqir9kMsyUK42cguvoAr4Pau4yQr2aY4IWGIsr3W1lWK5okZ6O84';

  const [showReload, setShowReload] = useState(false);
  const [pushSubscription, setPushSubscription] = useState<PushSubscription>();

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
    if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') return;

    wb.current = new Workbox(process.env.PUBLIC_URL + '/service-worker.js');
    wb.current.addEventListener('waiting', onSWUpdate);

    wb.current.addEventListener('message', onMessage);

    wb.current.register().then(async (registration) => {
      //user gave permission to register
      console.info('wb.current.register().then((registration) => ', registration);
      if (registration) {
        alert('registered service worker' + registration);
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertBase64ToAb(WEBPUSH_SERVER_PUBKEY),
        });

        console.log('Push registered! subscription=>', subscription);
        setPushSubscription(subscription);
      }
    });
  }, []);

  useEffect(() => {
    if (db && userCtx.user && pushSubscription) {
      console.info('Saving users push subscription', pushSubscription);
      userCtx.user.pushSubscription = pushSubscription;
      db.userProfile.put(userCtx.user);
    }
  }, [db, pushSubscription, userCtx.user]);

  const reloadPage = () => {
    if ('serviceWorker' in navigator && wb.current !== null) {
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
