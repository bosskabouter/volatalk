import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { extractInvite, IInvite, INVITE_PARAM } from 'services/InvitationService';
import { identicon } from 'minidenticons';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import { Button } from '@mui/material';

export default function AcceptInvite() {
  const [queryParams] = useState<URLSearchParams>(new URLSearchParams(useLocation().search));

  const fromStr = queryParams.get(INVITE_PARAM.FROM);
  const [from] = useState<string>(fromStr ? fromStr : '');

  const textStr = queryParams.get(INVITE_PARAM.KEY);
  const [text] = useState<string>(textStr ? textStr : '');


  const [senderOnline, setSenderOnline] = useState<boolean>(false);

  const [receivedInvite, setReceivedInvite] = useState<IInvite | null>(null);
  


  useEffect(() => {
    extractInvite(queryParams).then((invite) => {
      setReceivedInvite(invite);
    });
  }, [queryParams]);

  //handler
  const handleSendConnectRequest = (event: React.MouseEvent<HTMLElement>) => {
    console.log(event.target);
    console.log(text);


  };

  return (
    <div>
      Received invite: {receivedInvite?.text}
      <Avatar
        src={`data:image/svg+xml;utf8,${identicon(from)}`}
        alt={`Sender's Identification icon`}
      ></Avatar>
      <Button
        variant="contained"
        onClick={(e) => {
          handleSendConnectRequest(e);
        }}
      >
        Accept the Invitation and send a contact request?
      </Button>
    </div>
  );
}
