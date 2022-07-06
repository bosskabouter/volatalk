<img src="https://github.com/bosskabouter/volatalk/blob/162accd60808545d7a7227e8fe3f8b2e47a49477/logo/volatalk-logo-color-v1.png" width="180px"/>

# VolaTALK - Direct Private Messenger

> 'Nothing as volatile as the human thought. Thank the universe.'

VolaTALK enables private and direct communication. It aims to be independent of any one specific server for its basic functionality. When a service is used, it should know as little as possible about the sending or receiving client and the content being sent.



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
- [Future Versions](#future-versions)

### Screenshots

<img src="https://github.com/bosskabouter/volatalk/blob/44db4f7c438258ccbdd35e5c5f30f3b07b4df637/client/public/screenshots/Messages.png" width="50%"/>

> "From now on I will always face towards someone now I know where that person is...
> ...and don't need to ask about the weather either..."

<img src="https://github.com/bosskabouter/volatalk/blob/44db4f7c438258ccbdd35e5c5f30f3b07b4df637/client/public/screenshots/contacts.png" width="50%"/>

## Technical Implementation

VolaTALK describes a way for browsers to establish a trusted connection while not relying on a single centralized server.

### Peer-to-Peer

Once a Peer found another Peer, no other services are needed for their communication during the existence of their WebRTC session.

In order to find each other and establish these sessions, peers register on a [WebRTC Signaling server, or Peer Server] (https://webrtc.org/). PeerJS (https://peerjs.com/) is a reference implementation and can be installed anywhere. They also offer a public [default instance](https://0.peerjs.com/).

#### Peer ID

A VolaTALK peer registers to a Signaling server with a Base58 encoded public key exponent of the ECDSA SHA-384 JSON WebKey.

Peer IDs are shared between users in 'copy-and-paste' invites. The application includes a QR generator and reader to facilitate the exchange of trusted invites.

The private key is stored in a Dexie encrypted IndexedDB.

### VolaTALK Client

A Progressive Web App as reference of the VolaTALK protocol, bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app) using the the `pwa-starter` template.

Future Feature: An Angular reference implementation, possibly trying out cloud storage https://Back4App.com.

#### Registration

A user can register by simply accepting 'Anonymous' as its nickname. A default avatar (thanks http://thispersondosnotexist.com) is loaded but will appear for every contact differently (no CORS - no fetch).

A user can save a base64 encoded image into his profile. The picture is downsized because it is send within the connection metadata on every connection request.

##### Geo-location

The application permits "Follow Me" functionality. Users who both opt-in are able to see their own and other's estimated physical location, distance and bearing from each other, alongside local and remote weather conditions (thanks https://openweathermap.org/). By having several contacts using this feature the request information send to this service will render useless for identification of location tracking purposes.

#### Push notifications

Users can receive messages through the Push notification API of the browser. The Push subscription registered in the service worker is saved not on the Push Server (as usual), but in the user's profile and send out only to accepted contacts. A contact, trying to send a message while a user is offline, will send the user's subscription to the Push Server together with an encrypted payload. The push server does not know the ID of the receiver so cannot decrypt with the 'secret' Peer ID. It just received a URL (subscription endpoint) to resend the encrypted payload to.

Drawing here

The client uses it's own peer ID as secret key to decrypt any message it receives through push notifications. Not so secret, but since the Push Server does not know who is the receiver (only who is the sender) it cannot decrypt the message. The Browser's Push Provider does not know the user's Peer ID so they cannot decipher either.

#### Invitation

Users can invite others by sharing an invitation. This invite is a URL pointing to the origin of the location where the sender installed the PWA from (https://volatalk.org), concatenated (?) with the following parameters;

    1. The Peer ID of the sender (f)
    2. An additional invitation text (k)
    3. [1 + 2] signed with sender’s private key (s)

A signed invitation prevents people from creating invites in name of someone else. Only the user can create a signed invite. Others can however resend an invitation the user sent out earlier, or try to establish a connection to an otherwise known Peer ID.

    Future Feature: ShContacts should not need to know the user's endpoint, just give a cipher which the push server knows how to handle.are Peer ID directly. You can always block someone.

The application permits transmission of the invite through QR.

#### Connection request

When a peer requests a connection to another peer, a signature is sent in the connection metadata, containing Peer ID of the receiver and is signed with the private key of the requester. The receiver uses the requester Peer ID to verify the signature before the connection is accepted.

### Connection Acceptance

As long as the contact is not accepted, or declined later on, no connection will be permitted. Once a connection is permitted, all up-to-date user metadata `IContactResume` is synchronized between the two contacts and data can be send and A/V calls established.

## VolaTALK Server

VolaTALK Server runs on NodeJS and three main packages deliver basic services needed for VolaTALK clients;

1. a static HTTPS Express Server with SPDY, Cors and compression capabilities. The Client PWA can be installed from any location, no reference to static content on https://volatalk.org.
2. a PeerJS server instance (https://peer.pm:999). VolaTALK's Peer Server will extend the default Peer Server to guarantee authenticity of the connected clients by validating a signature in the connection token. Not yet implemented. Depends on BIP39 key.
3. a Web-PUSH API responding to posts for push messages (https://peered.me:432/push). Push Payload is encrypted by the sender and can only be decoded by receiver. Neither this Push Server nor the Browser Notification provider (endpoint) are able to read this content. Requests with too large `content-length` in their post request header (max 4Kb.) receive `HTTP status 507`. The body of the request contains the subscription endpoint and the encrypted payload. The server passes the endpoint and the payload on to the Web-Push API (https://github.com/web-push-libs/web-push).

## Future versions

### Recovery phrase

Create a Mnemonic BIP39 private key (12 word recovery phrase) and display in Account Setup to enable the user to recover his account in case the storage was wiped or device was lost.

Contacts and messages would not be recovered with just the mnemonics, but once a contact comes back online and tries to contact user, his address will be restored and connection can be reestablished. That's like writing down your phone on a paper and being able to receive calls anywhere you are (with connected browser and the paper).

### Dynamic Signaling

The client currently uses one static [VolaTALK Peer Server](https://peer.pm:999).
To obtain the main objective of the project it is vitally import to be able to handle multi-signaling servers.

The Client will choose automatically (and randomly) from a pool of available Peer Servers registered in the application.

It maintains a 'sticky' relation with that Server during his subscription to VolaTALK, or untill further notice.

This preferred instance is sent out in connection metadata with other contacts.

The user could choose a preferred server or add their own private instance.

#### Account Hijacking

A default PeerJS Signaling Server accepts any base58 endoded id, as long as it is not taken already by another peer.

If that currently happens, the hijacker wouldn't be able to establish a connection with any volatalk client since they require valid signature during handshake. But they could occupy the spot of the real owner of this address.

#### Prevent occupied ID

VolaTALK Peer Servers with Hijacking protection [VolaTALK Server](#volatalk-server) are indicated with a lock and are marked as preferred inside this pool.

A user trying to find his contact will first try at the preferred server of that contact, but will try other instances if this fails. Once an session with the contact is established, the connection with that Peer Server is eliminated, but the session with the client remains. This could potentially resolve (partly) the scalability issue with PeerJS. Much like walking down a hallway looking in every room for your contact. Once you found the contact, establish 'the session' and leave the hallway.

When the client decides to change his preferred signaling server instance (the room), new connection metadata is sent out to all its contacts containing the new sticky relation with the newly chosen Peer Server.
This process could be triggered automatically at set intervals, or when response times for establishing connections degrade.

If a contact is not online nor pushed at given moment to be informed about the change, this contact will not be able to find the user at its old preferred signaling server. In that case the contact continues looking on other signaling servers, or wait until the user comes back online and contacts him.

### Encrypt Push Subscription

Currenly Push Subscription endpoints are shared openly between contacts. A future version should encrypt this endpoint so that only the Push Server can decrypt it once it is sent by one of his contacts.

### Allows Geo visibility to certain contacts only.

### Personal VAPID Key:

Create a VAPID key pair for each client subscription, so that VAPID public key isn't a global static and pertains only to the given client. This Vapid key pair should however be generated on the Push Server, so clients registering for push notifications should request their VAPID key pair from this server.

## License

This project is licensed under the MIT License.
