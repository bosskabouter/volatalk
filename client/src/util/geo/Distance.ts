/**
 * https://stackoverflow.com/questions/21279559/geolocation-closest-locationlat-long-from-my-position
 * @param pos1
 * @param pos2
 * @returns distance between 2 geolocations
 */

const R = 6371; // Radius of the earth in km

export default function Distance(pos1: GeolocationPosition, pos2: GeolocationPosition) {
  if (!pos1.coords || !pos2.coords) {
    console.info('Distance unknown', pos1, pos2);
    return;
  }
  const dLat = deg2rad(pos1.coords.latitude - pos2.coords.latitude);
  const dLon = deg2rad(pos1.coords.longitude - pos2.coords.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(pos1.coords.latitude)) *
      Math.cos(deg2rad(pos2.coords.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }
}

export function DistanceFromMiddleEarth(pos: GeolocationPosition) {
  if (!pos.coords) {
    return;
  }
  return (pos.coords.altitude ? pos.coords.altitude : 0) + R;
}
