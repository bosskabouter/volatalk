import { IContact } from '../../types';

import { useContext, useEffect, useRef } from 'react';
import { Button, Dialog, DialogContent, useMediaQuery, useTheme } from '@mui/material';
import { PeerContext } from '../../providers/PeerProvider';
import { ContactListItem } from '../Contacts/ContactListItem';
import { MediaConnection } from 'peerjs';

const CallingComponent = ({
  contact,
  videoOn,
  mediaConnection,
  localMediaStream,
  remoteMediaStream,
}: {
  contact: IContact;
  videoOn: boolean;
  mediaConnection: MediaConnection;
  localMediaStream: MediaStream;
  remoteMediaStream: MediaStream;
}) => {
  const peerManager = useContext(PeerContext);

  const remoteMediaElement = useRef<HTMLVideoElement>(null);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  /**
   * Reset an ongoing call
   */
  const hangup = () => {
    mediaConnection.close();
    localMediaStream.getTracks().forEach(localMediaStream.removeTrack);
    peerManager?.disconnectCall(contact);
  };

  /**
   *
   */
  useEffect(() => {
    if (!remoteMediaStream || !remoteMediaElement.current) return;
    //setVideoOn(remoteMediaStream.getVideoTracks().length > 0);

    remoteMediaElement.current.srcObject = remoteMediaStream;
    remoteMediaElement.current.play();
  }, [remoteMediaStream]);

  const MediaElement = () => {
    return videoOn ? (
      <video ref={remoteMediaElement} autoPlay controls />
    ) : (
      <audio ref={remoteMediaElement} autoPlay controls />
    );
  };

  /**
   *
   */
  useEffect(() => {
    console.debug('useEffect remoteVideoElement');

    if (remoteMediaElement.current && remoteMediaStream) {
      remoteMediaElement.current.srcObject = remoteMediaStream;
      remoteMediaElement.current.play();
      console.info('Set remoteVideoElement');
    }
    return () => {
      console.warn('leaving call?');
      if (remoteMediaStream) {
        console.info('Should Close connection now?');
      }
    };
  }, [remoteMediaStream]);

  /**
   *
   */
  return (
    <Dialog open={mediaConnection != null} fullScreen={fullScreen}>
      <DialogContent>
        <ContactListItem contact={contact}></ContactListItem>
        <MediaElement />
        <Button color="secondary" onClick={hangup}>
          Hangup
        </Button>
        <Button color="secondary" onClick={() => alert('Not yet...')}>
          Record
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CallingComponent;
