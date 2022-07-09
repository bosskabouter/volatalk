
import axios from 'axios';
import { round, kelvinToCelcius } from '../util/Generic';

const OPENWEATHER_APIKEY = '420408196cb33ae10825f1019e75bcb2';


async function fetchOpenWeatherData(functionURL: string, coords: GeolocationCoordinates) {
    return (
      coords &&
      axios(functionURL, {
        params: {
          lat: coords.latitude,
          lon: coords.longitude,
          limit: 1,
          appid: OPENWEATHER_APIKEY,
        },
      })
    );
  }
  
  export async function fetchLocationDescription(coords: GeolocationCoordinates): Promise<{
    city: string;
    state: string;
    country: string;
    flag: string;
  }> {
    return (
      coords &&
      new Promise((resolve, _reject) => {
        fetchOpenWeatherData('https://api.openweathermap.org/geo/1.0/reverse', coords).then((res) => {
          const record = res.data[0];
  
          const name = record.name;
          const state = record.state;
          const country = record.country;
          const flag = getFlagEmoji(record.country);
  
          resolve({ city: name, state, country, flag });
        });
      })
    );
  }
  
  export async function fetchLocationWeather(coords: GeolocationCoordinates): Promise<{
    description: string;
    celcius: number;
    icon: string;
  }> {
    return (
      coords &&
      new Promise((resolve, _reject) => {
        fetchOpenWeatherData('https://api.openweathermap.org/data/2.5/weather', coords).then(
          (res) => {
            const record = res.data.weather[0];
  
            const description = record.description;
            const icon = `https://openweathermap.org/img/wn/${record.icon}.png`;
  
            const kelvin = res.data.main.feels_like;
  
            const celcius = round(kelvinToCelcius(kelvin), 1);
            resolve({ description, celcius, icon });
          }
        );
      })
    );
  }
  
  function getFlagEmoji(countryCode: string) {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
  