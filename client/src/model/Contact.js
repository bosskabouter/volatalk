import { loadContact, persistContact, queryContacts } from "../modules/DB";
import { PeerPMConnectionsManager } from "./peer";


/**
 */
class Contact {
  peerid;
  signature;
  userInfo;
  dateCreated;
  dateResponded;

  accepted;
  declined;

  constructor(peerid) {
    this.peerid = peerid;
    this.dateCreated = new Date();
  }
}

function checkContacts() {
  let contacts = queryContacts();

  for (let contact of contacts) {
    if (!contact.declined) PeerPMConnectionsManager.checkConnection(contact);
  }
}

/**
 */
async function sendContactRequest(otherPeerId, invitationText) {
  let contact = await loadContact(otherPeerId);

  if (!contact || PeerPMConnectionsManager.isConnectedWith(contact)) {
    return;
  }

  PeerPMConnectionsManager.genSignature(otherPeerId).then((signature) => {
    contact = new Contact(otherPeerId);
    //temporary identification for contact without userinfo
    contact.userInfo = { nickname: invitationText };
    contact.signature = signature;
    contact.accepted = new Date();
    persistContact(contact);
    PeerPMConnectionsManager.checkConnection(contact);
    console.debug("Waiting for new contact to accept your connection...");
  });
}

function declineContact(contact) {
  contact.declined = new Date();
  persistContact(contact);
  PeerPMConnectionsManager.disconnectFrom(contact);
}

function acceptNewContact(contact) {
  console.log("Accepting New contact: " + contact.nickname, contact);
  PeerPMConnectionsManager.genSignature(contact.peerid).then((signature) => {
    contact.signature = signature;
    contact.accepted = new Date();
    contact.declined = null;
    contact.dateResponded = new Date();
    persistContact(contact);
    //initiate new connection, sending over our newly generated key in metadata as usual.
    PeerPMConnectionsManager.initiateConnection(contact);
  });
}

export {
  Contact,
  checkContacts,
  sendContactRequest,
  acceptNewContact,
  declineContact,
};
