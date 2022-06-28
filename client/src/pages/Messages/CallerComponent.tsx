import { useContext, useEffect, useState } from 'react';
import { Dialog, DialogTitle, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { DatabaseContext } from '../../providers/DatabaseProvider';
import { ContactItem } from '../Contacts/ContactItem';
import { PeerContext } from '../../providers/PeerProvider';
import { IContact } from '../../types';
import CallingComponent from './CallingComponent';
import { MediaConnection } from 'peerjs';

const CallerComponent = ({ videoOn }: { videoOn: boolean }) => {
  const peerManager = useContext(PeerContext);
  const db = useContext(DatabaseContext);
  const contactId = useParams().contactid;

  const [contact, setContact] = useState<IContact>();
  const [contactOnline, setContactOnline] = useState<boolean>(false);

  const [mediaConnection, setMediaConnection] = useState<MediaConnection | null>(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(null);

  /**
   * Ask for local media right away
   */
  useEffect(() => {
    if (!localMediaStream)
      navigator.mediaDevices
        .getUserMedia({ video: videoOn, audio: true })
        .then(setLocalMediaStream);
    return () => {
      localMediaStream?.getTracks().forEach(localMediaStream.removeTrack);
    };
  }, [localMediaStream, videoOn]);

  /**
   * Retrieves contactId from URL param, retrieves contact and verifies if contact is online
   */
  useEffect(() => {
    if (!contactId) throw Error('No contactId param');
    if (!peerManager || !db) return;

    db.getContact(contactId).then(setContact);
  }, [contactId, db, peerManager]);

  /**
   * Check if user is online before making the call
   */
  useEffect(() => {
    if (contact && peerManager) setContactOnline(peerManager.isConnected(contact));
  }, [contact, peerManager]);

  /**
   * Once contact is loaded and connected and local mediaStream is available, tries to setup call connection,
   */
  useEffect(() => {
    if (!remoteMediaStream && contact && peerManager && localMediaStream) {
      peerManager.call(contact, localMediaStream).then(({ ms, mc }) => {
        setRemoteMediaStream(ms);
        setMediaConnection(mc);
      });
    }
  }, [contactId, peerManager, videoOn, remoteMediaStream, db, contact, localMediaStream]);
  return contact ? (
    <Dialog open>
      <DialogTitle>Calling with</DialogTitle>

      <ContactItem contact={contact} />

      {!peerManager?.isOnline() && (
        <Typography>You are currently offline. Leave a message!</Typography>
      )}
      {!contactOnline && <Typography>Contact is currently offline. Leave a message!</Typography>}

      {contactOnline && mediaConnection && localMediaStream && remoteMediaStream && (
        <CallingComponent
          contact={contact}
          videoOn={videoOn}
          localMediaStream={localMediaStream}
          mediaConnection={mediaConnection}
          remoteMediaStream={remoteMediaStream}
        />
      )}
    </Dialog>
  ) : (
    <></>
  );
};

export default CallerComponent;
