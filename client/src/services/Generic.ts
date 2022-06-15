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
export function convertObjectToBase58(o: object): string {
  return convertStringToBase58(JSON.stringify(o));
}
export function convertBase58ToObject(b58: string): object | null {
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
/**
 *
 * @param
 * @returns the string in hex
 * @see https://stackoverflow.com/questions/36637146/encode-string-to-hex
 * @see convertHexToString
 */
export function convertStringToHex(s: string) {
  return s
    .split('')
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}

/**
 *
 * @param {*} hex encoded string
 * @returns the original string
 * @see https://stackoverflow.com/questions/36637146/encode-string-to-hex
 * @see convertStringToHex
 */
export function convertHexToString(hex: string) {
  return hex
    .split(/(\w\w)/g)
    .filter((p) => !!p)
    .map((c) => String.fromCharCode(parseInt(c, 16)))
    .join('');
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

/**
 * @see https://imagekit.io/blog/how-to-resize-image-in-javascript/
 *
 */
export function resizeFileUpload(imageFile: File, MAX_WIDTH: number, MAX_HEIGHT: number) {
  return new Promise((resolve, _reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.createElement('img');
      img.onload = function (_event) {
        // Dynamically create a canvas element
        let width = img.width;
        let height = img.height;

        // Change the resizing logic
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = height * (MAX_WIDTH / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = width * (MAX_HEIGHT / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Show resized image in preview element, if present

        const dataurl = canvas.toDataURL(imageFile.type);
        resolve(dataurl);
      };
      if (e.target?.result) img.src = e.target.result.toString();
    };
    reader.readAsDataURL(imageFile);
  });
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

  if (timeAgo < oneMin) {
    desc = 'Just now.';
  } else if (timeAgo < oneHour) {
    desc = Math.round(timeAgo / oneMin) + ' minutes ago';
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

export function toCelsius(fahrenheit: number) {
  const celcius = (fahrenheit - 32) / 1.8;
  const fahren = toFahrenheit(celcius);
  console.debug(`celcius:  ${celcius} -> fahrenheit ${fahren}`);
  return celcius;
}

export function toFahrenheit(celsius: number) {
  return celsius * 1.8 + 32;
}
