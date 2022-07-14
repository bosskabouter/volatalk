import { useEffect, useState } from 'react';

import CompassIcon from '@mui/icons-material/DoubleArrow';

import CompassIcon2 from '@mui/icons-material/LocationOn';
import CompassIcon3 from '@mui/icons-material/Explore';

import { Stack, Tooltip, Typography } from '@mui/material';

import ExploreOffIcon from '@mui/icons-material/ExploreOff';

const ICONCORRECTION = -90;
/**
 *
 * @returns
 */ export const Compass = () => {
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
      setNorth(ICONCORRECTION + 0 ?? ev?.alpha);
    }
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return (
    <Tooltip title={'North'}>
      <CompassIcon style={rotateCompassStyle} color={'secondary'} fontSize={'large'} />
    </Tooltip>
  );
};
