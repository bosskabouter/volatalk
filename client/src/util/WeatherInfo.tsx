import { useEffect, useState } from 'react';
//import axios from "Axios";
interface WeatherInfoProps {
  location: GeolocationPosition | null;
}

export const WeatherInfo = ({ location }: WeatherInfoProps) => {
  const OPENWEATHER_APIKEY = '420408196cb33ae10825f1019e75bcb2';

  const [locationData, setLocationData] = useState<string>('Lutjebroek');
  const [weatherToday, setWeatherToday] = useState<string>('Cloudy, little rain');
  const [weatherForecast, setWeatherForecast] = useState<string>('Cloudy, little rain');

  const fetchOpenWeatherData = (urlPrefix: string) => {
    if (!location) return null;

    const openWeatherURL =
      urlPrefix +
      `?lat=${location.coords.latitude}&lon=${location.coords.longitude}&limit=5&appid=${OPENWEATHER_APIKEY}`;
    console.log('Fetching weather from: ' + openWeatherURL);
    return fetch(openWeatherURL).then((response) => {
      if (response.ok) {
        // if HTTP-status is 200-299
        // get the response body (the method explained below)
        response.json().then((json) => {
          console.log('Response from Openweather: ' + json);
          return JSON.stringify(json);
        });
      } else {
        return null;
      }
    });
  };

  useEffect(() => {
    fetchOpenWeatherData('http://api.openweathermap.org/geo/1.0/reverse')?.then((response) => {
      setLocationData(JSON.stringify(response));
    });

    fetchOpenWeatherData('http://api.openweathermap.org/data/2.5/weather')?.then((response) => {
      setWeatherToday(JSON.stringify(response));
    });

    fetchOpenWeatherData('http://api.openweathermap.org/data/2.5/forecast')?.then((response) => {
      setWeatherForecast(JSON.stringify(response));
    });
  }, [locationData]);

  return (
    <>
      <div>{locationData}</div>

      <h4>Weather today: </h4>
      <div>{weatherToday}</div>

      <h4>Weather forecast: </h4>
      <div>{weatherForecast}</div>
    </>
  );
};
