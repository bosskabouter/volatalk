import { useEffect, useState } from 'react';

import { Box, Typography } from '@mui/material';
import { round, toCelsius } from 'services/Generic';
import { fetchLocationWeather } from 'services/LocationService';

interface WeatherInfoProps {
  location: GeolocationCoordinates | null;
}

export const WeatherInfo = ({ location }: WeatherInfoProps) => {
  const [weatherNow, setWeatherNow] = useState<{
    description: string;
    fahrenheit: number;
    icon: string;
  }>();

  useEffect(() => {
    if (!location?.longitude || weatherNow) return;

    fetchLocationWeather(location).then((weather) => {
      setWeatherNow(weather);
    });
  }, [location, location?.longitude, weatherNow]);

  return weatherNow ? (
    <Box
      sx={{
        // display: { xs: 'hidden', lg: 'collapse' },
        flexDirection: { md: 'row', lg: 'column' },
        //  alignItems: { xs: 'left', md: 'flex-start' },
        //minWidth: { md: 80 },
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
      }}
    >
      <Box
        sx={{
          visibility: { xs: 'hidden', lg: 'visible' },
        }}
      >
        <Typography variant="subtitle2" noWrap>
          {round(toCelsius(weatherNow.fahrenheit) / 10, 1) + ' \u2103'}
        </Typography>
      </Box>
      <Box>
        <img src={weatherNow.icon} alt="Current Weather" />
      </Box>
    </Box>
  ) : (
    <div>No Weather data without location</div>
  );
};
