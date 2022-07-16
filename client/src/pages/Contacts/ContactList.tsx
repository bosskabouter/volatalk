import { ReactNode } from 'react';
import { List } from '@mui/material';
import { ContactListItem } from './ContactListItem';
import { IContact } from 'types';

/**

 *
 * @returns List will all contacts. Enables the user to accept or decline, make a call and enter the messages page from a clicked contact.
 */
const ContactList = ({
  contacts,
  subHeader,
}: {
  contacts: IContact[] | undefined;
  subHeader: ReactNode;
}) => {
  return contacts && contacts?.length > 0 ? (
    <div>
      <List
        sx={{
          //pt: '5rem',
          //height: 1,
          // bgcolor: 'primary',
          //  position: 'relative',
          // overflow: 'scroll',
          //maxHeight: 1,
          '& ul': { padding: 0 },
        }}
        dense={true}
        subheader={subHeader}
      >
        {contacts?.map((contact) => {
          return <ContactListItem contact={contact} key={contact.peerid} />;
        })}
      </List>
    </div>
  ) : (
    <></>
  );
};

export default ContactList;
