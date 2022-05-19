import { IContact } from '../../types';

import { useContext, useEffect, useRef, useState } from 'react';
import { PeerContext } from 'providers/PeerProvider';
import { MediaConnection } from 'peerjs';
import { Dialog } from '@mui/material';
import { useParams } from 'react-router-dom';
import { DatabaseContext } from 'providers/DatabaseProvider';

interface CallerComponentProps {
  videoOn: boolean;
}

const CallerComponent = (props: CallerComponentProps) => {
  // navigator.vibrate(200);
  //getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  const localVideoElement = useRef<HTMLVideoElement>(null);
  const remoteVideoElement = useRef<HTMLVideoElement>(null);

  const peerManager = useContext(PeerContext);

  const db = useContext(DatabaseContext);

  const contactId = useParams().contactid;

  const [videoOn, setVideoOn] = useState<boolean>(props.videoOn || false);

  const [fullScreen, setFullScreen] = useState<boolean>(false);

  const [mediaConnection, setMediaConnection] = useState<MediaConnection | null>(null);

  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(null);

  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
  useEffect(() => {
    if (!peerManager || !db) return;

    async function askLocalMediaStream() {
      const lms = await navigator.mediaDevices.getUserMedia({ video: videoOn, audio: true });
      if (lms) setLocalMediaStream(lms);
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
        setRemoteMediaStream(rms);
      });
    }
    if (localVideoElement.current && localMediaStream) {
      localVideoElement.current.srcObject = localMediaStream;
      console.debug('Set LMS in localVideoElement', localVideoElement.current);
      //localVideoElement.current.play();
    }
    if (remoteVideoElement.current && remoteMediaStream) {
      console.debug('Set RMS in remoteVideoElement ', remoteVideoElement.current);
      remoteVideoElement.current.srcObject = remoteMediaStream;
      //  remoteVideoElement.current.play();
    }

    async function callContact(contact: IContact) {
      console.debug('setting up call connection with contact', contact);
      if (peerManager) {
        const lms = await askLocalMediaStream();
        console.debug('Got LMS2', lms);
        if (lms) {
          const mc = peerManager._peer.call(contact.peerid, lms);
          handleMediaConnection(mc);
          return mc;
        }
      }
    }
    if (contactId && !mediaConnection) {
      //if supplied, set up a call to contact
      db.getContact(contactId).then(async (ctc) => {
        const mc = await callContact(ctc);
        if (mc) setMediaConnection(mc);
      });
    }

    return () => {
      //setCalling(null);
      //calling?.close();
      //setCalling(null);
    };
  }, [mediaConnection, contactId, db, localMediaStream, peerManager, remoteMediaStream, videoOn]);

  return (
    <>
      <Dialog open={mediaConnection != null}>
        <video ref={localVideoElement} controls muted autoPlay={true}></video>
        <video ref={remoteVideoElement} controls muted autoPlay={true} />
      </Dialog>
    </>
  );
};

export default CallerComponent;
