import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import { AvatarGroup, Box, Tooltip } from '@mui/material';
import Identicon, { IdenticonOptions } from 'identicon.js';

//import { identicon } from 'minidenticons';
const Identification = (props: {
  id: string;
  status: boolean;
  name: string;
  avatar: string;
  badgeCnt?: number;
}) => {
  const options: IdenticonOptions = {
    //foreground: [0, 0, 0, 255], // rgba black
    //background: [255, 255, 255, 255], // rgba white
    margin: 0.1, // 20% margin
    size: 256, // 256px square
    format: 'svg', // use SVG instead of PNG
  };
  if (!props.id) return <></>;

  const idString = props.id.substring(225, 252);
  const identicon = 'data:image/svg+xml;base64,' + new Identicon(idString, options).toString();

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
        <Tooltip title={'Personal Identification Icon'}>
          <Avatar src={identicon} sx={{ width: 24, height: 24 }} />
        </Tooltip>
      </AvatarGroup>
    </Box>
  );
};
export default Identification;
