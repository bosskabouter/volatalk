import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Badge from '@mui/material/Badge';
import { IContactResume } from 'types';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { PeerContext } from 'providers/PeerProvider';
import { Button, Tooltip } from '@mui/material';

function ContactRequestsButton() {
  const db = useContext(DatabaseContext);
  const peerCtx = useContext(PeerContext);

  const navigate = useNavigate();

  const [contactRequests, setContactRequests] = useState<IContactResume[]>([]);

  useEffect(() => {
    if (!db || contactRequests) return;
    console.debug('useEffect selectUnacceptedContacts');
    db.selectUnacceptedContacts()
      .toArray()
      .then((ctc) => {
        setContactRequests(ctc);
      });
  }, [contactRequests, db]);

  useEffect(() => {
    if (!peerCtx) return;
    console.debug('useEffect handleNewIncomingContactRequest');
    const handleNewIncomingContactRequest = (newContact: IContactResume) => {
      setContactRequests((prevCtcList) => [...prevCtcList, newContact]);
    };
    peerCtx.on('onNewContact', handleNewIncomingContactRequest);
    return () => {
      peerCtx.removeListener('onNewContact', handleNewIncomingContactRequest);
    };
  }, [peerCtx]);

  const hasUnansweredRequests = contactRequests.length > 0;
  return (
    <Tooltip title="Invite People">
      <Badge
        variant={hasUnansweredRequests ? 'standard' : 'dot'}
        color={'info'}
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={contactRequests.length}
      >
        <Button
          variant="contained"
          onClick={() => {
            navigate('/Invite');
          }}
          color="secondary"
        >
          <PersonAddIcon sx={{ width: 27, height: 27, border: 0 }} />
        </Button>
      </Badge>
    </Tooltip>
  );
}

export default ContactRequestsButton;
