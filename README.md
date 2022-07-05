## VolaTALK - Direct Messenger

> Nothing as volatile as the human thought. Thank the universe.

VolaTALK enables users to communicate direcly through Peer-to-Peer and WebRTC. It aims not to be dependent on any one specific server or service for its basic functionality. When a service is used it should know as little as possible about the sending or receiving client or the content being sent. 

> "I will never talk with my back to someone anymore now I know where he stands!" 

## Table of Contents

- [VolaTALK - Introduction](#VolaTALK---Encrypted-peer-to-peer-Messenger-PWA)
- [Table of Contents](#table-of-contents)
- [VolaTALK Client - React](#VolaTALK-Client---React)
- [VolaTALK Server - NodeJS provided Generic Services](#volatalk-server---node-provided-generic-services)

### VolaTALK Client - React PWA

This is a reference implementation of the VolaTALK protocol.

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app) using the `pwa-starter` template.

Clients connects to a(ny) `PeerJS-server`, identifying themselves by their Base58 encoded public key exponent of the ECDSA SHA-384 JSON WebKey.
The private key is stored in a Dexie encrypted IndexedDB.
Public keys, or peerIds, are shared between users by 'copy-and-paste' invites. The application includes a QR generator and reader to facilicate trusted invites. 

#### An invitation
The URL inside the QR code contains;

1. The public peerid of the invitor
2. An additional invitation text 
3. The signature based on (1 + 2), signed with invitor's private key

#### Connection request
When a client connects to someone else, he sends a signature in the metadata of this connection. This signature contains the peerid of the receiver and is signed with the requester's private key. The receiver verifies if the signature was really signed using the requester's public key before accepting.

### Connection Acceptance
As long as the contact was not accepted yet, or declined, no connection will be permitted.  


### VolaTALK Server - Node provided Generic Services

VolaTALK Server delivers the following services to VolaTALK client

1. a static https Express Server with spdy, cors and compression capabilities. The Client PWA should be installable from any location however. 
2. a PeerJS server. VolaTALK's PeerJS will also guarantee authenticity of the connected clients by validating the signature in the connect token. See VolaTALK Server for more information.
3. WebPUSH API responding to posts for push messages. Push Payload is encrypted by the sender and can only be decoded by receiver. Neither this Push Server nor the Browser Notification provider are able to read this content. 



## License

This project is licensed under the MIT License.
