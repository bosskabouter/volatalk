export default function Geolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
    return showPosition;
  } else {
    console.error('Geolocation is not supported by this browser.', navigator);
    return null;
  }
}

function showPosition(position:GeolocationPosition) {
  console.info('Latitude: ' + position.coords.latitude);
  console.info('Longitude: ' + position.coords.longitude);
  return position;
}
