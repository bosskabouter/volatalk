/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Avatar, useTheme } from '@mui/material';
import { RefObject, useEffect, useRef } from 'react';

/**
 * Analog clock thank to:
 * http://thenewcode.com/943/An-SVG-Analog-Clock-In-6-Lines-of-JavaScript
 *
 * @returns
 */
export const TimeInfo = () => {
  // const DigitalClock = () => {
  //   const [time, setTime] = useState<Date>();
  //   //digital clock effect
  //   useEffect(() => {
  //     console.debug('useEffect setTime');

  //     const interval = setInterval(() => setTime(new Date()), 10000);
  //     return () => {
  //       clearInterval(interval);
  //     };
  //   }, []);

  //   return <Typography noWrap>{time && getLocalTimeString(time)}</Typography>;
  // };

  const AnalogClock = () => {
    const theme = useTheme();
    const hour = useRef<null | SVGRectElement>(null);
    const min = useRef<null | SVGRectElement>(null);
    const sec = useRef<null | SVGLineElement>(null);

    //analog clock effect
    useEffect(() => {
      console.debug('useEffect rotate clock');

      const interval = setInterval(() => {
        function rotate(
          el: RefObject<SVGRectElement | undefined> | RefObject<SVGLineElement | undefined>,
          deg: number
        ) {
          el.current?.setAttribute('transform', 'rotate(' + deg + ' 50 50)');
        }
        const d = new Date();

        rotate(sec, 6 * d.getSeconds());
        rotate(min, 6 * d.getMinutes());
        rotate(hour, 30 * (d.getHours() % 12) + d.getMinutes() / 2);
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    });

    const styles = {
      clockRoot: css`
        #face {
          stroke-width: 2px;
        }
        #hour,
        #min,
        #sec {
          stroke-width: 3px;
          fill: #fffff;
          stroke: #ffff;
        }
        #sec {
          stroke: #f55;
        }
      `,
    };

    return (
      <Avatar sx={{ color: theme.palette.secondary.main }}>
        <svg id="clock" viewBox="0 0 100 100" css={styles.clockRoot} height={36} width={36}>
          <circle id="face" cx="50" cy="50" r="45" />

          <g id="hands">
            <rect id="hour" ref={hour} x="48.5" y="12.5" width="5" height="40" rx="2.5" ry="2.55" />
            <rect id="min" ref={min} x="48" y="12.5" width="3" height="40" rx="2" ry="2" />
            <line id="sec" ref={sec} x1="50" y1="50" x2="50" y2="16" />
          </g>
        </svg>
      </Avatar>
    );
  };

  return <AnalogClock />;
};
