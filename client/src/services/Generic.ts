import { encode, decode } from '@web3pack/base58-check';
/**
 *
 * @param value https://stackoverflow.com/questions/7342957/how-do-you-round-to-1-decimal-place-in-javascript
 * @param precision
 * @returns
 */
export function round(value: number, precision: number): number {
  const multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

export function convertObjectToBase58(o: any): string {
  return convertStringToBase58(JSON.stringify(o));
}
export function convertBase58ToObject(b58: string): any | null {
  return JSON.parse(convertBase58ToString(b58));
}
export function convertStringToBase58(s: string): string {
  return convertBufToBase58(Buffer.from(s));
}
export function convertBase58ToString(b58: string): string {
  return convertBase58ToBuf(b58).toString();
}
export function convertBufToBase58(buf: Buffer): string {
  return encode(buf);
}
export function convertBase58ToBuf(b58: string): Buffer {
  return decode(b58);
}

export function convertBase64ToAb(base64: string) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export function convertAbToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

const dateFormatShort = new Intl.DateTimeFormat(navigator.languages[0], {
  //  dateStyle: 'full',

  // weekday: 'short',
  // year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const dateFormat = new Intl.DateTimeFormat(navigator.languages[0], {
  //  dateStyle: 'full',

  weekday: 'long',
  // year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const timeFormat = new Intl.DateTimeFormat(navigator.languages[0], {
  timeStyle: 'short',
  // timeZoneName: 'short',
});
export function descriptiveTimeAgo(date: Date) {
  const oneSec = 1000;
  const oneMin = 60 * oneSec;
  const oneHour = 60 * oneMin;
  const oneDay = 24 * oneHour;

  const now = new Date().getTime();
  const then = date.getTime();
  const timeAgo = now - then;

  let desc = '';

  if (then === 0) {
    desc = 'never.';
  } else if (timeAgo < oneMin) {
    desc = 'just now.';
  } else if (timeAgo < oneHour) {
    desc = Math.round(timeAgo / oneMin) + ' minutes ago.';
  } else if (timeAgo < oneDay) {
    desc = getLocalTimeString(date);
  } else {
    desc = getLocalDateString(date);
  }
  return desc;
}
export function getLocalDateShortString(date: Date) {
  return dateFormatShort.format(date);
}
export function getLocalDateString(date: Date) {
  return dateFormat.format(date);
}
export function getLocalTimeString(date: Date) {
  return timeFormat.format(date);
}

const ABS_ZERO = -273.15;
export function toCelsius(fahrenheit: number) {
  const celcius = (fahrenheit - 32) / 1.8;
  const fahren = toFahrenheit(celcius);
  console.debug(`celcius:  ${celcius} -> fahrenheit ${fahren}`);
  return celcius;
}

export function toFahrenheit(celsius: number) {
  return celsius * 1.8 + 32;
}

export function kelvinToCelcius(kelvin: number) {
  return kelvin + ABS_ZERO;
}
