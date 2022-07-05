import { Stack, Toolbar } from '@mui/material';
import { AboutVolaTalkIcon } from 'components/About/AboutVolaTalkIcon';
import { Compass } from './Compass';
import { DateInfo } from './DateInfo';
import LocationInfo from './LocationInfo';
import PeerDisplay from './PeerDisplay';
import { TimeInfo } from './TimeInfo';

export const WidgetBar = () => {
  return (
    <Toolbar>
      <Stack
        alignContent={'end'}
        alignItems="center"
        flexDirection={'row'}
        justifyContent={'right'}
        gap={2}
      >
        <Compass />
        <LocationInfo />

        <DateInfo />
        <TimeInfo />
        <PeerDisplay />
        <AboutVolaTalkIcon/>
      </Stack>
    </Toolbar>
  );
};
