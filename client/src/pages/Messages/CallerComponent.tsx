import { useContext, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
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
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream>();

  const peerManager = useContext(PeerContext);
  const db = useContext(DatabaseContext);
  const contactId = useParams().contactid || '';

  const [contact, setContact] = useState<IContact>();
  const [videoOn] = useState<boolean>(props.videoOn || false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: videoOn, audio: true }).then(setLocalMediaStream);
  }, [videoOn]);

  useEffect(() => {
    if (!contact && contactId && db) {
      db.getContact(contactId).then((ctc) => {
        setContact(ctc);
      });
    }
  }, [contact, contactId, db]);

  useEffect(() => {
    if (!remoteMediaStream) callContact();

    async function callContact() {
      if (!contact || !localMediaStream || !peerManager) return;
      console.debug(
        'setting up ' + (videoOn ? 'video' : '') + 'call connection with contact',
        contactId
      );
      const rms = await peerManager.call(contact, localMediaStream);
      if (rms) setRemoteMediaStream(rms);
    }
  }, [contactId, peerManager, videoOn, remoteMediaStream, db, contact, localMediaStream]);

  useEffect(() => {
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
      <Dialog open>
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
