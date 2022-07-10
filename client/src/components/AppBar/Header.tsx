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
      gap={'1rem'}
      position={'fixed'}
      alignItems={'center'}
      justifySelf={'center'}
      justifyContent={'space-evenly'}
      spacing={1}
    >
      <Compass />
      <CalleeComponent /> <DateInfo />
      <TimeInfo />
      <LocationInfo />
    </Stack>
  );
}
