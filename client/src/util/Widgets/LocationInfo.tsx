import { Box, Tooltip, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { fetchLocationDescription, requestFollowMe } from 'services/LocationService';
import { UserContext } from '../../providers/UserProvider';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import { WeatherInfo } from './WeatherInfo';
export default function LocationInfo() {
  const [position, setPosition] = useState<GeolocationCoordinates | null>(null);
  const { user } = useContext(UserContext);

  const [location, setLocation] = useState({
    city: 'Pirituba',
    flag: '🇧🇷',
    country: 'NL',
    state: 'NY',
  });

  /**
   * Retrieves current location from navigator, if user opted for this
   */
  useEffect(() => {
    if (!user) return;
    else if (!navigator.geolocation) {
      console.warn('Location services are not available in this browser.');
    } else if (user.useGps && !position) requestFollowMe().then(setPosition);
  }, [position, user]);

  useEffect(() => {
    if (position) fetchLocationDescription(position).then(setLocation);
  }, [position]);

  //updates location info in user profile
  useEffect(() => {
    if (position && position !== user.position) user.position = position;
  }, [position, user, user?.position]);

  return position ? (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'right',
        border: 1,
        margin: 0,
        padding: 0,
      }}
    >
      <WeatherInfo location={position} />

      <Box
        sx={{
          display: { xs: 'none', lg: 'block' },
        }}
      >
        <Typography>{location.city}</Typography>
      </Box>
      {location.flag}
    </Box>
  ) : (
    <Tooltip title="GPS disabled">
      <LocationOffIcon />
    </Tooltip>
  );
}
