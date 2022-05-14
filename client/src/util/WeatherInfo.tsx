import { useEffect, useState } from 'react';

import axios from 'axios';
import { Box, Typography } from '@mui/material';
import { getLocalDateString, getLocalTimeString } from 'services/Generic';

interface WeatherInfoProps {
  location: GeolocationPosition | null;
}

export const WeatherInfo = ({ location }: WeatherInfoProps) => {
  const OPENWEATHER_APIKEY = '420408196cb33ae10825f1019e75bcb2';

  const [time, setTime] = useState<Date>(new Date());
  const [locationData, setLocationData] = useState<string>('Lutjebroek');
  const [weatherToday, setWeatherToday] = useState<string>('Cloudy, little rain');
  const [weatherIcon, setWeatherIcon] = useState<string>(makeIconURL('03n'));
  const [weatherFeelslike, setWeatherForecast] = useState<string>('5');

  useEffect(() => {
    if (!location) return;

    async function fetchOpenWeatherData(functionURL: string) {
      return axios(functionURL, {
        params: {
          lat: location?.coords.latitude,
          lon: location?.coords.longitude,
          limit: 5,
          appid: OPENWEATHER_APIKEY,
        },
      });
    }

    fetchOpenWeatherData('https://api.openweathermap.org/geo/1.0/reverse').then((res) => {
      const localeInfo =
        res.data[0].name + ' (' + res.data[0].state + ',' + res.data[0].country + ')';
      setLocationData(localeInfo);
    });
    fetchOpenWeatherData('https://api.openweathermap.org/data/2.5/weather').then((res) => {
      const weatherInfo = res.data.weather[0].main + ', ' + res.data.weather[0].description;
      const iconURL = makeIconURL(res.data.weather[0].icon);
      setWeatherToday(weatherInfo);
      setWeatherIcon(iconURL);
    });
    fetchOpenWeatherData('https://api.openweathermap.org/data/2.5/forecast').then((res) => {
      const fahrenheitNextWeek = res.data.list[0].main.feels_like;
      const celciusNextWeek = Math.round(toCelsius(fahrenheitNextWeek) / 10) + ' Celcius';
      setWeatherForecast(celciusNextWeek);
    });
  }, [location]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 10000);

    return () => {
      clearInterval(interval);
    };
  }, [time]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'left',
      }}
    >
      <img src={weatherIcon} alt="Current Weather" />
      <div>
        <Typography variant="subtitle1" noWrap>
          {weatherToday},{weatherFeelslike}, near {locationData}
        </Typography>
        <Typography variant="subtitle2">
          {getLocalDateString(time)} - {getLocalTimeString(new Date())}
        </Typography>
      </div>
    </Box>
  );
};
function toCelsius(fahrenheit: number) {
  const celcius = (fahrenheit - 32) / 1.8;
  console.log(`fahrenheit: ${fahrenheit} -> celcius ${celcius}`);
  const fahren = toFahrenheit(celcius);
  console.log(`celcius:  ${celcius} -> fahrenheit ${fahren}`);
  return celcius;
}

function toFahrenheit(celsius: number) {
  return celsius * 1.8 + 32;
}

function makeIconURL(iconName: string) {
  return 'https://openweathermap.org/img/wn/' + iconName + '.png';
}
