import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import { AvatarGroup, Box } from '@mui/material';
import { PeerIdenticon } from 'util/Widgets/PeerIdenticon';
import { useEffect, useState } from 'react';
import { toSvg } from 'jdenticon';

//import { identicon } from 'minidenticons';
const Identification = (props: {
  id: string;
  status: boolean;
  name: string;
  avatar: string;
  badgeCnt?: number;
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <AvatarGroup>
        <Badge
          variant={props.badgeCnt && props.badgeCnt > 0 ? 'standard' : 'dot'}
          color={props.status ? 'success' : 'error'}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={props.badgeCnt}
          showZero
        >
          <Avatar src={props.avatar} sx={{ width: 54, height: 54 }}></Avatar>
        </Badge>
        {toSvg(props.id, 100)}
      </AvatarGroup>
    </Box>
  );
};
export default Identification;
