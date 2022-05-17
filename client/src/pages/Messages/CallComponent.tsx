import { IContact } from '../../types';

import { useContext, useEffect, useRef, useState } from 'react';
import { PeerContext } from 'providers/PeerProvider';
import { MediaConnection } from 'peerjs';
import { Dialog } from '@mui/material';

interface CallComponentProps {
  contact: IContact;
  videoOn: boolean;
}

const CallComponent = (props: CallComponentProps) => {
  navigator.vibrate(200);
  //getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  const videoElementRef = useRef<HTMLVideoElement>(null);

  const peerManager = useContext(PeerContext);
  const [mediaConnection, setMediaConnection] = useState<MediaConnection | null>(null);

  const [fullScreen, setFullScreen] = useState<boolean>(false);

  useEffect(() => {
    if (peerManager?.isConnectedWith(props.contact)) {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: props.videoOn })
        .then((mediaStream) => {
          const mc = peerManager._peer.call(props.contact.peerid, mediaStream);
          setMediaConnection(mc);
        });
    }

    return () => {
      mediaConnection?.close();
    };
  }, [mediaConnection, peerManager, props.contact, props.videoOn]);

  return (
    <>
      <Dialog open>
        <video ref={videoElementRef} muted id="video-element-ids" className="video" />
      </Dialog>
    </>
  );
};

export default CallComponent;
