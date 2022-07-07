import { useContext, useEffect, useState } from 'react';
import Distance, { bearingFrom } from 'util/geo/Distance';
import { fetchLocationDescription, fetchLocationWeather } from 'services/LocationService';

import { Box, Stack, Typography } from '@mui/material';
import { IContact } from 'types';
import BearingIcon from '@mui/icons-material/North';
import { UserContext } from 'providers/UserProvider';
import { round } from 'services/Generic';

//TODO: investigate better north madgwick
//import { madgwick } from 'services/Compass';
export const DistanceInfo = ({ contact }: { contact: IContact }) => {
  const { user } = useContext(UserContext);

  const [distance, setDistance] = useState<number>();
  const [bearing, setBearing] = useState(0);
  const [north, setNorth] = useState(0);
  const [location, setLocation] = useState<{
    city: string;
    state: string;
    country: string;
    flag: string;
  }>();
  const [weather, setWeather] = useState<{
    description: string;
    celcius: number;
    icon: string;
  }>();

  const bearingStyle = {
    transform: 'rotate(' + (north + bearing) + 'deg)',
    //transition: 'transform 1500ms ease', // smooth transition
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

  /**
   * Calculates distance between contact and user in km, if coords are known.
   */
  useEffect(() => {
    if (!user?.position || !contact.position || distance) return;
    setDistance(Distance(user.position, contact.position));

    setBearing(Math.round(bearingFrom(user.position, contact.position)));

    fetchLocationDescription(contact.position).then(setLocation);
    fetchLocationWeather(contact.position).then(setWeather);
  }, [contact, distance, user]);

  return distance && location ? (
    <Typography variant="subtitle1" noWrap>
      <Stack direction={{ xs: 'row', md: 'column' }}>
        <span>
          <BearingIcon
            style={bearingStyle}
            titleAccess={`north (${Math.round(north)}) + bearing (${bearing}) = ${north + bearing}`}
          />
          <Box component="span" sx={{ display: { xs: 'none', md: 'block' } }}>
            {round(distance, 0)} km {location.city + ' '}
          </Box>

          {location.flag}
        </span>
        {weather && (
          <span>
            <img
              src={weather.icon}
              alt={'Current Weather in '}
              height={'27rem'}
              title={`Currently ${weather.celcius} ℃, ${weather.description} in ${location?.city}`}
            />
            <Box component="span" sx={{ display: { xs: 'none', md: 'block' } }}>
              <>{weather.celcius} ℃</>
            </Box>
          </span>
        )}
      </Stack>
    </Typography>
  ) : (
    <></>
  );
};
