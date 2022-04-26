import { IContact } from 'Database/Database';
import Avatar from '@mui/material/Avatar';
import { DatabaseContext } from 'providers/DatabaseProvider';
import React, { useContext, useState } from 'react';

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
              <Avatar src="{contact.avatar}"></Avatar>
              {contact.nickname}
            </li>
          ))}
      </ul>
    </div>
  );
};
export default ContactList;
