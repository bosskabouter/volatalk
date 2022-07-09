# VolaTALK - Direct Private Messenger

<img src="https://github.com/bosskabouter/volatalk/raw/7ce9898b5a7d81dfe80902c88f9cb1cfa65ac999/client/src/assets/svg/logo-black.svg" style="max-width: 100%;">

## Introduction

### Vision

> Nothing as volatile as the human mind

### Mission

Private and direct communication between trusted browsers, independent of any centralized server.

Services know as little as possible about the sending or receiving client and the information being sent.

### Why

I could not not find a trackerless messenger I could fully trust, so I wrote my own.

### What's different

Communicate directly in your browser with other contacts, without centralized servers capturing your data or native applications running in your system.

### Peer-to-peer

VolaTALK uses [WebRTC] data channels (https://webrtc.org/) to establish direct peer-to-peer sessions. There are many solutions like these, but none I could find create a long-term trusted relation between contacts.

Anything based on blockchain technologies would not fit the [Vision](#vision) for this purpose.

#### Does anything like this exist?

Open source, free to use, P2P, without trackers, browser based without native applications? ? Please let us know at [ideas@volatalk.org](mailto:ideas@volatalk.org)

## Table of Contents

- [VolaTALK](#volatalk---direct-messenger)
- [Introduction](#introduction)
- [Vision](#vision)
- [Mission](#mission)
- [Why?](#why)
- [What's different](#what-is-different)
- [What's different?](#whats-different)
- [Table of Contents](#table-of-contents)
- [Screenshots](#screenshots)
- [Technical Implementation](#technical-implementation)
- [Peer-to-Peer](#peer-to-peer)
- [Peer ID](#peer-id)
- [VolaTALK Client](#volatalk-client)
- [Registration](#registration)
- [Encrypted Local Storage](#encrypted-local-storage)
- [Geo-location](#geo-location)
- [Push notifications](#push-notifications)
- [Invitation](#invitation)
- [Cotact request](#contact-request)
- [Contact Acceptance](#contact-acceptance)
- [VolaTALK Services](#volatalk-server)
- [Future Versions](#future-versions)

### Screenshots

<img src="https://github.com/bosskabouter/volatalk/blob/44db4f7c438258ccbdd35e5c5f30f3b07b4df637/client/public/screenshots/Messages.png" width="50%"/>

> "From now on I will always face towards someone now I know where that person is...
> ...and don't need to ask about the weather either..."

<img src="https://github.com/bosskabouter/volatalk/blob/44db4f7c438258ccbdd35e5c5f30f3b07b4df637/client/public/screenshots/contacts.png" width="50%"/>

## Technical Implementation

VolaTALK describes a way for browsers to establish a trusted WebRTC connections over Peer-to-Peer while not relying on a single centralized server.

### Peer-to-Peer

Once a peer found another peer, no other services are needed for their communication during the existence of their WebRTC session.

For contacts to find each other and establish a connection, they look for each other at a [PeerJS](https://peerjs.com/) signaling server. These can be installed anywhere and PeerJS offers a public [default instance](https://0.peerjs.com/).

#### Peer ID

A VolaTALK peer identifies itself by registering to a Peer server with a Base58 encoded public key exponent of the ECDSA SHA-384 JSON WebKey.

Peer IDs are shared between users in 'copy-and-paste' invites. The application includes a QR generator and reader to facilitate the exchange of trusted invites.

### VolaTALK Client

A Progressive Web App as reference of the VolaTALK protocol, bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app) using the `pwa-starter` template.

#### Registration

A user can register by simply accepting 'Anonymous' as its nickname. A default avatar ([thanks thispersondoesnotexist](http://thispersondoesnotexist.com)) is loaded but the user can save a base64 encoded image into his profile. The picture is downsized and send out on every connection request.

#### Encrypted Local Storage

The private key is stored in a Dexie encrypted IndexedDB.

The profile can be secured with a 6 digit access pin which can be recovered using 2 security questions.

<img src="https://github.com/bosskabouter/volatalk/blob/6860aafcdd75c00c515598ffa33f1a25967b1a93/client/public/screenshots/AccountSetup.png" width="200px"/>

#### Geo-location

The application permits "Follow Me" functionality. Users who both opt-in are able to see their own and other's estimated physical location, distance and bearing from each other, alongside local and remote weather conditions (thanks [OpenWeatherMap](https://openweathermap.org/)). By having several contacts using this feature the request information send to this service will render useless for tracking purposes.

### Push notifications

Users can receive messages through the [Push notification API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API). The subscription endpoint registered in the browsers service worker is saved not on the Push Server (as usual), but in the user's profile and send out only to accepted contacts and not the push server.

A contact trying to send a message while the user is offline will send the message through the Push Service.

#### Push Server

The Push Server receives post requests containing 2 objects;

1. user's subscription `endpoint`, a URL contained within the subscription while registering the browser's service worker for push notifications within this site context.

2. message `payload` encrypted with the Peer ID of the receiving user. The push server nor the endpoint know this Peer ID.

The receiving client decrypts incoming push messages with its own peer ID as secret key inside the service worker. Using contact's Peer ID within the decrypted message detailed information is pulled from `contactInfo` (synced between [`ServiceWorkerWrapper.tsx`](https://github.com/bosskabouter/volatalk/blob/main/client/src/sw/ServiceWorkerWrapper.tsx) and [`service-worker.ts`](https://github.com/bosskabouter/volatalk/blob/main/client/src/service-worker.ts).

#### Invitation

Users can share signed invites in plain URL or by QR code. This invite points to the origin of the location where the sender installed the PWA from (https://volatalk.org), concatenated with the following parameters;

    a. ?f=[`sender.PeerID`]
    b. &k=[`An additional invitation text`]
    c. &s=[`sign(a+b, sender.privateKey)`]

A signed invitation prevents people from creating invites in name of someone else. Only the user can create a signed invite for his account. Once the invitation is sent, it could be used by N others to connect to user. The user will receive these connection requests and decides if he wishes to connect.

The application permits transmission of the invite through QR scanning, [Web share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) or on desktop by clipboard copy. Other ways of transmission including ultrasonic using [quiet-js](https://github.com/quiet/quiet-js) are being evaluated.

#### Contact request

Every connection with a contact is initiated informing the following metadata:


  `  export interface IContactResume { `
  `    peerid: string;`
  `    dateRegistered: Date;`
  `    nickname: string;`
  `    avatar: string;`
  `    avatarThumb: string;`
  `    position: GeolocationCoordinates | null;`
  `    pushSubscription: PushSubscription | null;`
  `}`

The `IContactResume` is accompanied by a signature: the Peer ID of the receiver signed with the private key of the requester. The receiver uses the requester Peer ID (public key) to verify the signature before the connection is accepted.

#### Contact Acceptance

As long as the contact is not accepted, or declined later on, no connection will be permitted and no metadata is exchanged. Once a connection is permitted, all up-to-date user `IContactResume` is synchronized between the two contacts, data can be send and A/V calls established.

## VolaTALK Server

VolaTALK Server runs on NodeJS and three main packages deliver basic services needed for VolaTALK clients;

1. a static HTTPS Express Server with SPDY, Cors and compression capabilities. The Client PWA can be installed from any location, no reference to static content on https://volatalk.org.
2. a PeerJS server instance (https://peer.pm:999). VolaTALK's Peer Server will extend the default Peer Server to guarantee authenticity of the connected clients by validating a signature in the connection token. Not yet implemented. Depends on BIP39 key.
3. a Web-PUSH API responding to posts for push messages (https://peered.me:432/push). Push Payload is encrypted by the sender and can only be decoded by receiver. Neither this Push Server nor the Browser Notification provider (endpoint) are able to read this content. Requests with too large `content-length` in their post request header (max 4Kb.) receive `HTTP status 507`. The body of the request contains the subscription endpoint and the encrypted payload. The server passes the endpoint and the payload on to the Web-Push API (https://github.com/web-push-libs/web-push).

## Future versions

### Recovery phrase

Create a Mnemonic BIP39 private key (12 word recovery phrase) and display in Account Setup to enable the user to recover his account in case the storage was wiped or device was lost.

Contacts and messages would not be recovered with just the mnemonics, but once a contact comes back online and tries to contact user, his address will be restored and connection can be reestablished. That's like writing down your phone on a paper and being able to receive calls anywhere you are (with connected browser and the paper).

### Dynamic Signaling Pool

The client currently uses one static [VolaTALK Peer Server](https://peer.pm:999).
To obtain the main objective of the project it is vitally import to be able to handle multi-signaling servers.

The Client will choose automatically (and randomly) from a pool of available Peer Servers registered in the application.

It maintains a 'sticky' relation with that Server during his subscription to VolaTALK, or untill further notice.

This preferred instance is sent out in connection metadata with other contacts.

The user could choose a preferred server or add their own private instance.

#### Account Hijacking

A default PeerJS Signaling Server accepts any base58 endoded id, as long as it is not taken already by another peer.

If that currently happens, the 'hijacker' wouldn't be able to establish a connection in your name because your contacts would refuse to connect with an invalid signature during handshake. But they could occupy the spot of the real 'owner' of this address.

#### Prevent occupied ID

VolaTALK Peer Servers with Hijacking protection [VolaTALK Server](#volatalk-server) will be indicated with a lock and will be marked as preferred inside this pool.

A user trying to find his contact will first try at the preferred server of that contact, but will try other instances if this fails. Once an session with the contact is established, the connection with that Peer Server is eliminated, but the session with the client remains. This could potentially resolve (partly) the scalability issue with PeerJS. Much like walking down a hallway looking in every room for your contact. Once you found the contact, establish 'the session' and leave the hallway.

When the client decides to change his preferred signaling server instance (the room), new connection metadata is sent out to all its contacts containing the new sticky relation with the newly chosen Peer Server.
This process could be triggered automatically at set intervals, or when response times for establishing connections degrade.

If a contact is not online nor pushed at given moment to be informed about the change, this contact will not be able to find the user at its old preferred signaling server. In that case the contact continues looking on other signaling servers, or wait until the user comes back online and contacts him.

### Encrypt Push Subscription

Currenly Push Subscription endpoints are shared openly between contacts. A future version should encrypt this endpoint so that only the Push Server can decrypt it once it is sent by one of user's contacts.

Ideally a VAPID key pair for each client subscription, so that VAPID public key isn't a global static and pertains only to the given client. This Vapid key pair should however be generated on the Push Server, so clients registering for push notifications must request their VAPID key pair from this server.

### An Angular reference implementation

AngularJS or Angular2, possibly using cloud backend https://Back4App.com.

### Allows Geo visibility to certain contacts only.

## License

This project is licensed under the MIT License.
