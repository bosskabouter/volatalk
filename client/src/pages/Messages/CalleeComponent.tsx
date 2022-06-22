import { IContact } from '../../types';

import { useContext, useEffect, useState } from 'react';
import { Button, Dialog, DialogContent, DialogTitle, Stack } from '@mui/material';
import { PeerContext } from '../../providers/PeerProvider';
import { MediaConnection } from 'peerjs';
import CallingComponent from './CallingComponent';

import CallEndIcon from '@mui/icons-material/CallEnd';
import PhoneIcon from '@mui/icons-material/Phone';

import { ContactItem } from 'pages/Contacts/ContactItem';

const CalleeComponent = () => {
  const peerManager = useContext(PeerContext);

  const [call, setCall] = useState<{ contact: IContact; mediaConnection: MediaConnection } | null>(
    null
  );

  const [videoOn, setVideoOn] = useState<boolean>(true);

  const [accepted, setAccepted] = useState<boolean>();

  /**
   * Listener for incoming call
   */
  useEffect(() => {
    if (!peerManager) return;

    async function handleIncomingCall(ctc: IContact, mc: MediaConnection) {
      setCall({ contact: ctc, mediaConnection: mc });
      console.info('Incoming call', ctc, mc);
      navigator.vibrate && navigator.vibrate([2000, 2000, 2000]);
    }
    peerManager.on('onIncomingCall', handleIncomingCall);
    return () => {
      peerManager.removeListener('onIncomingCall', handleIncomingCall);
    };
  }, [peerManager]);
  /**
   * Declined inoming call, turn off
   */
  useEffect(() => {
    //someone calling,
    if (call?.mediaConnection && accepted === false) {
      alert('Declining call from: ' + call.contact.nickname);
      call.mediaConnection.close();
      //setMediaConnection(null);
    }
  }, [call, accepted]);

  function AcceptCall() {
    return (
      <Stack>
        <Button variant="contained" color="secondary" onClick={() => setAccepted(true)}>
          Accept
        </Button>
        <Button
          hidden={videoOn}
          variant="contained"
          color="secondary"
          onClick={() => {
            setVideoOn(false);
            setAccepted(true);
          }}
        >
          Audio Only
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            call?.mediaConnection.close();
          }}
        >
          Decline
        </Button>
      </Stack>
    );
  }

  const CallDialog = ({
    contact,
    mediaConnection,
  }: {
    contact: IContact;
    mediaConnection: MediaConnection;
  }) => {
    const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);

    const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(null);

    /**
     *
     */
    useEffect(() => {
      if (!localMediaStream)
        navigator.mediaDevices
          .getUserMedia({ video: videoOn, audio: true })
          .then(setLocalMediaStream);
    }, [localMediaStream]);

    /**
     *
     */
    useEffect(() => {
      if (localMediaStream && contact && peerManager)
        peerManager.acceptCall(contact, localMediaStream).then(setRemoteMediaStream);
    }, [contact, localMediaStream]);

    return (
      <div>
        {!(accepted && call && localMediaStream && remoteMediaStream) ? ( //ask permission to answer
          <AcceptCall />
        ) : (
          <CallingComponent
            contact={contact}
            videoOn={videoOn}
            mediaConnection={mediaConnection}
            localMediaStream={localMediaStream}
            remoteMediaStream={remoteMediaStream}
          />
        )}
      </div>
    );
  };
  /**
   *
   */
  return call ? (
    <>
      <PhoneIcon color="action" />
      <Dialog open={call != null}>
        <DialogTitle>Receiving Call from</DialogTitle>
        <DialogContent>
          <ContactItem contact={call.contact} />
          <CallDialog contact={call.contact} mediaConnection={call.mediaConnection} />
        </DialogContent>
      </Dialog>
    </>
  ) : (
    <CallEndIcon />
  );
};

export default CalleeComponent;
