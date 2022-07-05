/** @jsxImportSource @emotion/react */

import { IContact } from '../../types';

import { useContext, useEffect, useRef } from 'react';
import { Box, Button, Dialog, DialogContent, useMediaQuery, useTheme } from '@mui/material';
import { PeerContext } from '../../providers/PeerProvider';
import { ContactListItem } from '../Contacts/ContactListItem';
import { MediaConnection } from 'peerjs';

const CallingComponent = ({
  contact,
  videoOn,
  mediaConnection,
  localMediaStream, //not used for now
  remoteMediaStream,
}: {
  contact: IContact;
  videoOn: boolean;
  mediaConnection: MediaConnection;
  localMediaStream: MediaStream;
  remoteMediaStream: MediaStream;
}) => {
  const peerManager = useContext(PeerContext);

  const remoteVideoElement = useRef<HTMLVideoElement>(null);
  const remoteAudioElement = useRef<HTMLAudioElement>(null);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const MediaElement = ({ source }: { source: MediaStream }) => {
    /**
     *
     */
    useEffect(() => {
      //setVideoOn(remoteMediaStream.getVideoTracks().length > 0);

      const media = videoOn ? remoteVideoElement.current : remoteAudioElement.current;
      if (media) {
        media.addEventListener('loadedmetadata', () => {
          // Play the video as it loads
          console.debug('media.play!');
          media.play().then(() => console.info('Playing media'));
        });
        media.srcObject = source;
      }
    }, [source]);

    return videoOn ? (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          //objectFit: 'cover',
          //position: 'fixed',

          top: 0,
          left: 0,
        }}
      >
        <video ref={remoteVideoElement} autoPlay={true} controls poster={contact.avatar} />
      </Box>
    ) : (
      <audio ref={remoteAudioElement} autoPlay={true} controls />
    );
  };

  /**
   * Reset an ongoing call
   */
  const hangup = () => {
    mediaConnection.close();
    //localMediaStream.getTracks().forEach(localMediaStream.removeTrack);
    peerManager?.disconnectCall(contact);
  };

  /**
   *
   */
  return (
    <Dialog open={mediaConnection != null} fullScreen={fullScreen}>
      <DialogContent>
        <ContactListItem contact={contact}></ContactListItem>
        <MediaElement source={remoteMediaStream} />
        <Button color="secondary" onClick={hangup}>
          Hangup
        </Button>
        <Button color="secondary" onClick={() => alert('Not yet implemented...')}>
          Record
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CallingComponent;
