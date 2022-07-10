/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { useContext, useEffect, useState } from 'react';
import { Button, Dialog, Typography, DialogContent, DialogContentText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DatabaseContext } from '../../providers/DatabaseProvider';
import { UserContext } from '../../providers/UserProvider';
import { PeerContext } from '../../providers/PeerProvider';
import { extractInvite } from '../../services/InvitationService';
import { Alerter } from '../StatusDisplay/Alerter';
import Identification from 'components/Identification/Identification';
import { IInvite } from 'types';
import { generateSignature } from 'services/crypto/CryptoService';

export default function AcceptInvite(props: { invite: string }) {
  const [open, setOpen] = useState(true);

  //recover invite from local storage hack
  localStorage.removeItem('invite');

  const [senderOnline, setSenderOnline] = useState<boolean | null>(null);
  const [result, setResult] = useState<string>('');

  const [receivedInvite, setReceivedInvite] = useState<IInvite | null>(null);

  const db = useContext(DatabaseContext);

  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const peerCtx = useContext(PeerContext);

  useEffect(() => {
    console.debug('useEffect extractInvite');
    extractInvite(new URLSearchParams(props.invite)).then(setReceivedInvite);
  }, [props.invite]);

  useEffect(() => {
    if (!receivedInvite || !user) return;
    if (receivedInvite.peerid === user.peerid) {
      setResult('Inviting yourself?');
    } else
      db?.contacts.get(receivedInvite.peerid).then((knownContact) => {
        knownContact &&
          setResult(
            `Invite already accepted.. Still waiting to connect with: ` + knownContact.nickname
          );
      });
  }, [db?.contacts, receivedInvite, user]);

  useEffect(() => {
    if (peerCtx && peerCtx.isOnline() && receivedInvite) {
      peerCtx?.isPeerOnline(receivedInvite.peerid).then(setSenderOnline);
    }
  }, [peerCtx, receivedInvite]);

  //handler
  const handleAcceptContact = async () => {
    if (!(db && receivedInvite && peerCtx && user)) return;

    let contact = await db.contacts.get(receivedInvite.peerid);
    if (contact) {
      setResult(`Invite already accepted.. Still waiting to connect... `);
    } else {
      const sig = await generateSignature(receivedInvite.peerid, user.security.privateKey);
      contact = {
        peerid: receivedInvite.peerid,
        signature: sig,
        nickname: receivedInvite.text,
        avatar: '',
        avatarThumb: '',
        dateRegistered: new Date(),
        dateTimeCreated: new Date().getTime(),
        dateTimeAccepted: new Date().getTime(),
        dateTimeResponded: 0,
        dateTimeDeclined: 0,
        position: null,
        pushSubscription: null,
        favorite: false,
      };
      db.contacts.put(contact);
      console.info('Contact created', contact);
      setResult('Contact added!');
    }
    peerCtx?.connectContact(contact);

    navigate('/');
  };

  function isOnlineDesc() {
    if (senderOnline === null) return 'Trying to connect with invitor... ';
    else if (senderOnline) return 'Invitor is online right now!';
    else
      return 'The person who sent the invitation appears to be offline right now. Save the new contact for now. Once the other accepts your connection, you will get notified!';
  }

  if (!receivedInvite) {
    return <Alerter message="No invite in URL" type="error" />;
  }
  const styles = {
    AcceptInviteStyle: css`
      padding-top: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 100%;
    `,
  };

  return (
    <>
      {result ? (
        <Alerter message={result} type="error" />
      ) : (
        <Dialog open={open} onClose={() => setOpen(false)} css={styles.AcceptInviteStyle}>
          <DialogContent>
            <Typography variant="subtitle2">You received an invite to connect</Typography>
            <Typography variant="subtitle1">{receivedInvite.text}</Typography>
            <Identification
              id={receivedInvite.peerid}
              avatar=""
              name={receivedInvite.text}
              status={senderOnline || false}
            />
            <DialogContentText>
              <Button variant="contained" fullWidth onClick={handleAcceptContact}>
                CONNECT
              </Button>
            </DialogContentText>

            <DialogContentText>{isOnlineDesc()}</DialogContentText>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
