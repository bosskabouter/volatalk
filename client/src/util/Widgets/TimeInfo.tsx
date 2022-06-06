import { useEffect, useState } from 'react';

import { Box, Tooltip, Typography } from '@mui/material';
import { getLocalDateString, getLocalTimeString } from 'services/Generic';

export const TimeInfo = () => {
  const [time, setTime] = useState<Date>(new Date());

  //clock effect
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 10000);

    return () => {
      clearInterval(interval);
    };
  }, [time]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'right',
      }}
    >
      <Typography variant="subtitle2" noWrap>
        {getLocalTimeString(time)}
      </Typography>
      <Typography variant="subtitle2" noWrap>
        {getLocalDateString(time)}
      </Typography>
    </Box>
  );
};
