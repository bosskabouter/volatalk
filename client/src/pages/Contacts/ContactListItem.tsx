import { IContact } from 'Database/Database';
import React from 'react';

interface ContactListItemProps {
  contact: IContact;
}

interface ContactListItemState {
  contact: IContact;
}

class ContactListItem extends React.Component<ContactListItemProps, ContactListItemState> {
  
  state = { contact: this.props.contact };
  render() {
    return <div>{this.state.contact}</div>;
  }
}

export default ContactListItem;
