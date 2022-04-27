import { IContact } from 'Database/Database';

import { DatabaseContext } from 'providers/DatabaseProvider';
import { useContext, useState } from 'react';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';

const ContactList = () => {
  const db = useContext(DatabaseContext);
  const [contactList, setContactList] = useState<IContact[]>();

  if (db !== null) {
    db.contacts.toArray().then((cts) => {
      setContactList(cts);
    });
  }

  return (
    <div>
      <ul>
        {contactList &&
          contactList.map((contact) => (
            <li key={contact.peerid}>
              <Badge
                color="info"
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
