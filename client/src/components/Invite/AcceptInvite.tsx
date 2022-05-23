import { useContext, useEffect, useState } from 'react';
import { extractInvite } from 'services/InvitationService';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { PeerContext } from 'providers/PeerProvider';
import { Alerter } from 'components/StatusDisplay/Alerter';
import { UserContext } from 'providers/UserProvider';
import {
  Button,
  Badge,
  Avatar,
  Dialog,
  Typography,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { genSignature } from 'services/Crypto';
import { IInvite } from 'types';
import { useNavigate } from 'react-router-dom';
import { identicon } from 'minidenticons';

export default function AcceptInvite(props: { invite: string }) {
  //recover invite from local storage hack
  localStorage.removeItem('invite');

  const [senderOnline, setSenderOnline] = useState<boolean | undefined>(undefined);
  const [result, setResult] = useState<string>('');

  const [receivedInvite, setReceivedInvite] = useState<IInvite | null>(null);

  const db = useContext(DatabaseContext);

  const navigate = useNavigate();
  const user = useContext(UserContext);
  const peerCtx = useContext(PeerContext);

  // cont
  useEffect(() => {
    if (!receivedInvite && !result) {
      extractInvite(new URLSearchParams(props.invite)).then((invite) => {
        if (invite) setReceivedInvite(invite);
        else setResult('Invalid invitation');
      });
    } else if (receivedInvite && peerCtx && senderOnline === undefined) {
      setSenderOnline(false);
      // we just entered the page from url. wait for our own peer to connect
      //TODO include listener for peer start if closed of null
      const timeout = 1000;
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
  }, [peerCtx, result, receivedInvite, senderOnline, props.invite]);

  //handler
  const handleAcceptContact = async () => {
    if (!(db && receivedInvite && peerCtx)) return;

    let contact = await db.contacts.get(receivedInvite.peerId);
    if (contact) {
      setResult(`Invite already accepted.. Still waiting to connect... `);
      setTimeout(() => {
        navigate('/contacts');
      }, 5000);
    } else {
      const sig = await genSignature(receivedInvite.peerId, user.user.privateKey);
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
      setTimeout(() => {
        navigate('/contacts');
      }, 5000);
    }
    peerCtx?._initiateConnection(contact);
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
    setTimeout(() => {
      navigate('/contacts');
    }, 5000);
    return <Alerter message="No invite in URL" type="error" />;
  }

  return (
    <>
      {result ?? <Alerter message={result} type="error" />}
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
    </>
  );
}
