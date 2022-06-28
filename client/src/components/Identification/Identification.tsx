import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import { AvatarGroup, Box } from '@mui/material';
import { toSvg } from 'jdenticon';
//TODO use one identicon library :)
//import { identicon } from 'minidenticons';
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
        <span dangerouslySetInnerHTML={{ __html: toSvg(props.id, 36) }} />
      </AvatarGroup>
    </Box>
  );
};
export default Identification;
