import { IUserProfile } from 'types';

import Peer from 'peerjs';

const connOpts = {
  host: 'volatalk.org',
  port: 443,
  path: '/peerjs',
  secure: true,
  key: 'pmkey',
  debug: 1,
};

/**
 * Vola' s PeerJS implementation.
 *
 * Creates a connection to a peer server based on IUserProfile.peerid.
 *
 *
 *
 *
 */
export class VolaPeer extends Peer {
  user: IUserProfile;

  //another connection to the same peer server, connected through the nickname to make it searchable, if so desired by user.
  searchPeer: Peer | null;

  /**
   *
   * @param user
   */
  constructor(user: IUserProfile) {
    if (!user.peerid) {
      throw Error('User without peerid (public key)');
    }
    super(user.peerid, connOpts);

    this.user = user;
    /**
     * public search by registering another peer with nickname-id
     */
    this.searchPeer = user.isSearchable ? new Peer(user.nickname, connOpts) : null;

    console.debug(`Connecting to peerserver using ID and (options):`, user.peerid, connOpts);

    if (!this.searchPeer?.disconnected) {
      console.info('User is also registered using nickname: ' + this.searchPeer?.id);
    }
    //TODO add on connection listener for searchPeer and respond (when searching with proper signature) the user's true peerid
  }
}
