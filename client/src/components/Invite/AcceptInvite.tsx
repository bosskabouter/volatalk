import  { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { extractInvite } from 'services/InvitationService';
import { identicon } from 'minidenticons';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { PeerContext } from 'providers/PeerProvider';
import { Alerter } from 'components/StatusDisplay/Alerter';
import { UserContext } from 'providers/UserProvider';
import { Button, Badge, Avatar } from '@mui/material';
import { genSignature } from 'services/Crypto';
import { IInvite } from 'types';

export default function AcceptInvite() {
  const [queryParams] = useState<URLSearchParams>(new URLSearchParams(useLocation().search));

  const [senderOnline, setSenderOnline] = useState<boolean | undefined>(undefined);
  const [result, setResult] = useState<string>('');

  const [receivedInvite, setReceivedInvite] = useState<IInvite | null>(null);

  const db = useContext(DatabaseContext);

  const user = useContext(UserContext);
  const peerCtx = useContext(PeerContext);

  useEffect(() => {
    if (!receivedInvite && !result) {
      extractInvite(queryParams).then((invite) => {
        if (invite) setReceivedInvite(invite);
        else setResult('Invalid invitation');
      });
    } else if (receivedInvite && peerCtx && senderOnline === undefined) {
      setSenderOnline(false);
      // we just entered the page from url. wait for our own peer to connect
      //TODO include listener for peer start if closed of null
      const timeout = 10000;
      setTimeout(() => {
        const conn = peerCtx._peer.connect(receivedInvite.peerId);
        conn?.on('open', () => {
          setSenderOnline(true);
          /* Just a quick test (without signature to see if peer is online)
           * once the  invitation is accepted, we'll reconnect with a real signature.
           * Other side will bounce and close since we didn't send signature.
           */
          conn.close();
        });
      }, timeout);
    }
  }, [peerCtx, queryParams, result, receivedInvite, senderOnline]);

  //handler
  const handleAcceptContact = async () => {
    if (!(db && receivedInvite && peerCtx)) return;

    let contact = await db.contacts.get(receivedInvite.peerId);
    if (contact) {
      setResult(`Invite already accepted.. Still waiting to connect... `);
    } else {
      const sig = await genSignature(receivedInvite.peerId, user.user.privateKey);
      contact = {
        peerid: receivedInvite.peerId,
        signature: sig,
        nickname: receivedInvite.text,
        avatar: '',
        dateCreated: new Date(),
        accepted: true,
        declined: false,
      };
      db.contacts.put(contact);
      console.info('Contact created', contact);
      setResult('Contact added!');
    }
    peerCtx?.checkConnection(contact);
  };

  function isOnlineDesc() {
    if (senderOnline === undefined) return 'Trying to connect with invitor... ';
    else if (senderOnline) return 'Invitator is online right now!';
    else
      return 'Invitor seems to be offline right now. Go ahead and accept and save the new contact for now. We`ll try to connect later again. Once the other accepts your connection, you will get notified!';
  }

  function BadgeColor() {
    if (senderOnline === undefined) return 'default';
    else if (senderOnline) return 'success';
    else return 'error';
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
      {result ?? <Alerter message={result} type="error" />}
    </div>
  );
}
