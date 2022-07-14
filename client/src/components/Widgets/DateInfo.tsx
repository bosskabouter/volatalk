import { useEffect, useState } from 'react';

import { Box, Tooltip, Typography } from '@mui/material';
import { getLocalDateShortString, getLocalDateString } from 'services/util/Generic';
/**
 *
 * @returns
 */
export const DateInfo = () => {
  const [time, setTime] = useState<Date>(new Date());
  //digital clock effect
  useEffect(() => {
    console.debug('useEffect setTime');
    const interval = setInterval(() => setTime(new Date()), 60 * 1000);
    return () => {
      clearInterval(interval);
    };
  }, [time]);
  return (
    <Box
      sx={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'right',
        border: 0,
        margin: 0,
        padding: 0,
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Typography>{time && getLocalDateString(time)}</Typography>
      </Box>
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
        }}
      >
        <Tooltip title={time && getLocalDateString(time)}>
          <Typography noWrap >
            {time && getLocalDateShortString(time)}
          </Typography>
        </Tooltip>
      </Box>
    </Box>
  );
};
