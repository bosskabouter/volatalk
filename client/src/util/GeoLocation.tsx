import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../providers/UserProvider';
import { WeatherInfo } from './WeatherInfo';

export default function Geolocation() {
  const [data, setData] = useState<GeolocationPosition | null>(null);
  const { user } = useContext(UserContext);
  useEffect(() => {
    if (user && user.position && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: GeolocationPosition) => {
        setData(position);
      });
    } else {
      console.warn('Location Sharing is not enabled.');
    }
  }, [user]);

  return <>{user && user.position && <WeatherInfo location={data}></WeatherInfo>}</>;
}

export async function requestFollowMe() {
  return new Promise((resolve, reject) => {
    const onSuccess = (location: GeolocationPosition) => {
      console.info('Follow me success', location);
      resolve(location);
    };
    const onError = (error: GeolocationPositionError) => {
      reject(error);
    };
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(onSuccess, onError);
    else return null;
  });
}
