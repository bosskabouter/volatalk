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
      alignItems={'stretch'}
      justifySelf={'center'}
    >
      <Compass />
      <CalleeComponent /> <DateInfo />
      <TimeInfo />
      <LocationInfo />
    </Stack>
  );
}
