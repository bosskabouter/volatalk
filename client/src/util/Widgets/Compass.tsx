import { useEffect, useState } from 'react';

import CompassIcon from '@mui/icons-material/LocationOn';
import Avatar from '@mui/material/Avatar';
import theme from 'pages/App/theme';

/**
 *
 * @returns
 */
export const Compass = () => {
  //analog clock effect
  const [north, setNorth] = useState<number>();

  const compassStyle = {
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
      ev.alpha && setNorth(ev.alpha + 180);
    }
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return north ? (
    <Avatar
      title={north + ' degrees from north'}
      sx={{
        border: 2,
        borderColor: theme.palette.secondary.main,
        backgroundColor: theme.palette.primary.main,
      }}
    >
      <CompassIcon style={compassStyle} color={'secondary'} />
    </Avatar>
  ) : (
    <></>
  );
};
