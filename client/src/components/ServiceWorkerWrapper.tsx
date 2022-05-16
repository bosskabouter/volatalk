import { FC, useEffect, useRef, useState } from 'react';
import { Button, Snackbar } from '@mui/material';
import { Workbox } from 'workbox-window';

const ServiceWorkerWrapper: FC = () => {
  const [showReload, setShowReload] = useState(false);
  const wb = useRef<Workbox | null>(null);

  const onSWUpdate = () => {
    setShowReload(true);
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      wb.current = new Workbox(`${process.env.PUBLIC_URL}/service-worker.js`);
      wb.current.addEventListener('waiting', onSWUpdate);
      wb.current.register();
    }
  }, []);

  const reloadPage = () => {
    if ('serviceWorker' in navigator && wb.current !== null) {
      wb.current.addEventListener('controlling', (_event) => {
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
