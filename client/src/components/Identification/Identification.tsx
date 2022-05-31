import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import { AvatarGroup, Box, Tooltip } from '@mui/material';
import Identicon from 'identicon.js';
const Identification = (props: {
  id: string;
  status: boolean;
  name: string;
  avatar: string;
  badgeCnt: number;
}) => {
  const options = {
    foreground: [0, 0, 0, 255], // rgba black
    background: [255, 255, 255, 255], // rgba white
    margin: 0.2, // 20% margin
    size: 420, // 420px squaren
    format: 'svg', // use SVG instead of PNG
  };
  const data = new Identicon(props.id?.length > 15 ? props.id : '1234567890ABCDEF').toString();
  const imgSrc = 'data:image/svg+xml;base64,' + data;

  const imgSrcPNG = 'data:image/png;base64,' + data;
  return (
    <Box
      component="span"
      sx={{
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <AvatarGroup>
        <Badge
          variant={props.badgeCnt > 0 ? 'standard' : 'dot'}
          color={props.status ? 'success' : 'error'}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={props.badgeCnt}
          showZero
        >
          <Avatar src={props.avatar}></Avatar>
        </Badge>

        <Tooltip title={props.name + ` ID`}>
          <Avatar src={imgSrcPNG} />
        </Tooltip>
      </AvatarGroup>
    </Box>
  );
};
export default Identification;
