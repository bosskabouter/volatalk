import { IContact } from '../../types';

import { useContext, useEffect, useRef, useState } from 'react';
import { Button, Dialog, DialogContent, Typography } from '@mui/material';
import { PeerContext } from '../../providers/PeerProvider';
import { ContactListItem } from '../Contacts/ContactListItem';
import { MediaConnection } from 'peerjs';
import { rmSync } from 'fs';

const CalleeComponent = () => {
  const peerManager = useContext(PeerContext);

  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(null);
  const [mediaConnection, setMediaConnection] = useState<MediaConnection | null>(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);

  const remoteVideoElement = useRef<HTMLVideoElement>(null);

  const [videoOn, setVideoOn] = useState<boolean>(true);

  const [accepted, setAccepted] = useState<boolean | null>(null);

  const [contact, setContact] = useState<IContact | null>(null);

  useEffect(() => {
    if (!peerManager) return;
    console.debug('useEffect handleIncomingCall');

    async function handleIncomingCall(ctc: IContact, mc: MediaConnection) {
      setContact(ctc);
      setMediaConnection(mc);
      console.info('Incoming call', ctc, mc);
      navigator.vibrate && navigator.vibrate([2000, 2000, 2000]);
    }

    //wait for incoming call
    peerManager.on('onIncomingCall', handleIncomingCall);
    return () => {
      peerManager.removeListener('onIncomingCall', handleIncomingCall);
    };
  }, [peerManager]);

  useEffect(() => {
    console.debug('useEffect answerCall');

    if (!remoteMediaStream && mediaConnection && localMediaStream) {
      //someone calling
      if (accepted === false && mediaConnection != null) {
        mediaConnection.close();
      }
    }
  }, [accepted, localMediaStream, mediaConnection, remoteMediaStream]);

  /**
   *
   */
  useEffect(() => {
    console.debug('useEffect acceptCall');

    if (!accepted || localMediaStream || !contact || !peerManager) return;

    navigator.mediaDevices
      .getUserMedia({ video: videoOn, audio: true })
      .then((lms) => {
        if (lms) {
          console.debug(
            'navigator.mediaDevices.getUserMedia({ video: videoOn, audio: true }).then((lms) =>',
            lms
          );
          setLocalMediaStream(lms);
          peerManager.acceptCall(contact, lms).then((rms) => {
            console.debug('peerMngr?.acceptCall(contact, lms).then((rms) => ', rms);
            setRemoteMediaStream(rms);
            const remoteVideoIsOn = rms.getVideoTracks().length > 0;
            setVideoOn(remoteVideoIsOn);

            if (remoteVideoElement.current) {
              remoteVideoElement.current.srcObject = remoteMediaStream;
              remoteVideoElement?.current?.play();
            }
          });
        }
      })
      .catch((error) => {
        console.warn('Problem LMS', error);
      });
  }, [accepted, contact, localMediaStream, peerManager, remoteMediaStream, videoOn]);

  const MediaElement = () => {
    return videoOn ? (
      <video ref={remoteVideoElement} autoPlay />
    ) : (
      <audio ref={remoteVideoElement} autoPlay />
    );
  };
  return !contact ? (
    <Typography variant="subtitle1">Currently No calls</Typography>
  ) : (
    <>
      {/* first ask to accept the call */}
      <Dialog open={mediaConnection != null}>
        <ContactListItem contact={contact}></ContactListItem>
        <DialogContent>
          <Button onClick={() => setAccepted(true)} hidden={accepted === undefined}>
            Accept
          </Button>
          <Button onClick={() => setAccepted(false)} hidden={accepted === undefined}>
            Decline
          </Button>
          <Button onClick={() => mediaConnection?.close()} hidden={accepted === true}>
            Hangup
          </Button>

          <MediaElement />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CalleeComponent;
