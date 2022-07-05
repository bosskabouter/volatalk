## VolaTALK - Direct Messenger

> Nothing as volatile as the human thought.

VolaTALK enables users to communicate direcly and privately. It aims not to be dependent on any one specific server or service for its basic functionality. When a service is used it should know as little as possible about the sending or receiving client and the content being sent. 

> "I will always turn towards someone now I know where that person stands!" 

## Table of Contents

- [VolaTALK - Introduction](#VolaTALK---Encrypted-peer-to-peer-Messenger-PWA)
- [Table of Contents](#table-of-contents)
- [VolaTALK Client - React](#VolaTALK-Client---React)
- [VolaTALK Server - NodeJS provided Generic Services](#volatalk-server---node-provided-generic-services)

## Technical Implementation

### VolaTALK Client - React PWA

This is a reference implementation of the VolaTALK protocol.

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app) using the `pwa-starter` template.


#### Peer-to-Peer
Once a Peer found another Peer, no other servers are needed for their communication, by using WebRTC sockets between the two parties. 

In order to find each other, they need to register on a single peerjs signalling server, like their own https://0.peerjs.com/

A VolaTALK peer identifies by sending the Base58 encoded public key exponent of the ECDSA SHA-384 JSON WebKey as requested peerid.

The private key is stored in a Dexie encrypted IndexedDB.

Public keys, or peerIds, are shared between users by 'copy-and-paste' invites. The application includes a QR generator and reader to facilicate trusted invites. 

Currently the client does not allow the user to choose between available signalling servers. See future wishlist.

#### An invitation
The URL inside the QR code contains;

1. The public peerid of the invitor
2. An additional invitation text 
3. The signature based on (1 + 2), signed with invitor's private key

#### Connection request
When a client connects to someone else, he sends a signature in the metadata of this connection. This signature contains the peerid of the receiver and is signed with the requester's private key. The receiver verifies if the signature was signed using the requester's public key before accepting the connection.

### Connection Acceptance
As long as the contact was not accepted yet, or declined later on, no connection will be permitted. Once the connection is established, all up-to-date user metadata `IContactResume` is syncronized between the two contacts and data can be send and A/V calls established. 

### VolaTALK Server - Node provided Generic Services

VolaTALK Server delivers the following services to VolaTALK client

1. a static https Express Server with spdy, cors and compression capabilities. The Client PWA should be installable from any location however. There should be no reference to any static content on https:///volatalk.org. 
2. a standard PeerJS server. VolaTALK's PeerJS will also guarantee (TODO) authenticity of the connected clients by validating the signature in the connect token. Currently used Peer instance is available on https://peer.pm:999 See VolaTALK Server for more information.
3. WebPUSH API responding to posts for push messages. Push Payload is encrypted by the sender and can only be decoded by receiver. Neither this Push Server nor the Browser Notification provider are able to read this content. 

### Screenshots
<img src="https://github.com/bosskabouter/volatalk/blob/44db4f7c438258ccbdd35e5c5f30f3b07b4df637/client/public/screenshots/Messages.png"/>

<img src="https://github.com/bosskabouter/volatalk/blob/44db4f7c438258ccbdd35e5c5f30f3b07b4df637/client/public/screenshots/contacts.png"/>
## License

This project is licensed under the MIT License.
