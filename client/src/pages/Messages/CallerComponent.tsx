import { useContext, useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { DatabaseContext } from '../../providers/DatabaseProvider';
import { ContactItem } from '../Contacts/ContactItem';
import { PeerContext } from '../../providers/PeerProvider';
import { IContact } from '../../types';

interface CallerComponentProps {
  videoOn: boolean;
}

const CallerComponent = (props: CallerComponentProps) => {
  const remoteVideoElement = useRef<HTMLVideoElement>(null);

  const [localMediaStream, setLocalMediaStream] = useState<MediaStream>();
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);

  const peerManager = useContext(PeerContext);
  const db = useContext(DatabaseContext);
  const contactId = useParams().contactid;

  const [contact, setContact] = useState<IContact>();
  const [contactOnline, setContactOnline] = useState<boolean>(false);
  const [videoOn] = useState<boolean>(props.videoOn || false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  /**
   * Asks permission to use audio/video and sets the mediaStream in state
   */
  useEffect(() => {
    if (contactOnline) {
      console.debug('useEffect getUserMedia');
      navigator.mediaDevices
        .getUserMedia({ video: videoOn, audio: true })
        .then(setLocalMediaStream);
    }
  }, [contactOnline, videoOn]);

  /**
   * Retrieves contactId from URL param, retrieves contact and verifies if contact is online
   */
  useEffect(() => {
    console.debug('useEffect getContact');
    if (!db) throw Error('No DB');
    if (!contactId) throw Error('No contactId param');
    if (!peerManager) return;

    db.getContact(contactId).then((ctc) => {
      setContact(ctc);
      setContactOnline(peerManager.isConnected(ctc));
    });
  }, [contactId, db, peerManager]);

  /**
   * Once contact is loaded and connected and local mediaStream is available, tries to setup call connection,
   */
  useEffect(() => {
    console.debug('useEffect callContact');

    if (!remoteMediaStream && contact && localMediaStream) {
      console.debug('setting up call with contact', contactId);
      peerManager?.call(contact, localMediaStream).then(setRemoteMediaStream);
    }
  }, [contactId, peerManager, videoOn, remoteMediaStream, db, contact, localMediaStream]);

  /**
   *
   */
  useEffect(() => {
    console.debug('useEffect remoteVideoElement');

    if (remoteVideoElement.current && remoteMediaStream) {
      remoteVideoElement.current.srcObject = remoteMediaStream;
      remoteVideoElement.current.play();
      console.info('Set remoteVideoElement');
    }
    return () => {
      console.warn('leaving call?');
      if (remoteMediaStream) {
        console.info('Should Close connection now?');
      }
    };
  }, [remoteMediaStream]);

  const MediaElement = () => {
    return videoOn ? (
      <video ref={remoteVideoElement} autoPlay />
    ) : (
      <audio ref={remoteVideoElement} hidden autoPlay />
    );
  };
  return (
    <>
      <Dialog open={!peerManager?.isOnline()}>
        <DialogTitle>
          <Typography>You are currently offline. Leave a message!</Typography>
          {contact && <ContactItem contact={contact}></ContactItem>}
        </DialogTitle>
      </Dialog>
      <Dialog open={peerManager?.isOnline() === true && !contactOnline}>
        <DialogTitle>
          <Typography>Contact is currently offline. Leave a message!</Typography>
          {contact && <ContactItem contact={contact}></ContactItem>}
        </DialogTitle>
      </Dialog>
      <Dialog
        fullScreen={fullScreen}
        open={contactOnline}
        draggable={true}
        onClose={() => {
          console.log('Closing caller Dialog');
          if (localMediaStream) setLocalMediaStream(undefined);
        }}
      >
        <DialogTitle>
          <>
            {videoOn ? 'Video' : 'Audio'} <Typography>calling with </Typography>
            {contact && <ContactItem contact={contact}></ContactItem>}
          </>
        </DialogTitle>
        <DialogContent>
          <MediaElement />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CallerComponent;
