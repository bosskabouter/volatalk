import { useEffect, useState } from 'react';
import { WeatherInfo } from './WeatherInfo';

export default function Geolocation() {
  const [data, setData] = useState<GeolocationPosition | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: GeolocationPosition) => {
        console.info('Latitude: ' + position.coords.latitude);
        console.info('Longitude: ' + position.coords.longitude);
        setData(position);
      });
    } else {
      console.error('Geolocation is not supported by this browser.', navigator);
    }
  }, []);

  return (
    <>
      <WeatherInfo location={data}></WeatherInfo>
    </>
  );
}
