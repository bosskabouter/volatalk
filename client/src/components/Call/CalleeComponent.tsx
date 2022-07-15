/** @jsxImportSource @emotion/react */

import { IContact } from '../../types';
import { useContext, useEffect, useState } from 'react';
import { Button, Dialog, DialogContent, DialogTitle, Stack, Tooltip } from '@mui/material';
import { PeerContext } from '../../providers/PeerProvider';
import { MediaConnection } from 'peerjs';
import { ContactItem } from 'pages/Contacts/ContactItem';
import CallingComponent from './CallingComponent';
import CallEndIcon from '@mui/icons-material/CallEnd';
import { RingingIcon } from './RingingIcon';

const CalleeComponent = () => {
  const peerManager = useContext(PeerContext);

  const [call, setCall] = useState<{ contact: IContact; mediaConnection: MediaConnection } | null>(
    null
  );
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);

  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(null);

  const [accepted, setAccepted] = useState<{ videoOn: boolean }>();

  /**
   * Listener for incoming call
   */
  useEffect(() => {
    if (!peerManager) return;

    async function handleIncomingCall(ctc: IContact, mc: MediaConnection) {
      setCall({ contact: ctc, mediaConnection: mc });
      console.info('Incoming call', ctc, mc, mc.type);

      navigator.vibrate && navigator.vibrate([2000, 2000, 2000, 2000]);
    }
    peerManager.on('onIncomingCall', handleIncomingCall);
    return () => {
      peerManager.removeListener('onIncomingCall', handleIncomingCall);
    };
  }, [peerManager]);

  /**
   * Asks for local stream after user accepted the call
   */
  useEffect(() => {
    if (accepted && !localMediaStream) {
      navigator.mediaDevices
        .getUserMedia({ video: accepted.videoOn, audio: true })
        .then(setLocalMediaStream);
    }
  }, [accepted, localMediaStream]);

  /**
   *
   */
  useEffect(() => {
    if (accepted && call?.contact && peerManager && localMediaStream) {
      peerManager.acceptCall(call.contact, localMediaStream).then((rms) => {
        console.debug('Setting rms', rms);
        setRemoteMediaStream(rms);
      });
    }
  }, [accepted, call?.contact, localMediaStream, peerManager]);

  function AcceptCall() {
    return (
      <Stack gap={2}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setAccepted({ videoOn: true })}
        >
          Accept
        </Button>
        <Button
          //hidden={videoOn}
          variant="contained"
          color="secondary"
          onClick={() => {
            setAccepted({ videoOn: false });
          }}
        >
          Audio Only
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => setAccepted(undefined)}>
          Decline
        </Button>
      </Stack>
    );
  }

  const ReceivingCallDialog = ({
    call: c,
  }: {
    call: { contact: IContact; mediaConnection: MediaConnection };
  }) => {
    return (
      <>
        <RingingIcon />
        <Dialog open>
          <DialogTitle>
            <RingingIcon />
            Receiving Call from
          </DialogTitle>
          <DialogContent>
            <ContactItem contact={c.contact} />
            {!(accepted && c && localMediaStream && remoteMediaStream) ? ( //ask permission to answer
              <AcceptCall />
            ) : (
              <CallingComponent
                contact={c.contact}
                videoOn={accepted.videoOn}
                mediaConnection={c.mediaConnection}
                localMediaStream={localMediaStream}
                remoteMediaStream={remoteMediaStream}
              />
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  };

  /**
   *
   */
  return call ? (
    <ReceivingCallDialog call={call} />
  ) : (
    <Tooltip title="Currenly not in a call">
      <CallEndIcon />
    </Tooltip>
  );
};

export default CalleeComponent;
