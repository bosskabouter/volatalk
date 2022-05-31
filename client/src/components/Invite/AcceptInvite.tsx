import { useContext, useEffect, useState } from 'react';
import { identicon } from 'minidenticons';

import {
  Button,
  Badge,
  Avatar,
  Dialog,
  Typography,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DatabaseContext } from '../../providers/DatabaseProvider';
import { UserContext } from '../../providers/UserProvider';
import { IInvite } from '../../types';
import { PeerContext } from '../../providers/PeerProvider';
import { extractInvite } from '../../services/InvitationService';
import { Alerter } from '../StatusDisplay/Alerter';
import { genSignature } from '../../services/Crypto';

export default function AcceptInvite(props: { invite: string }) {
  //recover invite from local storage hack
  localStorage.removeItem('invite');

  const [senderOnline, setSenderOnline] = useState<boolean | undefined>(undefined);
  const [result, setResult] = useState<string>('');

  const [receivedInvite, setReceivedInvite] = useState<IInvite | null>(null);

  const db = useContext(DatabaseContext);

  const navigate = useNavigate();
  const userCtx = useContext(UserContext);
  const peerCtx = useContext(PeerContext);

  useEffect(() => {
    if (!db || !peerCtx || !userCtx) return;
    if (!receivedInvite && !result) {
      extractInvite(new URLSearchParams(props.invite)).then(async (invite) => {
        if (invite) {
          setReceivedInvite(invite);

          const contact = await db.contacts.get(invite.peerId);
          if (contact) {
            setResult(`Invite already accepted.. Still waiting to connect... `);
          } else if (invite.peerId === userCtx.user.peerid) {
            setResult('Inviting yourself?');
          }
        } else {
          setResult('Invalid invitation');
        }
      });
    } else if (receivedInvite && senderOnline === undefined) {
      setSenderOnline(false);
      // we just entered the page from url. wait for our own peer to connect
      const timeout = 1000;
      setTimeout(async () => {
        const isOnline = await peerCtx.isPeerOnline(receivedInvite.peerId);
        setSenderOnline(isOnline);
      }, timeout);
    }
  }, [
    peerCtx,
    result,
    receivedInvite,
    senderOnline,
    props.invite,
    db,
    userCtx.user.peerid,
    userCtx,
  ]);

  //handler
  const handleAcceptContact = async () => {
    if (!(db && receivedInvite && peerCtx)) return;

    let contact = await db.contacts.get(receivedInvite.peerId);
    if (contact) {
      setResult(`Invite already accepted.. Still waiting to connect... `);
    } else {
      const sig = await genSignature(receivedInvite.peerId, userCtx.user.privateKey);
      contact = {
        peerid: receivedInvite.peerId,
        signature: sig,
        nickname: receivedInvite.text,
        avatar: '',
        dateTimeCreated: new Date().getTime(),
        dateTimeAccepted: new Date().getTime(),
        dateTimeResponded: 0,
        dateTimeDeclined: 0,
      };
      db.contacts.put(contact);
      console.info('Contact created', contact);
      setResult('Contact added!');
    }
    peerCtx?.connectContact(contact);

    navigate('/');
  };

  function isOnlineDesc() {
    if (senderOnline === undefined) return 'Trying to connect with invitor... ';
    else if (senderOnline) return 'The person Invitator is online right now!';
    else
      return 'The person who sent the invitation appears to be right now. Go ahead and save the new contact for now. Once the other person accepts your connection, you will get notified!';
  }

  function BadgeColor() {
    if (senderOnline === undefined) return 'default';
    else if (senderOnline) return 'success';
    else return 'error';
  }
  if (!receivedInvite) {
    // setTimeout(() => {
    //   navigate('/contacts');
    // }, 5000);
    return <Alerter message="No invite in URL" type="error" />;
  }

  return (
    <>
      {result ? (
        <Alerter message={result} type="error" />
      ) : (
        <Dialog open>
          <DialogContent>
            <Typography variant="subtitle2" align="center">
              You received an invite to connect
            </Typography>
            <Typography variant="subtitle1" align="center">
              {receivedInvite.text}
            </Typography>

            <DialogContentText align="center">
              <Badge
                color={BadgeColor()}
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
              >
                <Avatar
                  sizes="large"
                  src={`data:image/svg+xml;utf8,${identicon(receivedInvite.peerId)}`}
                ></Avatar>
              </Badge>
              <Button variant="contained" onClick={handleAcceptContact}>
                Accept the Invitation and send a contact request?
              </Button>
            </DialogContentText>

            <DialogContentText align="center">{isOnlineDesc()}</DialogContentText>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
