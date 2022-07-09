import { Stack } from '@mui/material';
import { Compass } from 'components/Widgets/Compass';
import LocationInfo from 'components/Widgets/LocationInfo';
import { DateInfo } from 'components/Widgets/DateInfo';
import { TimeInfo } from 'components/Widgets/TimeInfo';
import CalleeComponent from 'pages/Messages/CalleeComponent';

/**
 *
 * @returns Transparent informative non-cickable information bar
 */

export default function Header() {
  return (
    <Stack
      direction={'row'}
      gap={'2rem'}
      position={'fixed'}
      alignContent={'center'}
      justifySelf={'center'}
      justifyContent={'space-evenly'}
      spacing={3}
      sx={{ flexGrow: 1 }}
      flexGrow={1}
    >
      <Stack direction={'row'}
      gap={'1rem'}
    //  position={'fixed'}
    alignItems={'center'}
      alignContent={'center'}
      justifySelf={'center'}
      justifyContent={'space-evenly'}
      spacing={1}
      sx={{ flexGrow: 1 }}
      flexGrow={1}>
        <Compass />
        <CalleeComponent /> <DateInfo />
      </Stack>
      <TimeInfo />
        <LocationInfo />
    </Stack>
  );
}
