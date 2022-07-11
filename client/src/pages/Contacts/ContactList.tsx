import { ReactNode, useContext, useEffect, useState } from 'react';
import { Button, IconButton, List, ListSubheader, Typography } from '@mui/material';
import { Box } from '@mui/system';

import { useNavigate } from 'react-router-dom';
import NewContactRequestsIcon from '@mui/icons-material/AccessibilityNew';
import FavoritesOnlyContactIcon from '@mui/icons-material/StarBorderPurple500';
import FavoritesNotOnlyContactIcon from '@mui/icons-material/Star';
import { PeerContext } from '../../providers/PeerProvider';
import { IContact, IContactClass } from '../../types';
import { ContactListItem } from './ContactListItem';
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
