import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { extractInvite, IInvite, INVITE_PARAM } from 'services/InvitationService';
import { identicon } from 'minidenticons';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import { Button, TextField } from '@mui/material';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { PeerContext } from 'providers/PeerProvider';

export default function AcceptInvite() {
  const [queryParams] = useState<URLSearchParams>(new URLSearchParams(useLocation().search));

  const [senderOnline, setSenderOnline] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');

  const [receivedInvite, setReceivedInvite] = useState<IInvite | null>(null);

  const db = useContext(DatabaseContext);

  const peerCtx = useContext(PeerContext);

  useEffect(() => {
    extractInvite(queryParams).then((invite) => {
      setReceivedInvite(invite);
    });
  }, [queryParams, result]);

  //handler
  const handleSendConnectRequest = async () => {
    if (db && receivedInvite && peerCtx) {
      let contact = await db.contacts.get(receivedInvite.peerId);
      if (contact) setResult('Invite already accepted.. Still trying to connect... ');
      else {
        const sig = await peerCtx.genSignature(receivedInvite.peerId);

        contact = {
          nickname: receivedInvite.text,
          peerid: receivedInvite.peerId,
          dateCreated: new Date(),
          accepted: true,
          signature: sig,
        };
        db.contacts.add(contact);
      }

      const connection = peerCtx.initiateConnection(contact);

      setSenderOnline(connection.open);
    }
  };

  return !receivedInvite ? (
    <div>No invitation available</div>
  ) : (
    <div>
      Received invite: {receivedInvite.text}
      <Badge
        color={!senderOnline ? 'default' : 'success'}
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
      >
        <Avatar
          src={`data:image/svg+xml;utf8,${identicon(receivedInvite.peerId)}`}
          alt={`Sender's Identification icon`}
        ></Avatar>
      </Badge>
      <Button
        variant="contained"
        onClick={() => {
          handleSendConnectRequest();
        }}
      >
        Accept the Invitation and send a contact request?
      </Button>
      <TextField>${result}</TextField>
    </div>
  );
}
