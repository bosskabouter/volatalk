import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Badge from '@mui/material/Badge';
import { IContactResume } from 'types';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { PeerContext } from 'providers/PeerProvider';
import { Button } from '@mui/material';

function ContactRequestsButton() {
  const db = useContext(DatabaseContext);
  const peerCtx = useContext(PeerContext);

  const navigate = useNavigate();

  const [contactRequests, setContactRequests] = useState<IContactResume[]>([]);

  useEffect(() => {
    if (!db) return;

    db.selectUnacceptedContacts()
      .toArray()
      .then((ctc) => {
        setContactRequests(ctc);
      });
  }, [db]);

  useEffect(() => {
    if (!peerCtx) return;

    const handleNewIncomingContactRequest = (newContact: IContactResume) => {
      setContactRequests((prevCtcList) => [...prevCtcList, newContact]);
    };
    peerCtx.on('onNewContact', handleNewIncomingContactRequest);
    return () => {
      peerCtx.removeListener('onNewContact', handleNewIncomingContactRequest);
    };
  }, [peerCtx]);

  const handleClickButton = () => {
    navigate('/Invite');
  };

  const hasUnansweredRequests = contactRequests.length > 0;
  return (
    <Badge
      variant={hasUnansweredRequests ? 'standard' : 'dot'}
      color={'info'}
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={contactRequests.length}
    >
      <Button
        variant="contained"
        onClick={handleClickButton}
        startIcon={<PersonAddIcon />}
        color="secondary"
      >
        Invite
      </Button>
    </Badge>
  );
}

export default ContactRequestsButton;
