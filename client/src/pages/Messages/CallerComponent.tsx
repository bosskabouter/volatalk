import { useContext, useEffect, useRef, useState } from 'react';
import { PeerContext } from 'providers/PeerProvider';
import { MediaConnection } from 'peerjs';
import { Avatar, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useParams } from 'react-router-dom';
import { identicon } from 'minidenticons';
import { IContact } from 'types';
import { ContactListItem } from 'pages/Contacts/ContactListItem';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { ContactItem } from 'pages/Contacts/ContactItem';

interface CallerComponentProps {
  videoOn: boolean;
}

const CallerComponent = (props: CallerComponentProps) => {
  const remoteVideoElement = useRef<HTMLVideoElement>(null);

  const [mediaConnection, setMediaConnection] = useState<MediaConnection | null>();
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream>();

  const peerManager = useContext(PeerContext);
  const db = useContext(DatabaseContext);
  const contactId = useParams().contactid || '';

  const [contact, setContact] = useState<IContact>();
  const [videoOn] = useState<boolean>(props.videoOn || false);

  useEffect(() => {
    if (contactId && db) {
      db.getContact(contactId).then((ctc) => {
        setContact(ctc);
      });
    }
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
      //TODO let peermanager make the call
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
    };
  }, [contactId, peerManager, videoOn, remoteMediaStream, mediaConnection, db]);

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
          {videoOn ? 'Video' : 'Audio'} calling
          {contact && <ContactItem contact={contact}></ContactItem>}
        </DialogTitle>
        <DialogContent>
          <MediaElement />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CallerComponent;
