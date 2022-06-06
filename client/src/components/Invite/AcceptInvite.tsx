/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { useContext, useEffect, useState } from 'react';
import { Button, Dialog, Typography, DialogContent, DialogContentText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DatabaseContext } from '../../providers/DatabaseProvider';
import { UserContext } from '../../providers/UserProvider';
import { IInvite } from '../../types';
import { PeerContext } from '../../providers/PeerProvider';
import { extractInvite } from '../../services/InvitationService';
import { Alerter } from '../StatusDisplay/Alerter';
import { genSignature } from '../../services/Crypto';
import Identification from 'components/Identification/Identification';

export default function AcceptInvite(props: { invite: string }) {
  //recover invite from local storage hack
  localStorage.removeItem('invite');

  const [senderOnline, setSenderOnline] = useState<boolean | null>(null);
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

          if (await db.contacts.get(invite.peerid)) {
            setResult(`Invite already accepted.. Still waiting to connect... `);
          } else if (invite.peerid === userCtx.user.peerid) {
            setResult('Inviting yourself?');
          }
        } else {
          setResult('Invalid invitation');
        }
      });
    } else if (receivedInvite && senderOnline === null) {
      setSenderOnline(false);
      // we just entered the page from url. wait for our own peer to connect
      const timeout = 1000;
      setTimeout(async () => {
        const isOnline = await peerCtx.isPeerOnline(receivedInvite.peerid);
        setSenderOnline(isOnline);
      }, timeout);
    }
  }, [db, peerCtx, props.invite, receivedInvite, result, senderOnline, userCtx]);

  //handler
  const handleAcceptContact = async () => {
    if (!(db && receivedInvite && peerCtx)) return;

    let contact = await db.contacts.get(receivedInvite.peerid);
    if (contact) {
      setResult(`Invite already accepted.. Still waiting to connect... `);
    } else {
      const sig = await genSignature(receivedInvite.peerid, userCtx.user.security.privateKey);
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
    else if (senderOnline) return 'The person Invitator is online right now!';
    else
      return 'The person who sent the invitation appears to be offline right now. Go ahead and save the new contact for now. Once the other person accepts your connection, you will get notified!';
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
        <Dialog open css={styles.AcceptInviteStyle}>
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
