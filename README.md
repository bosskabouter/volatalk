<img src="https://github.com/bosskabouter/volatalk/blob/162accd60808545d7a7227e8fe3f8b2e47a49477/logo/volatalk-logo-color-v1.png" width="180px"/>

# VolaTALK - Direct Private Messenger

> 'Nothing as volatile as human thoughts'

VolaTALK enables private and direct communication. It aims to be independent of any one specific server for its basic functionality. When a service is used, it should know as little as possible about the sending or receiving client and the content being sent.

> "I will always face towards someone when we communicate, now I know where that person stands..."

## Table of Contents

- [VolaTALK - Introduction](#volatalk---direct-messenger)
- [Table of Contents](#table-of-contents)
- [Screenshots](#screenshots)
- [Technical Implementation](#technical-implementation)
- [Peer-to-Peer](#peer-to-peer)
- [Peer ID](#peer-id)
- [VolaTALK Client](#volatalk-client)
- [Registration](#registration)
- [Geo-location](#geo-location)
- [Push notifications](#push-notifications)
- [Invitation](#invitation)
- [Connection request](#connection-request)
- [Connection Acceptance](#connection-acceptance)
- [VolaTALK Server](#volatalk-server)

### Screenshots

<img src="https://github.com/bosskabouter/volatalk/blob/44db4f7c438258ccbdd35e5c5f30f3b07b4df637/client/public/screenshots/Messages.png" width="50%"/>

<img src="https://github.com/bosskabouter/volatalk/blob/44db4f7c438258ccbdd35e5c5f30f3b07b4df637/client/public/screenshots/contacts.png" width="50%"/>

## Technical Implementation

VolaTALK describes a way for browsers to establish a trusted connection between peer-to-peer clients while not relying on a single server for it's main function.

### Peer-to-Peer

Once a Peer found another Peer, no other servers are needed for their communication during the existence of their WebRTC session.

In order to find each other and establish these sessions, peers register on a [WebRTC Signaling server](https://webrtc.org/). PeerJS (https://peerjs.com/) is a reference implementation server and can be installed anywhere. They also offer the default instance https://0.peerjs.com/.

The Signaling server used in VolaTALK client is available on https://peer.pm:999. Currently the client does not allow the user to choose between available signaling servers. See [VolaTALK Server](#volatalk-server) for more information.

#### Peer ID

A VolaTALK peer registers to a Signaling server with a Base58 encoded public key exponent of the ECDSA SHA-384 JSON WebKey.

Peer IDs are shared between users in 'copy-and-paste' invites. The application includes a QR generator and reader to facilitate the exchange of trusted invites.

The private key is stored in a Dexie encrypted IndexedDB.

TODO: Create a Mnemonic BIP39 private key (12 word recovery phrase) and display in Account Setup for easy account recovery. Contacts or messages would not be recovered but once a contact comes back online his address will reveal again and connection can be reestablished. That's like a recoverable phone number.

### VolaTALK Client

A Progressive Web App as reference of the VolaTALK protocol, bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app) using the the `pwa-starter` template.

TODO: An Angular reference implementation, possibly trying out cloud storage https://Back4App.com.

#### Registration

A user can register by simply accepting Anonymous as its nickname. A default avatar (thanks http://thispersondosnotexist.com) is loaded but will appear for every contact differently (no CORS - no fetch).

A user can save a base64 encoded image into his profile. The picture is downsized because it is send on very connection request within the connection metadata.

##### Geo-location

The application permits "Follow Me" functionality. Users who both opt-in are able to see their own and other's estimated physical location, distance and bearing from each other, alongside local and remote weather conditions (thanks https://openweathermap.org/). By having several contacts using this feature the request information send to this service will render useless for identification/location tracking purposes. 
TODO: A future version allows this visibility to certain contacts only.

#### Push notifications

Allows users to receive messages through Push notification API of the browser. The Push subscription registered in the service worker is saved in user's profile and send out to accepted contacts. A contact, trying to send a message while user is offline, will send user's subscription to the Push Server together with a payload. The payload is the message encrypted with the public key of the receiver. The push server does not know the ID of the receiver so cannot decrypt. It just received a URL (subscription endpoint) to resend the encrypted payload to.

TODO: Drawing here

The client uses it's own peer ID as secret key to unencrypt any message it receives through push notifications. Not so secret, but since the Push Server does not know who is the receiver (only who is the sender) it cannot decrypt the message. The Browser's Push Provider does not know the user's peerid so they cannot decypher either.

TODO: encrypt user's subscription endpoint with a secret shared only between the user and the pushserver responsible for sending the push request (possibly using the same connection token for PeerServer authentication). Other contacts do not need to know the user's endpoint, just give them a cypher which the pushserver knows how to handle.

#### Invitation

Users can invite others by sharing an invitation. This invite is a URL pointing to the origin of the location where the sender installed the PWA from (https://volatalk.org), concatenated (?) with the following parameters;

1. f - The Peer ID of the sender
2. k - An additional invitation text
3. s - The signature based on (1 + 2), signed with sender’s private key

A signed invitation prevents people from creating invites in name of someone else. Only the user can create a signed invite. Others can however resend an invitation the user sent out earlier, or try to establish a connection to an otherwise known Peer ID.

The URL can be shown and read with the QR Show/Read functionality.

TODO: Rethink invite idea. Why not share Peer ID directly. You can always block someone.

#### Connection request

When a peer requests a connection to another peer, a signature is sent in the connection metadata, containing Peer ID of the receiver and is signed with the private key of the requester. The receiver uses the requester Peer ID to verify the signature before the connection is accepted.

### Connection Acceptance

As long as the contact is not accepted, or declined later on, no connection will be permitted. Once a connection is permitted, all up-to-date user metadata `IContactResume` is syncronized between the two contacts and data can be send and A/V calls established.

## VolaTALK Server

VolaTALK Server runs on NodeJS and three main packages deliver basic services needed for VolaTALK clients;

1. a static HTTPS Express Server with SPDY, Cors and compression capabilities. The Client PWA can be installed from any location, no reference to static content on https://volatalk.org.
2. a PeerJS server instance (https://peer.pm:999). VolaTALK's PeerServer will extend the default PeerServer to guarantee authenticity of the connected clients by validating a signature in the connection token. Not yet implemented. Depends on BIP39 key.
3. a Web-PUSH API responding to posts for push messages (https://peered.me:432/push). Push Payload is encrypted by the sender and can only be decoded by receiver. Neither this Push Server nor the Browser Notification provider (endpoint) are able to read this content. Requests with too large `content-length` in their post request header (max 4Kb.) receive `HTTP status 507`. The body of the request contains the subscription endpoint and the encrypted payload. The server passes the endpoint and the payload on to the WebPush API (https://github.com/web-push-libs/web-push).

TODO: Investigate possibility create a VAPI keypair for each client subscription, so that VAPID public key isn't a global static and pertains only to the given client. This Vapid Keypair should however be generated on the Push Server, so clients registering for push notifications should request their Vapid Key pair from the Server.

## License

This project is licensed under the MIT License.

