import { useEffect, useState } from 'react';
import { WeatherInfo } from './WeatherInfo';

export default function Geolocation() {
  const [data, setData] = useState<GeolocationPosition | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: GeolocationPosition) => {
        console.debug(`long(${position.coords.longitude}) lang(${position.coords.latitude})`);
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
