import { AppDatabase } from 'Database/Database';
import { IContact } from 'types';
import { IInvite } from './InvitationService';
import { PeerManager } from './PeerManager';

export class ContactService {
  db: AppDatabase;
  peerManager: PeerManager;
  constructor(db: AppDatabase, peerManager: PeerManager) {
    this.db = db;
    this.peerManager = peerManager;
  }

  async acceptContact(c: IContact) {
    c.accepted = true;
    await this.db.contacts.put(c);
  }

  async acceptInvite(invite: IInvite) {
    const sig = await this.peerManager.genSignature(invite.peerId);

    const contact = {
      nickname: invite.text,
      peerid: invite.peerId,
      dateCreated: new Date(),
      accepted: true,
      signature: sig,
    };
    contact.signature = sig;
    contact.accepted = true;
    await this.db.contacts.put(contact);
    this.peerManager.checkConnection(contact);
    return contact;
  }
}
