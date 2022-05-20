import { IContact } from '../../types';

import { useContext, useEffect, useRef, useState } from 'react';
import { PeerContext } from 'providers/PeerProvider';
import { MediaConnection } from 'peerjs';
import { Button, Dialog, DialogContent, Popper } from '@mui/material';
import { useParams } from 'react-router-dom';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { RequestQuoteRounded } from '@mui/icons-material';

interface CallerComponentProps {
  videoOn: boolean;
}

const CallerComponent = (props: CallerComponentProps) => {
  // navigator.vibrate(200);
  //getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  const remoteVideoElement = useRef<HTMLVideoElement>(null);

  const [mediaConnection, setMediaConnection] = useState<MediaConnection | null>();
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream>();

  const peerManager = useContext(PeerContext);

  const contactId = useParams().contactid;
  const [videoOn] = useState<boolean>(props.videoOn || false);

  useEffect(() => {
    if (!mediaConnection) callContact();

    async function callContact() {
      let lms;
      try {
        lms = await navigator.mediaDevices.getUserMedia({ video: videoOn, audio: true });
      } catch (err) {
        console.error('Problem getUserMedia', err);
      }
      if (!lms || !peerManager || !contactId) return;
      console.debug(
        'setting up ' + (videoOn ? 'video' : '') + 'call connection with contact',
        contactId
      );

      const mc = peerManager._peer.call(contactId, lms);

      mc.on('stream', (rms) => {
        console.debug('Got remote media stream', rms);
        setRemoteMediaStream(rms);
      });

      setMediaConnection(mc);
    }

    if (remoteVideoElement.current && remoteMediaStream) {
      remoteVideoElement.current.srcObject = remoteMediaStream;
      remoteVideoElement.current.play();
      console.info('Set remoteVideoElement');
    }

    return () => {
      console.warn('leaving call');
      if (mediaConnection) {
        console.info('Closing connection');
        //mediaConnection.close();
        mediaConnection.removeAllListeners();
        //setMediaConnection(null);
      }
      //pm._peer.disconnect();
    };
  }, [contactId, peerManager, videoOn, remoteMediaStream, mediaConnection]);

  return (
    <>
      <Dialog open>
        <DialogContent>
          <video ref={remoteVideoElement} controls autoPlay />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CallerComponent;
