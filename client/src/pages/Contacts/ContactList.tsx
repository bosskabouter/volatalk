import { render } from '@testing-library/react';
import { IContact } from 'Database/Database';
import { DatabaseContext } from 'providers/DatabaseProvider';
import React, { useContext } from 'react';

interface ContactListState {
  contacts: Array<IContact>;
}

const ContactList = () => {
  const db = useContext(DatabaseContext);

  if (db !== null) {
    const contactList =
      db.contacts.count.length > 1 ? (
        db.contacts.each((contact) => {
          return <li key={contact.peerid}> {contact.nickname}</li>;
        })
      ) : (
        <li>No Contacts</li>
      );
    return (
      <div>
        <ol>{contactList}</ol>
      </div>
    );
  }
  return <></>;
};

export default ContactList;
