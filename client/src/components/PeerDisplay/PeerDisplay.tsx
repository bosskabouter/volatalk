/** @jsxImportSource @emotion/react */

import { PeerContext } from 'providers/PeerProvider';
import { identicon } from 'minidenticons';
import ICON_ONLINE from '@mui/icons-material/ConnectWithoutContactRounded';
import ICON_OFFLINE from '@mui/icons-material/CloudOffRounded';

import { useContext, useEffect } from 'react';
import { UserContext } from 'providers/UserProvider';

const PeerDisplay = () => {
  const userCtx = useContext(UserContext);

  const peerCtx = useContext(PeerContext);

  useEffect(() => {
    console.info('used effect StatusDsplay..');
  });

  function myPeerid() {
    return peerCtx ? peerCtx.myPeer.id : '';
  }

  function online() {
    return peerCtx?.myPeer?.disconnected ? ICON_OFFLINE : ICON_ONLINE;
  }

  function userDiv() {
    return !userCtx.user ? (
      <div>Not logged in</div>
    ) : (
      //got user
      <div className="userInfo">Your nickname: {userCtx.user?.nickname}</div>
    );
  }

  function peerDiv() {
    return !peerCtx?.myPeer ? (
      <div>User without peer</div>
    ) : (
      <div className="peerInfo">
        <img
          src={`data:image/svg+xml;utf8,${identicon(myPeerid())}`}
          alt={'Your personsal identification icon'}
          width={'90px'}
        />
      </div>
    );
  }

  return (
    <div>
      {userDiv()} {peerDiv()}
    </div>
  );
};

export default PeerDisplay;
