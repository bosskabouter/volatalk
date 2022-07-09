import { useEffect, useState } from 'react';

import { Box, Tooltip, Typography } from '@mui/material';
import { fetchLocationWeather } from 'services/geo/OpenWeatherService';

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        //justifyContent: 'right',
        alignItems: 'center',
        border: 0,
        margin: 0,
        padding: 0,
        // columnGap: '1rem',
      }}
    >
      <Typography noWrap sx={{ display: { xs: 'none', md: 'block' } }}>
        {weatherNow.description}
      </Typography>
      <Typography
        noWrap
        variant="caption"
        //sx={{ display: { xs: 'none', md: 'block' } }}
      >
        {weatherNow.celcius + ' \u2103'}
      </Typography>
      <img
        src={weatherNow.icon}
        alt="Current Weather"
        title={`Currenly ${weatherNow.description}, ${weatherNow.celcius}  \u2103`}
      />
    </Box>
  ) : (
    <div>No Weather data without location</div>
  );
};
