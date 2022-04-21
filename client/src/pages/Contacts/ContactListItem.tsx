import { IContact } from 'Database/Database';
import React from 'react';

interface ContactListItemProps {
  contact: IContact;
}

interface ContactListItemState {
  contact: string;
}

class ContactListItem extends React.Component<ContactListItemProps, ContactListItemState> {
  state = { contact: '' };
  render() {
    return <div>{this.state.contact}</div>;
  }
}

export default ContactListItem;
