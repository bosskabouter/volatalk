import { Box, Tooltip, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { fetchLocationDescription, requestFollowMe } from 'services/LocationService';
import { UserContext } from '../../providers/UserProvider';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import { WeatherInfo } from './WeatherInfo';
export default function LocationInfo() {
  const [position, setPosition] = useState<GeolocationCoordinates | null>(null);
  const { user } = useContext(UserContext);

  const [locationDescription, setLocationDesciption] = useState<{
    city: string;
    state: string;
    country: string;
    flag: string;
  }>();

  /**
   * Retrieves current location from navigator, if user opted for this
   */
  useEffect(() => {
    if (!user) return;
    else if (!navigator.geolocation) {
      console.warn('Location services are not available in this browser.');
    } else if (user.useGps && !position) {
      console.debug('useEffect requestFollowMe');

      requestFollowMe().then((pos) => {
        setPosition(pos);
      });
    }
  }, [position, user]);

  useEffect(() => {
    if (position && !locationDescription) {
      console.debug('useEffect fetchLocationDescription');
      fetchLocationDescription(position).then((desc) => setLocationDesciption(desc));
    }
  }, [position]);

  //updates location info in user profile
  useEffect(() => {
    if (!user) return;
    if (position && position !== user?.position) {
      console.debug('useEffect user.position');

      user.position = position;
    }
  }, [position, user, user?.position]);

  return position && locationDescription ? (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'right',
        border: 0,
        columnGap: 1,
        margin: 0,
        padding: 0,
      }}
    >
      <WeatherInfo location={position} />
      <Tooltip
        title={`near ${locationDescription.city} (${locationDescription.state}-${locationDescription.country})`}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', columnGap: 1 }}>
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
            }}
          >
            <Typography>{locationDescription.city}</Typography>
          </Box>
          <Typography variant="h5">{locationDescription.flag}</Typography>
        </Box>
      </Tooltip>
    </Box>
  ) : (
    <Tooltip title="GPS disabled">
      <LocationOffIcon />
    </Tooltip>
  );
}
