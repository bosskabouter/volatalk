/**
 * https://stackoverflow.com/questions/21279559/geolocation-closest-locationlat-long-from-my-position
 * @param pos1
 * @param pos2
 * @returns distance between 2 geolocations
 */

const R = 6371; // Radius of the earth in km

export default function Distance(
  pos1: GeolocationCoordinates,
  pos2: GeolocationCoordinates
): number | undefined {
  if (!pos1?.latitude || !pos2?.latitude) {
    console.info('Distance unknown', pos1, pos2);
    return;
  }

  const dLat = deg2rad(pos1.latitude - pos2.latitude);
  const dLon = deg2rad(pos1.longitude - pos2.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(pos1.latitude)) *
      Math.cos(deg2rad(pos2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }
}

export function DistanceFromMiddleEarth(pos: GeolocationCoordinates): number | null {
  const exactAltitude = pos.altitude ? pos.altitude : 0;
  return pos ? Math.round(exactAltitude + R) : null;
}

/**
 * https://stackoverflow.com/questions/46590154/calculate-bearing-between-2-points-with-javascript#52079217
 * @param pos1
 * @param pos2
 * @returns
 */
export function bearingFrom(pos1: GeolocationCoordinates, pos2: GeolocationCoordinates) {
  const startLat = toRadians(pos1.latitude);
  const startLng = toRadians(pos1.longitude);
  const destLat = toRadians(pos2.latitude);
  const destLng = toRadians(pos2.longitude);

  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x =
    Math.cos(startLat) * Math.sin(destLat) -
    Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);

  const brng = toDegrees(Math.atan2(y, x));
  return (brng + 360) % 360;
}
// Converts from degrees to radians.
function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

// Converts from radians to degrees.
function toDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}
