import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { extractInvite, IInvite } from 'services/InvitationService';
import { identicon } from 'minidenticons';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import { Button, TextField } from '@mui/material';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { PeerContext } from 'providers/PeerProvider';
import { Alerter } from 'components/StatusDisplay/Alerter';

export default function AcceptInvite() {
  const [queryParams] = useState<URLSearchParams>(new URLSearchParams(useLocation().search));

  const [senderOnline, setSenderOnline] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');

  const [receivedInvite, setReceivedInvite] = useState<IInvite | null>(null);

  const db = useContext(DatabaseContext);

  const peerCtx = useContext(PeerContext);
  const navigate = useNavigate();
  useEffect(() => {
    extractInvite(queryParams).then((invite) => {
      setReceivedInvite(invite);
    });
  }, [queryParams, result]);

  //handler
  const handleSendConnectRequest = async () => {
    if (!(db && receivedInvite && peerCtx)) return;

    let contact = await db.contacts.get(receivedInvite.peerId);
    if (contact) setResult(`Invite already accepted.. Still trying to connect... `);
    else {
      //generate signature with other peers id
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

    const online = peerCtx?.checkConnection(contact);
    setSenderOnline(online);

    navigate(`/Contacts`);
  };

  return !receivedInvite ? (
    <Alerter message="No invite in URL" type="error" />
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
