import { useEffect, useState } from 'react';

import axios from 'axios';
import { Avatar } from '@mui/material';

interface WeatherInfoProps {
  location: GeolocationPosition | null;
}

export const WeatherInfo = ({ location }: WeatherInfoProps) => {
  const OPENWEATHER_APIKEY = '420408196cb33ae10825f1019e75bcb2';

  const [locationData, setLocationData] = useState<string>(JSON.stringify({ name: 'Lutjebroek' }));
  const [weatherToday, setWeatherToday] = useState<string>('Cloudy, little rain');
  const [weatherIcon, setWeatherIcon] = useState<string>('Cloudy, little rain');
  const [weatherForecast, setWeatherForecast] = useState<string>('Sunshine, after the rain');

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

    function makeIconURL(iconName: string) {
      return 'http://openweathermap.org/img/wn/' + iconName + '@2x.png';
    }

    fetchOpenWeatherData('http://api.openweathermap.org/geo/1.0/reverse').then((res) => {
      const localeInfo =
        res.data[0].name + ' (' + res.data[0].state + ',' + res.data[0].country + ')';
      setLocationData(localeInfo);
    });
    fetchOpenWeatherData('http://api.openweathermap.org/data/2.5/weather').then((res) => {
      const weatherInfo = res.data.weather[0].main + ', ' + res.data.weather[0].description;
      const iconURL = makeIconURL(res.data.weather[0].icon);
      setWeatherToday(weatherInfo);
      setWeatherIcon(iconURL);
    });
    fetchOpenWeatherData('http://api.openweathermap.org/data/2.5/forecast').then((res) => {
      const fc = res.data.list[39].main.feels_like;
      setWeatherForecast(fc);
    });
  }, [location]);

  return (
    <>
      , near {locationData}
     <br/> 
      Weather today: {weatherToday} 
<br/>
      Next week forecast: 
      {weatherForecast}
      <Avatar src={weatherIcon} alt="Current Weather Image"></Avatar>
      
    </>
  );
};
