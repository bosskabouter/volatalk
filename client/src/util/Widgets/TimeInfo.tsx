/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { RefObject, useEffect, useRef, useState } from 'react';

import { Box, Typography } from '@mui/material';
import { getLocalDateString, getLocalTimeString } from 'services/Generic';
/**
 * Analog clock thank to:
 * http://thenewcode.com/943/An-SVG-Analog-Clock-In-6-Lines-of-JavaScript
 *
 * @returns
 */
export const TimeInfo = () => {
  const DigitalClock = () => {
    const [time, setTime] = useState<Date>();
    //digital clock effect
    useEffect(() => {
      const interval = setInterval(() => setTime(new Date()), 10000);
      return () => {
        clearInterval(interval);
      };
    }, [time]);

    return (
      <Box>
        <Typography variant="subtitle2" noWrap>
          {time && getLocalTimeString(time)}
        </Typography>
        <Box>
          <Typography variant="subtitle2" noWrap>
            {time && getLocalDateString(time)}
          </Typography>
        </Box>
      </Box>
    );
  };

  const AnalogClock = () => {
    const sec = useRef<null | SVGRectElement>(null);
    const min = useRef<null | SVGRectElement>(null);
    const hour = useRef<null | SVGLineElement>(null);

    //analog clock effect
    useEffect(() => {
      function r(
        el: RefObject<SVGRectElement | undefined> | RefObject<SVGLineElement | undefined>,
        deg: number
      ) {
        console.log('r', el, deg);
        el.current?.setAttribute('transform', 'rotate(' + deg + ' 50 50)');
      }
      const interval = setInterval(() => {
        const d = new Date();
        //setTime(d);

        r(sec, 6 * d.getSeconds());
        r(min, 6 * d.getMinutes());
        r(hour, 30 * (d.getHours() % 12) + d.getMinutes() / 2);
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }, []);

    const styles = {
      clockRoot: css`
        #face {
          stroke-width: 2px;
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
      <svg id="clock" viewBox="0 0 100 100" css={styles.clockRoot}>
        <circle id="face" cx="50" cy="50" r="45" />

        <g id="hands">
          <rect id="hour" ref={sec} x="48.5" y="12.5" width="5" height="40" rx="2.5" ry="2.55" />
          <rect id="min" ref={min} x="48" y="12.5" width="3" height="40" rx="2" ry="2" />
          <line id="sec" ref={hour} x1="50" y1="50" x2="50" y2="16" />
        </g>
      </svg>
    );
  };

  return (
    <Box>
      <Box sx={{ display: { xs: 'block', md: 'block' }, overflow: 'auto' }}>
        <AnalogClock />
      </Box>
      <Box sx={{ display: { xs: 'block', md: 'none' }, overflow: 'auto' }}>
        <DigitalClock />
      </Box>
    </Box>
  );
};
