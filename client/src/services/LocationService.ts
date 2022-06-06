import axios from 'axios';

const OPENWEATHER_APIKEY = '420408196cb33ae10825f1019e75bcb2';

async function fetchOpenWeatherData(functionURL: string, coords: GeolocationCoordinates) {
  return axios(functionURL, {
    params: {
      lat: coords.latitude,
      lon: coords.longitude,
      limit: 5,
      appid: OPENWEATHER_APIKEY,
    },
  });
}

export async function fetchLocationDescription(coords: GeolocationCoordinates): Promise<{
  name: string;
  state: string;
  country: string;
  flag: string;
}> {
  return new Promise((resolve, _reject) => {
    fetchOpenWeatherData('https://api.openweathermap.org/geo/1.0/reverse', coords).then((res) => {
      const record = res.data[0];

      const name = record.name;
      const state = record.state;
      const country = record.country;
      const flag = record.flag;

      resolve({ name, state, country, flag });
    });
  });
}

export async function fetchLocationWeather(coords: GeolocationCoordinates): Promise<{
  description: string;
  fahrenheit: number;
  icon: string;
}> {
  return new Promise((resolve, _reject) => {
    fetchOpenWeatherData('https://api.openweathermap.org/data/2.5/weather', coords).then((res) => {
      const record = res.data.weather[0];

      const description = record.description;
      const icon = `https://openweathermap.org/img/wn/${record.icon}.png`;

      const fahrenheit = res.data.main.feels_like;

      resolve({ description, fahrenheit, icon });
    });
  });
}
