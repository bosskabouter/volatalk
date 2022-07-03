import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import { AvatarGroup, Box } from '@mui/material';
import { PeerIdenticon } from 'util/Widgets/PeerIdenticon';
const Identification = (props: {
  id: string;
  status?: boolean;
  name: string;
  avatar?: string;
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
          {props.avatar && <Avatar src={props.avatar} sx={{ width: 54, height: 54 }}></Avatar>}
        </Badge>
        <Avatar
          src={PeerIdenticon({ peerid: props.id })}
          sx={{ width: 36, height: 36, border: 3 }}
        />
      </AvatarGroup>
    </Box>
  );
};
export default Identification;
