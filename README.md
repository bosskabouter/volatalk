# VolaTALK - Direct Private Messenger

<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" id='vtlogo'>
<!--Thank you https://www.freeconvert.com/svg-converter/ -->
<defs><style>
#vtlogo {
    fill:purple;
    animation-name: example;
    animation-duration: 20s;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-timing-function: ease-in-out;
}

@keyframes App-logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes App-logo-rotate {
  from {
    transform: rotateY(180deg);
  }
  to {
    transform: rotateY(360deg);
  }
}
@media (prefers-reduced-motion: no-preference) {
  .App-logo {
    animation: App-logo-spin infinite 20s linear;
    #  animation: App-logo-rotate infinite 10s;
    # animation-direction: alternate;
    animation-timing-function: ease-in-out;
  }	
}
@keyframes example {
  from {background-color: red;}
  to {background-color: yellow;}
}

</style></defs> 


<g transform="matrix(18.54 0 0 18.54 90.52 45.55)" style=""  >
		<text  class=" App-logo"  xml:space="preserve" font-family="'Yrsa'" font-size="63" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="-11.07" y="5.65" dx="6" dy="36">V</tspan></text>
</g>
<g transform="matrix(10.26 0 0 10.11 45.1 90.03)" style=""  >
		<text  class="logoClass App-logo"  xml:space="preserve" font-family="'Quicksand'" font-size="45" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="-17.55" y="-6.14" dx="6" dy="36">o L a</tspan></text>
</g>



</svg>

## Introduction
<img src="https://github.com/bosskabouter/volatalk/blob/162accd60808545d7a7227e8fe3f8b2e47a49477/logo/volatalk-logo-color-v1.png" width="99px"/>

### Vision

> Nothing as volatile as the human mind, thank the universe.

### Mission

Define a way for browsers to communicate privately and direcly between trusted contacts independent of any centralized service. When a service is used, it should know as little as possible about the sending or receiving client and the information sent.

### Why

Because I could not not find a messenger I could fully trust, I wrote my own.

### What is different

Communicate directly with other contacts without a central server to buffer, capture, censure or use the data in any other way.

Therefore it uses peer-to-peer and WebRTC. There are many solutions like these, but none I could find create a long-term trusted relation between clients, as explained in [Future Versions](#future-versions).

Any solution based on decentralized permanent mined blockchain technologies would not fit the [Vision](#vision).

#### Doesn' t anything like this exist?
Since VolaTALK does not capture any data, no money can be made from it. No commercial party would ever be interested in building anything like this. 

## Table of Contents

- [VolaTALK](#volatalk---direct-messenger)
- [Introduction](#introduction)
- [Vision](#vision)
- [Mission](#mission)
- [Why?](#why)
- [What's different](#what-is-different)
- [What's different?](#what-is-different)
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

VolaTALK describes a way for browsers to establish a trusted WebRTC connections over Peer-to-Peer while not relying on a single centralized server.

### Peer-to-Peer

Once a Peer found another Peer, no other services are needed for their communication during the existence of their WebRTC session.

In order to find each other and establish these sessions, peers register on a [WebRTC signaling server](https://webrtc.org/). A reference implementation of such Peer Server is [PeerJS](https://peerjs.com/). It can be installed anywhere and they offer a public [default instance](https://0.peerjs.com/).

#### Peer ID

A VolaTALK peer currently registers to a Signaling server with a Base58 encoded public key exponent of the ECDSA SHA-384 JSON WebKey.

Peer IDs are shared between users in 'copy-and-paste' invites. The application includes a QR generator and reader to facilitate the exchange of trusted invites.

The private key is stored in a Dexie encrypted IndexedDB.

### VolaTALK Client

A Progressive Web App as reference of the VolaTALK protocol, bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app) using the `pwa-starter` template.

#### Registration

A user can register by simply accepting 'Anonymous' as its nickname. A default avatar [thanks thanksthispersondoesnotexist.com](http://thispersondoesnotexist.com) is loaded but will appear for every contact differently (no CORS - no fetch).

The user can save a base64 encoded image into his profile. The picture is downsized because it is send within the connection metadata on every connection request.

The profile can be secured with a 6 digit access pin which can be recovered using 2 security questions.

<img src="https://github.com/bosskabouter/volatalk/blob/6860aafcdd75c00c515598ffa33f1a25967b1a93/client/public/screenshots/AccountSetup.png" width="200px"/>

##### Geo-location

The application permits "Follow Me" functionality. Users who both opt-in are able to see their own and other's estimated physical location, distance and bearing from each other, alongside local and remote weather conditions (thanks [OpenWeatherMap](https://openweathermap.org/)). By having several contacts using this feature the request information send to this service will render useless for identification of location tracking purposes.

#### Push notifications

Users can receive messages through the Push notification API of the browser. The Push subscription registered in the service worker is saved not on the Push Server (as usual), but in the user's profile and send out only to accepted contacts. A contact, trying to send a message while a user is offline, will send the user's subscription to the Push Server together with an encrypted payload. The push server does not know the ID of the receiver so cannot decrypt with the 'secret' Peer ID. It just received a URL (subscription endpoint) to resend the encrypted payload to.

Drawing here

The client uses it's own peer ID as secret key to decrypt any message it receives through push notifications. Not so secret, but since the Push Server does not know who is the receiver (only who is the sender) it cannot decrypt the message. The Browser's Push Provider does not know the user's Peer ID so they cannot decipher either.

#### Invitation

Users can share signed invites in URL or by QR. This invite points to the origin of the location where the sender installed the PWA from (https://volatalk.org), concatenated with the following parameters;

    a. ?f=[`sender.PeerID`]
    b. &k=[`An additional invitation text`]
    c. &s=[`sign(a+b, sender.privateKey)`]

A signed invitation prevents people from creating invites in name of someone else. Only the user can create a signed invite for his account. Once the invitation is sent, it could be used by N others to connect to user. The user will receive these connection requests and decides if he wishes to connect.

The application permits transmission of the invite through QR scanning, mobile sharing or on desktop by clipboard copy. Other ways of transmission including ultrasonic using [quiet-js](https://github.com/quiet/quiet-js) are being evaluated.

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
