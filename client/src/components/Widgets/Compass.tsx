import { useEffect, useState } from 'react';

import CompassIcon from '@mui/icons-material/LocationOn';
import { Stack, Tooltip, Typography } from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import ExploreOffIcon from '@mui/icons-material/ExploreOff';
/**
 *
 * @returns
 */
export const Compass = () => {
  //analog clock effect
  const [north, setNorth] = useState<number>();

  const rotateCompassStyle = {
    transform: 'rotate(' + north + 'deg)',
  };

  /**
   * Watch device orientation to follow contact location.
   *
   * The alpha angle is 0° when top of the device is
   * pointed directly toward the Earth's north pole,
   * and increases as the device is rotated toward the left.
   *
   * https://developer.mozilla.org/en-US/docs/Web/Events/Orientation_and_motion_data_explained
   */
  useEffect(() => {
    function handleOrientation(ev: DeviceOrientationEvent) {
      ev.alpha && setNorth(ev.alpha);
    }
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return north ? (
    <Tooltip title={'Magntic north'}>
      <Stack direction="row" alignItems={'center'} gap="1">
        <ExploreIcon style={rotateCompassStyle} color={'secondary'} fontSize={'large'} />

        <Typography>{north && Math.round(north)}</Typography>
      </Stack>
    </Tooltip>
  ) : (
    <Tooltip title={'No motion sensor'}>
      <ExploreOffIcon />
    </Tooltip>
  );
};
