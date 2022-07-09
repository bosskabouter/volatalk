
const TIMEOUT_GPS = 60 * 1000;

export async function requestFollowMe(highAccuracy = true): Promise<GeolocationCoordinates | null> {
  return new Promise((resolve, _reject) => {
    const onSuccess = (position: GeolocationPosition) => {
      console.info('GeolocationPosition', position);
      resolve(
        position?.coords?.latitude
          ? {
              //workaround: GeolocationPosition not stringified
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              speed: position.coords.speed,
            }
          : null
      );
    };
    const onError = (error: GeolocationPositionError) => {
      console.warn('GeolocationPositionError', error);
      // retry one more time if high accuracy failed
      resolve(highAccuracy ? requestFollowMe(!highAccuracy) : null);
    };
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        timeout: TIMEOUT_GPS,
        enableHighAccuracy: highAccuracy,
      });
    else {
      console.warn('No location services available');
      resolve(null);
    }
  });
}

