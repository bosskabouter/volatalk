import { BaseSyntheticEvent, MouseEvent, useContext, useEffect, useState } from 'react';

import CallIcon from '@mui/icons-material/Call';
import AddTaskIcon from '@mui/icons-material/AddTask';

import { IconButton } from '@mui/material';
import { VideoCameraFront as CallContactIcon } from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

import { IContact } from '../../types';
import { PeerContext } from '../../providers/PeerProvider';
import { DatabaseContext } from '../../providers/DatabaseProvider';
import { MessageItem } from 'pages/Message/MessageItem';
import { ContactDetails } from './ContactDetails';
import BlockIcon from '@mui/icons-material/Block';

export const ContactActions = ({ contact, detailed }: { contact: IContact; detailed: boolean }) => {
  const peerMngr = useContext(PeerContext);
  const db = useContext(DatabaseContext);
  const navigate = useNavigate();
  const [online, setOnline] = useState(peerMngr?.isConnected(contact));

  const handleMessageContact = (_e: MouseEvent) => {
    navigate('/messages/' + contact.peerid);
  };
  const handleCallContact = (e: MouseEvent) => {
    navigate('/call/' + contact.peerid);
    //avoid onclick listitem handleClickMessageContact
    e.stopPropagation();
    e.preventDefault();
  };
  const handleVideoCall = (e: MouseEvent) => {
    navigate('/video/' + contact.peerid);
    //avoid onclick listitem handleClickMessageContact
    e.stopPropagation();
    e.preventDefault();
  };

  const handleAccept = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    contact.dateTimeAccepted = new Date().getTime();
    db?.contacts.update(contact, { dateTimeAccepted: contact.dateTimeAccepted });
    if (peerMngr) {
      peerMngr.connectContact(contact);
      setOnline(peerMngr.isConnected(contact));
    }
  };

  const AcceptButton = () => {
    return contact.dateTimeAccepted === 0 ? (
      <IconButton
        sx={{ visibility: 'none' }}
        hidden={true}
        onClick={handleAccept}
        edge="start"
        aria-label="Accept Contact?"
        color="success"
        size="small"
        title="Accept Contact"
      >
        Add Contact!
        <AddTaskIcon />
      </IconButton>
    ) : (
      <></>
    );
  };

  const BlockButton = () => {
    return contact.dateTimeDeclined > 0 ? (
      <IconButton
        color="info"
        onClick={() => {
          contact.dateTimeDeclined = 0;
          db?.contacts.update(contact, { dateTimeDeclined: contact.dateTimeDeclined });
        }}
        size="small"
      >
        {detailed && 'Unblock'}
        <BlockIcon />
      </IconButton>
    ) : (
      <IconButton
        color="error"
        onClick={() => {
          contact.dateTimeDeclined = new Date().getTime();
          db?.contacts.update(contact, { dateTimeDeclined: contact.dateTimeDeclined });
        }}
        size="small"
      >
        {detailed && 'Block'}
        <BlockIcon />
      </IconButton>
    );
  };
  return (
    db && (
      <div>
        <AcceptButton />
        <BlockButton />

        <IconButton
          disabled={!online}
          onClick={handleVideoCall}
          edge="end"
          aria-label="Video Call"
          color="success"
          size="small"
        >
          {detailed && 'Video Call'}
          <CallContactIcon />
        </IconButton>
        <IconButton
          disabled={!online}
          onClick={handleCallContact}
          edge="end"
          aria-label="Audio Call"
          color="success"
          size="small"
        >
          {detailed && 'Audio Call'}
          <CallIcon />
        </IconButton>
      </div>
    )
  );
};
