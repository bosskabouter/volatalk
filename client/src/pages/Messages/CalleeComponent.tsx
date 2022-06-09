import { IContact } from '../../types';

import { useContext, useEffect, useRef, useState } from 'react';
import { Button, Dialog, DialogContent } from '@mui/material';
import { PeerContext } from '../../providers/PeerProvider';
import { ContactListItem } from '../Contacts/ContactListItem';
import { MediaConnection } from 'peerjs';

const CalleeComponent = () => {
  const peerMngr = useContext(PeerContext);

  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(null);
  const [mediaConnection, setMediaConnection] = useState<MediaConnection | null>(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);

  const remoteVideoElement = useRef<HTMLVideoElement>(null);

  const [videoOn, setVideoOn] = useState<boolean>(true);

  const [answered, setAnswered] = useState<boolean>(false);
  const [accepted, setAccepted] = useState<boolean>(false);

  const [contact, setContact] = useState<IContact | null>(null);

  useEffect(() => {
    if (!peerMngr) return;
    console.debug('useEffect handleIncomingCall');

    async function handleIncomingCall(ctc: IContact, mc: MediaConnection) {
      setContact(ctc);
      setMediaConnection(mc);
      console.info('Incoming call', ctc, mc);
      navigator.vibrate && navigator.vibrate([2000, 2000, 2000]);
    }

    //wait for incoming call
    peerMngr.on('onIncomingCall', handleIncomingCall);
    return () => {
      peerMngr.removeListener('onIncomingCall', handleIncomingCall);
    };
  }, [peerMngr]);

  useEffect(() => {
    console.debug('useEffect answerCall');

    if (!remoteMediaStream && mediaConnection && localMediaStream) {
      //someone calling
      if (answered) {
        mediaConnection.answer(localMediaStream);
      } else {
        mediaConnection.close();
      }
    }
  }, [answered, localMediaStream, mediaConnection, remoteMediaStream]);

  useEffect(() => {
    console.debug('useEffect acceptCall');

    if (remoteMediaStream && answered && contact) {
      navigator.mediaDevices
        .getUserMedia({ video: videoOn, audio: true })
        .then((lms) => {
          if (lms) {
            console.debug(
              'navigator.mediaDevices.getUserMedia({ video: videoOn, audio: true }).then((lms) =>',
              lms
            );
            setLocalMediaStream(lms);
            peerMngr?.acceptCall(contact, lms).then((rms) => {
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
    }
  }, [answered, contact, peerMngr, remoteMediaStream, videoOn]);

  const AskAcceptCall = () => {
    if (!contact || !localMediaStream) return <>No call to accept</>;
    const handleAcceptCall = () => {
      peerMngr?.acceptCall(contact, localMediaStream).then((rms) => {
        setRemoteMediaStream(rms);
        setAccepted(true);
        setAnswered(true);
      });
    };
    return (
      <>
        Incoming call:<ContactListItem contact={contact}></ContactListItem>
        <Button onClick={() => setAccepted(true)}>Accept</Button>
        <Button onClick={() => setAccepted(false)}>Decline</Button>
      </>
    );
  };

  return (
    <>
      {/* first ask to accept the call */}
      <Dialog open={remoteMediaStream != null && !accepted}>
        <DialogContent>
          <AskAcceptCall></AskAcceptCall>
        </DialogContent>
      </Dialog>

      <Dialog open={accepted}>
        <DialogContent>
          {videoOn ? (
            <video ref={remoteVideoElement} autoPlay />
          ) : (
            <audio ref={remoteVideoElement} autoPlay />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CalleeComponent;
