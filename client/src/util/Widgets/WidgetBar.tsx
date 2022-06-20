import { Stack } from '@mui/material';
import { DateInfo } from './DateInfo';
import LocationInfo from './LocationInfo';
import PeerDisplay from './PeerDisplay';
import { TimeInfo } from './TimeInfo';

export const WidgetBar = () => {
  return (
    <Stack
      alignContent={'end'}
      alignItems="center"
      flexDirection={'row'}
      justifyContent={'right'}
      gap={2}
    >
      <LocationInfo />

      <DateInfo />
      <TimeInfo />
      <PeerDisplay />
    </Stack>
  );
};
