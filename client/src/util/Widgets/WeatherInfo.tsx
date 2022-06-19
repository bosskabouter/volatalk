import { useEffect, useState } from 'react';

import { Box, Tooltip, Typography } from '@mui/material';
import { fetchLocationWeather } from 'services/LocationService';

interface WeatherInfoProps {
  location: GeolocationCoordinates | null;
}

export const WeatherInfo = ({ location }: WeatherInfoProps) => {
  const [weatherNow, setWeatherNow] = useState<{
    description: string;
    celcius: number;
    icon: string;
  }>();

  useEffect(() => {
    console.debug('useEffect weatherNow');
    if (!location?.longitude || weatherNow) return;

    fetchLocationWeather(location).then(setWeatherNow);
  }, [location, location?.longitude, weatherNow]);

  return weatherNow ? (
    <Tooltip title={weatherNow.description + ' - ' + weatherNow.celcius + ' \u2103'}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'right',
          alignItems: 'center',
          border: 0,
          margin: 0,
          padding: 0,
          columnGap: 0,
        }}
      >
        <Typography noWrap sx={{ display: { xs: 'none', md: 'block' } }}>
          {weatherNow.celcius + ' \u2103'}
        </Typography>
        <img src={weatherNow.icon} alt="Current Weather" />
      </Box>
    </Tooltip>
  ) : (
    <div>No Weather data without location</div>
  );
};
