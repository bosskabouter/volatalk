# VolaTALK - Direct Messenger

> Nothing as volatile as the human thought. Thank the universe.

VolaTALK enables users to communicate direcly and privately. It aims not to be dependent on any one specific server or service for its basic functionality. When a service is used it should know as little as possible about the sending or receiving client and the content being sent.

> "I will always turn towards someone now I know where that person stands"

## Table of Contents

- [VolaTALK - Introduction](#volatalk---direct-messenger)
- [Table of Contents](#table-of-contents)
- [Screenshots](#screenshots)
- [Technical Implementation](#technical-implementation)
- [Peer-to-Peer](#peer-to-peer)
- [Peer ID](#peer-id)
- [VolaTALK Client](#volatalk-client)
- [Registration](#registration)
- [GeoLocation](#geolocation)
- [Push notifications](#push-notifications)
- [An invitation](#an-invitation)
- [Connection request](#connection-request)
- [Connection Acceptance](#connection-acceptance)
- [VolaTALK Server](#volatalk-server)

### Screenshots

<img src="https://github.com/bosskabouter/volatalk/blob/44db4f7c438258ccbdd35e5c5f30f3b07b4df637/client/public/screenshots/Messages.png" size="70%"/>

<img src="https://github.com/bosskabouter/volatalk/blob/44db4f7c438258ccbdd35e5c5f30f3b07b4df637/client/public/screenshots/contacts.png" size="50%"/>

## Technical Implementation

### Peer-to-Peer

Once a Peer found another Peer, no other servers are needed for their communication, by using WebRTC sockets between the two parties.

In order to find each other, peers register on a single PeerJS (https://peerjs.com/) signalling server, like the one they offer https://0.peerjs.com/.

The default Signalling server used is available on https://peer.pm:999. Currently the client does not allow the user to choose between available signalling servers. See VolaTALK Server for more information.

#### Peer ID

    A VolaTALK peer identifies by sending the Base58 encoded public key exponent of the ECDSA SHA-384 JSON WebKey as requested peerid.

    The private key is stored in a Dexie encrypted IndexedDB.

    Public keys, or Peer IDs, are shared between users by 'copy-and-paste' invites. The application includes a QR generator and reader to facilicate the exchange of trusted invites.

    TODO: Create a Mnemonic BIP39 private key (12 word recovery phrase) and display in Account Setup for easy account recovery. Contacts or messages wont be recovered but once a contact comes back online his address will reveal again and connection can be reestablished. This requires an overhaul of CryptoService.

### VolaTALK Client

A Progressive Web App as reference of the VolaTALK protocol, bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app) using the the `pwa-starter` template.

An Angular version is coming soon.

#### Registration

A user can register by simply accepting Anonymous as his nickname. A default avatar (thank http://thispersondosnotexist.com) is loaded but will appear for every contact differently (no cors - no fetch).

Optionally a user can save a base64 encoded image into his profile. The picture is downsized because it is part of the connection metadata. An even smaller thumbnail is saved due to push notification message limit size (~4k)

##### GeoLocation

The application permits the followMe functionality. Users who both opt-in are able to see their estimated physical location, distance and bearing, alongside local and remote weather conditions (thanks https://openweathermap.org/). By having several contacts using this feature the request information send to this service will render useless for identification/location tracking purposes. A future version allows this visibility to certain contacts only.

#### Push notifications

Allows users to receive messages through Push notification API of the browser. The Push subscription registered in the service worker is saved in user's profile and send out to accepted contacts. A contact, trying to send a message while user is offline, will send user's subscription to the Push Server together with a payload. The payload is the message encrypted with the public key of the receiver. The push server does not know the ID of the receiver so cannot decrypt. It just received a URL (subscription endpoint) to resend the encrypted payload to.

For the client to unencrypt the message it uses his own peerid as secret key. Not so secret, but since the Push Server does not know who is the receiver he cannot decrypt the message. The Browser Push Provider does not know users peerid so they cannot decypher either.

TODO: encrypt endpoint with a secret shared between the user and the pushserver (possibly using the same connection token for PeerServer extension). Other contacts do not need to know my endpoint, just give them a cypher which the pushserver knows how to handle.

#### An invitation

The URL inside the QR code contains;

1. The Peer ID of the invitor
2. An additional invitation text
3. The signature based on (1 + 2), signed with invitor's private key

This prevents others from inviting for me, only a user can create a signed invite from his account. Others could however resend an invitation the user sent out earlier.

TODO: Rethink invite idea. Why not share pubids directly. You can always block someone.

#### Connection request

When a client connects to someone else, he sends a signature in the metadata of this connection. This signature contains the peerid of the receiver and is signed with the requester's private key. The receiver verifies if the signature was signed using the requester's public key before accepting the connection.

### Connection Acceptance

As long as the contact is not accepted, or declined later on, no connection will be permitted. Once a connection is permitted, all up-to-date user metadata `IContactResume` is syncronized between the two contacts and data can be send and A/V calls established.

## VolaTALK Server

VolaTALK Server runs on NodeJS and three main packages deliver the basic services needed for VolaTALK clients;

1. a static https Express Server with spdy, cors and compression capabilities. The Client PWA should be installable from any location, no reference to any static content on https://volatalk.org.
2. a PeerJS server instance (currently https://peer.pm:999). VolaTALK's PeerServer will extend the default PeerServer to guarantee authenticity of the connected clients by validating a signature in the connection token. Not yet immplemented. Depends on BIP39 key.
3. Web-PUSH (currently https://peered.me:432/push) API responding to posts for push messages. Push Payload is encrypted by the sender and can only be decoded by receiver. Neither this Push Server nor the Browser Notification provider are able to read this content. Large request header sizes are refused due to push limit size (~4k). Push request post contains an object only containing the stringified subscription endpoint and the encrypted payload. The server then unwraps the endpoint to pass the payload on to WebPush API. TODO possibly create a VAPI keypair for each client subscription, so that... why really?

https://github.com/web-push-libs/web-push

## License

This project is licensed under the MIT License.
