import { Box } from '@mui/material';
import { DateInfo } from './DateInfo';
import LocationInfo from './LocationInfo';
import PeerDisplay from './PeerDisplay';
import { TimeInfo } from './TimeInfo';

export const WidgetBar = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'right',
        border: 0,
        margin: 0,
        columnGap: 4,
        paddingRight: 3,
      }}
    >
      <LocationInfo />

      <DateInfo />
      <TimeInfo />
      <PeerDisplay />
    </Box>
  );
};
