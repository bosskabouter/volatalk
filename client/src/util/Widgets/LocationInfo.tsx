import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../providers/UserProvider';
import { WeatherInfo } from './WeatherInfo';

export default function Geolocation() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const { user } = useContext(UserContext);
  useEffect(() => {
    if (user && user.useGps && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(setPosition);
    } else {
      console.warn('Location Sharing is not enabled.');
    }
  }, [user]);

  useEffect(() => {
    if (position?.coords && position?.coords !== user.position) user.position = position.coords;
  });

  return <>{position && <WeatherInfo location={position}></WeatherInfo>}</>;
}

export async function requestFollowMe(): Promise<GeolocationCoordinates | null> {
  return new Promise((resolve, reject) => {
    const onSuccess = (location: GeolocationPosition) => {
      console.info('Follow me success', location);
      resolve(location.coords);
    };
    const onError = (error: GeolocationPositionError) => {
      reject(error);
    };
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(onSuccess, onError);
    else resolve(null);
  });
}
