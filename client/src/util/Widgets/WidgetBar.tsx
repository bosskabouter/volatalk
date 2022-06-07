import { Box } from '@mui/material';
import LocationInfo from './LocationInfo';
import { TimeInfo } from './TimeInfo';

export const WidgetBar = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'right',
        border: 1,
      }}
    >
      <LocationInfo />

      <TimeInfo />
    </Box>
  );
};
