/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { RefObject, useEffect, useRef, useState } from 'react';

import { Box, Tooltip, Typography } from '@mui/material';
import { getLocalTimeString } from 'services/Generic';
/**
 * Analog clock thank to:
 * http://thenewcode.com/943/An-SVG-Analog-Clock-In-6-Lines-of-JavaScript
 *
 * @returns
 */
export const TimeInfo = () => {
  const [time, setTime] = useState<Date>();
  //digital clock effect
  useEffect(() => {
    console.debug('useEffect setTime');

    const interval = setInterval(() => setTime(new Date()), 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const AnalogClock = () => {
    const sec = useRef<null | SVGRectElement>(null);
    const min = useRef<null | SVGRectElement>(null);
    const hour = useRef<null | SVGLineElement>(null);

    //analog clock effect
    useEffect(() => {
      console.debug('useEffect rotate clock');
      function rotate(
        el: RefObject<SVGRectElement | undefined> | RefObject<SVGLineElement | undefined>,
        deg: number
      ) {
        el.current?.setAttribute('transform', 'rotate(' + deg + ' 50 50)');
      }
      const interval = setInterval(() => {
        const d = new Date();
        //setTime(d);

        rotate(sec, 6 * d.getSeconds());
        rotate(min, 6 * d.getMinutes());
        rotate(hour, 30 * (d.getHours() % 12) + d.getMinutes() / 2);
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }, []);

    const styles = {
      clockRoot: css`
        #face {
          stroke-width: 6px;
          stroke: #fff;
        }
        #hour,
        #min,
        #sec {
          stroke-width: 1px;
          fill: #333;
          stroke: #555;
        }
        #sec {
          stroke: #f55;
        }
      `,
    };

    return (
      <Tooltip title={time ? getLocalTimeString(time) : ''}>
        <svg id="clock" viewBox="0 0 100 100" css={styles.clockRoot}>
          <circle id="face" cx="50" cy="50" r="45" />

          <g id="hands">
            <rect id="hour" ref={sec} x="48.5" y="12.5" width="5" height="40" rx="2.5" ry="2.55" />
            <rect id="min" ref={min} x="48" y="12.5" width="3" height="40" rx="2" ry="2" />
            <line id="sec" ref={hour} x1="50" y1="50" x2="50" y2="16" />
          </g>
        </svg>
      </Tooltip>
    );
  };

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
          width: { sd: '0', md: '45px' },
          display: { sd: 'none', md: 'inline-flex' },
        }}
      >
        <AnalogClock />
      </Box>
      <Box sx={{ display: { sd: 'inline-flex', md: 'none' } }}>
        <Box>
          <Typography noWrap>{time && getLocalTimeString(time)}</Typography>
        </Box>
      </Box>
    </Box>
  );
};
