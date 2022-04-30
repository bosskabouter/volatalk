import { IContact } from 'Database/Database';

import { PeerContext } from 'providers/PeerProvider';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { useContext, useEffect, useState } from 'react';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';

const ContactList = () => {
  const db = useContext(DatabaseContext);
  const peerManager = useContext(PeerContext);
  const [contactList, setContactList] = useState<IContact[]>();

  useEffect(() => {
    if (db !== null) {
      db.contacts.toArray().then((cts) => {
        setContactList(cts);
        cts.forEach((contact) => {
          peerManager?.initiateConnection(contact);
        });
      });
    }
  }, [db, peerManager]);

  return (
    <div>
      <ul>
        {contactList &&
          contactList.map((contact) => (
            <li key={contact.peerid}>
              <Badge
                color={peerManager?.isConnectedWith(contact) ? 'success' : 'default'}
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
              >
                <Avatar
                  src={`data:image/svg+xml;utf8,${contact.peerid}`}
                  alt={`${contact.nickname} 's personsal identification icon`}
                ></Avatar>
              </Badge>

              <Avatar src={contact.avatar}></Avatar>
              {contact.nickname}
            </li>
          ))}
      </ul>
    </div>
  );
};
export default ContactList;
