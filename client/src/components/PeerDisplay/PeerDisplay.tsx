/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { useTheme } from '@mui/material/styles';
import { PeerContext } from 'providers/PeerProvider';
import { identicon } from 'minidenticons';

import { useContext, useEffect, useState } from 'react';
import { UserContext } from 'providers/UserProvider';

const PeerDisplay = () => {
  const theme = useTheme();

  const userCtx = useContext(UserContext);

  const peerCtx = useContext(PeerContext);

  const styles = {
    footerRoot: css`
      padding: ${theme.spacing(4)} ${theme.spacing(2)};
    `,
    logos: css`
      margin-bottom: ${theme.spacing(4)};
      max-width: 480px;
    `,
  };

  useEffect(() => {
    console.info('used effect StatusDsplay..');
  });

  function myPeerid() {
    return peerCtx ? peerCtx.myPeer.id : '';
  }

  function online() {
    return <span>{peerCtx?.myPeer?.disconnected ? ' 🚫 ' : ' ✅ '}</span>;
  }

  function userDiv() {
    return !userCtx.user ? (
      <div> Not logged in</div>
    ) : (
      //got user
      <div className="userInfo">
        <img  src={userCtx.user?.avatar} alt={'Your Avatar'} width={'90px'} />
        Your nickname: {userCtx.user?.nickname}
      </div>
    );
  }

  function peerDiv() {
    return !peerCtx?.myPeer ? (
      <div>User without peer</div>
    ) : (
      <div className="peerInfo">
        {online()}
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
