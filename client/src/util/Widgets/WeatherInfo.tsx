import { useEffect, useState } from 'react';

import { Box, Tooltip, Typography } from '@mui/material';
import { round, toCelsius } from 'services/Generic';
import { fetchLocationDescription, fetchLocationWeather } from 'services/LocationService';

interface WeatherInfoProps {
  location: GeolocationPosition | null;
}

export const WeatherInfo = ({ location }: WeatherInfoProps) => {
  const [fetched, setFetched] = useState<boolean>(false);
  const [locationData, setLocationData] = useState<string>('Lutjebroek');
  const [weatherToday, setWeatherToday] = useState<string>('Cloudy, little rain');
  const [weatherIcon, setWeatherIcon] = useState<string>(makeIconURL('03n'));
  const [weatherTemp, setWeatherForecast] = useState<string>('5');

  useEffect(() => {
    if (!location || fetched) return;
    setFetched(true);
    fetchLocationDescription(location.coords).then((desc) => {
      setLocationData(`${desc.name} (${desc.country})`);
    });
    fetchLocationWeather(location.coords).then((weather) => {
      const celciusNow = toCelsius(weather.fahrenheit) / 10;
      const celciusDesc = round(celciusNow, 1) + ' \u2103';
      setWeatherForecast(celciusDesc);
      setWeatherToday(weather.description);
      setWeatherIcon(weather.icon);
    });
  }, [fetched, location]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        // alignItems: 'flex-start',
        justifyContent: 'right',
      }}
    >
      {locationData}
      <Typography variant="subtitle1" noWrap>
        <Tooltip title={weatherToday}>
          <div>
            <img src={weatherIcon} alt="Current Weather" />

            <Typography variant="subtitle2" noWrap>
              {weatherTemp}
            </Typography>
          </div>
        </Tooltip>
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'right',
        }}
      ></Box>
    </Box>
  );
};

function makeIconURL(iconName: string) {
  return 'https://openweathermap.org/img/wn/' + iconName + '.png';
}
