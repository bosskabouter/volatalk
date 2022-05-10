import { AppDatabase } from 'Database/Database';
import { IConnectionMetadata, IContact, IInvite, IUserProfile } from 'types';
import { importPrivateKey, signMessage } from './Crypto';

export class ContactService {
  _db: AppDatabase;
  _user: IUserProfile;
  constructor(user: IUserProfile, db: AppDatabase) {
    this._db = db;
    this._user = user;
  }

  async acceptContact(c: IContact) {
    c.accepted = true;
    await this._db.contacts.put(c);
  }

  /**
   * Save the connection from metadata and emit 'newContactRequest' to notify about the new contact request.
   */
  async registerContactForAproval(peerId: string, md: IConnectionMetadata) {
    //create signature for contact
    const sig = await this._genSignature(peerId);

    const contact: IContact = {
      peerid: peerId,
      signature: sig,
      nickname: md.nickname,
      avatar: md.avatar,
      dateCreated: new Date(),
      accepted: false,
      declined: false,
    };
    await this._db.contacts.add(contact);
    //close for now and reestablish a connection once we approve
    return contact;
  }
  async acceptInvite(invite: IInvite) {
    const sig = await this._genSignature(invite.peerId);

    const contact = {
      nickname: invite.text,
      peerid: invite.peerId,
      dateCreated: new Date(),
      accepted: true,
      signature: sig,
    };
    this._db.contacts.put(contact);
    return contact;
  }

  _genSignature(peerid: string) {
    return importPrivateKey(JSON.parse(this._user.privateKey)).then((privKey) => {
      return signMessage(peerid, privKey);
    });
  }
}
