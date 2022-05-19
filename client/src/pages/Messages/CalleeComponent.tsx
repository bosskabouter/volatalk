import { IContact } from '../../types';

import { useContext, useEffect, useRef, useState } from 'react';
import { PeerContext } from 'providers/PeerProvider';
import { MediaConnection } from 'peerjs';
import { Dialog } from '@mui/material';
import { useParams } from 'react-router-dom';
import { DatabaseContext } from 'providers/DatabaseProvider';

const CalleeComponent = () => {
  // navigator.vibrate(200);
  //getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  const localVideoElement = useRef<HTMLVideoElement>(null);
  const remoteVideoElement = useRef<HTMLVideoElement>(null);

  const peerManager = useContext(PeerContext);

  const db = useContext(DatabaseContext);

  const contactId = useParams().contactid;

  const [videoOn, setVideoOn] = useState<boolean>(false);

  const [fullScreen, setFullScreen] = useState<boolean>(false);

  const [mediaConnection, setMediaConnection] = useState<MediaConnection | null>(null);

  useEffect(() => {
    if (!peerManager || !db) return;

    async function askLocalMediaStream() {
      const lms = await navigator.mediaDevices.getUserMedia({ video: videoOn, audio: true });

      if (localVideoElement.current && lms) {
        localVideoElement.current.srcObject = lms;
        console.debug('Set LMS in localVideoElement', localVideoElement.current);
        //localVideoElement.current.play();
      }
      return lms;
    }

    async function handleMediaConnection(mc: MediaConnection) {
      //alert('Status change;' + status);
      //alert('Someone calling' + call.peer);
      setMediaConnection(mc);

      const lms = await askLocalMediaStream();

      console.debug('Got LMS', lms);
      //TODO ask if we want the call
      if (lms) mc.answer(lms); // Answer the call with an A/V stream.
      console.debug('Answered call');

      mc.on('stream', function (rms) {
        console.debug('Got remote media stream', rms);

        if (remoteVideoElement.current) {
          console.debug('Set RMS in remoteVideoElement ', remoteVideoElement.current);
          remoteVideoElement.current.srcObject = rms;
          remoteVideoElement.current.play();
        }
      });
    }

    
    //wait for incoming call
    peerManager.on('oneIncomingCall', handleMediaConnection);
    return () => {
      peerManager.removeListener('oneIncomingCall', handleMediaConnection);
      //setCalling(null);
      //calling?.close();
      //setCalling(null);
    };
  }, [mediaConnection, contactId, db, peerManager, videoOn]);

  return (
    <>
      <Dialog open={mediaConnection != null}>
        <video ref={localVideoElement}  muted autoPlay={true}></video>
        <video ref={remoteVideoElement} autoPlay={true} />
      </Dialog>
    </>
  );
};

export default CalleeComponent;
