import { useEffect, useState } from 'react';

interface WeatherInfoProps {
  location: GeolocationPosition | null;
}

export const WeatherInfo = ({ location }: WeatherInfoProps) => {
  const OPENWEATHER_APIKEY = '420408196cb33ae10825f1019e75bcb2';

  const [locationData, setLocationData] = useState<string>('Lutjebroek');
  const [weatherToday, setWeatherToday] = useState<string>('Cloudy, little rain');
  const [weatherForecast, setWeatherForecast] = useState<string>('Cloudy, little rain');

  useEffect(() => {
    if (!location) return;

    const openWeatherReverseLocation = `http://api.openweathermap.org/geo/1.0/reverse?lat=${location.coords.latitude}&lon=${location.coords.longitude}&limit=5&appid=${OPENWEATHER_APIKEY}`;
    console.log('Fetching geo info: ' + openWeatherReverseLocation);
    fetch(openWeatherReverseLocation).then((response) => {
      if (response.ok) {
        // if HTTP-status is 200-299
        // get the response body (the method explained below)
        response.json().then((json) => {
          console.log('Response from Openweather: ' + json);
          setLocationData(JSON.stringify(json));
        });
      } else {
        alert('HTTP-Error: ' + response.status);
      }
    });
  });
  useEffect(() => {
    if (!location) return;
    const openWeatherToday = `http://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&limit=5&appid=${OPENWEATHER_APIKEY}`;
    console.log('Fetching weather today: ' + openWeatherToday);
    fetch(openWeatherToday).then((response) => {
      if (response.ok) {
        // if HTTP-status is 200-299
        // get the response body (the method explained below)
        response.json().then((json) => {
          console.log('Response from Openweather: ' + json);
          setWeatherToday(JSON.stringify(json));
        });
      } else {
        alert('HTTP-Error: ' + response.status);
      }
    });
  });

  useEffect(() => {
    if (!location) return;

    const openWeatherForecast = `http://api.openweathermap.org/data/2.5/forecast?lat=${location.coords.latitude}&lon=${location.coords.longitude}&limit=5&appid=${OPENWEATHER_APIKEY}`;
    console.log('Fetching weather forecast: ' + openWeatherForecast);
    fetch(openWeatherForecast).then((response) => {
      if (response.ok) {
        // if HTTP-status is 200-299
        // get the response body (the method explained below)
        response.json().then((json) => {
          console.log('Response from Openweather: ' + json);
          setWeatherForecast(JSON.stringify(json));
        });
      } else {
        alert('HTTP-Error: ' + response.status);
      }
    });
  }, []);
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
