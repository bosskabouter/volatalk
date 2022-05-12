import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { extractInvite } from 'services/InvitationService';
import { identicon } from 'minidenticons';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { PeerContext } from 'providers/PeerProvider';
import { Alerter } from 'components/StatusDisplay/Alerter';
import { ContactService } from 'services/ContactService';
import { UserContext } from 'providers/UserProvider';
import { IInvite } from 'types';
import { Button, Badge, Avatar, TextField } from '@mui/material';

export default function AcceptInvite() {
  const [queryParams] = useState<URLSearchParams>(new URLSearchParams(useLocation().search));

  const [senderOnline, setSenderOnline] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');

  const [receivedInvite, setReceivedInvite] = useState<IInvite | null>(null);

  const db = useContext(DatabaseContext);

  const user = useContext(UserContext);
  const peerCtx = useContext(PeerContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (receivedInvite) {
      setTimeout(() => {
        const conn = peerCtx?._peer?.connect(receivedInvite.peerId);
        conn?.on('open', () => {
          setSenderOnline(true);
          //just a test (without signature to see if peer is online)
          conn.close();
        });
      }, 10000);
    } else
      extractInvite(queryParams).then((invite) => {
        if (invite) setReceivedInvite(invite);
        else setResult('Invalid invitation');
      });
  }, [peerCtx, queryParams, result, receivedInvite]);

  //handler
  const handleAcceptContact = async () => {
    if (!(db && receivedInvite && peerCtx)) return;

    const contact = await db.contacts.get(receivedInvite.peerId);
    if (contact) setResult(`Invite already accepted.. Still waiting to connect... `);
    else {
      new ContactService(user.user, db).acceptInvite(receivedInvite).then((c) => {
        peerCtx?.checkConnection(c);
        console.info('Invitation accepted:  ' + c.nickname);
      });
      navigate(`/Contacts`);
    }
  };

  function isOnlineDesc() {
    return senderOnline ? 'online' : 'offline';
  }

  function BadgeColor() {
    return senderOnline ? 'success' : 'error';
  }
  return !receivedInvite ? (
    <Alerter message="No invite in URL" type="error" />
  ) : (
    <div>
      Received invite: {receivedInvite.text}
      <Badge
        color={BadgeColor()}
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
      >
        <Avatar src={`data:image/svg+xml;utf8,${identicon(receivedInvite.peerId)}`}></Avatar>
      </Badge>
      <Button variant="contained" onClick={handleAcceptContact}>
        Accept the Invitation and send a contact request?
        <br></br>
        Sender is {isOnlineDesc()}
      </Button>
      <TextField>${result}</TextField>
    </div>
  );
}
