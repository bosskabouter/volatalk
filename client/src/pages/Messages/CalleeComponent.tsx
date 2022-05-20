import { IContact } from '../../types';

import { useContext, useEffect, useRef, useState } from 'react';
import { PeerContext } from 'providers/PeerProvider';
import { MediaConnection } from 'peerjs';
import { Button, Dialog, DialogContent, Popper } from '@mui/material';
import { useParams } from 'react-router-dom';
import { DatabaseContext } from 'providers/DatabaseProvider';

const CalleeComponent = () => {
  // navigator.vibrate(200);
  //getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  const localVideoElement = useRef<HTMLVideoElement>(null);
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream>();

  const remoteVideoElement = useRef<HTMLVideoElement>(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream>();

  const peerManager = useContext(PeerContext);

  const db = useContext(DatabaseContext);

  const contactId = useParams().contactid;

  const [videoOn, setVideoOn] = useState<boolean>(true);

  const [fullScreen, setFullScreen] = useState<boolean>(false);

  const [mediaConnection, setMediaConnection] = useState<MediaConnection | null>(null);

  const [Answered, setAnswered] = useState<boolean>(false);
  const [contact, setContact] = useState<IContact | null>(null);

  useEffect(() => {
    if (!peerManager || !db) return;

    if (mediaConnection && !remoteMediaStream) {
      navigator.mediaDevices
        .getUserMedia({ video: videoOn, audio: true })
        .then((lms) => {
          //TODO ask if we want the call
          if (lms) {
            console.debug('Got LMS', lms);
            mediaConnection.answer(lms); // Answer the call with an A/V stream.
            console.debug('Answered call');

            mediaConnection.on('stream', (rms) => {
              console.debug('Got remote media stream', rms);
              setRemoteMediaStream(rms);
            });
          }
        })
        .catch((error) => {
          console.warn('Probleming LMS', error);
        });
    }

    if (remoteVideoElement.current && remoteMediaStream) {
      console.debug('Set RMS in remoteVideoElement ', remoteVideoElement.current);
      remoteVideoElement.current.srcObject = remoteMediaStream;
      remoteVideoElement.current.play();
    }

    async function handleIncomingMediaConnection(mc: MediaConnection) {
      //alert('Status change;' + status);
      //alert('Someone calling' + call.peer);
      console.info('Incoming call', mc);
      setMediaConnection(mc);
    }

    //wait for incoming call
    peerManager.on('oneIncomingCall', handleIncomingMediaConnection);
    return () => {
      peerManager.removeListener('oneIncomingCall', handleIncomingMediaConnection);
      //setCalling(null);
      //calling?.close();
      //setCalling(null);
    };
  }, [db, mediaConnection, peerManager, remoteMediaStream, videoOn]);

  return (
    <>
      <Dialog open={mediaConnection != null}>
        <DialogContent>
          <video ref={remoteVideoElement} controls autoPlay />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CalleeComponent;
