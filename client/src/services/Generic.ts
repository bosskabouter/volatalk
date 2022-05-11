/**
 * Generic shortcuts common used statements
 */

const domain = document.location.host;

/**
 */
function localSave(param: string, value: unknown) {
  const objToJSON = JSON.stringify(value);
  localStorage.setItem(param, objToJSON);
  console.debug('Saved to local storage param: ' + param, objToJSON);
}

/**
 */
function localLoad(param: string) {
  const item: any = localStorage.getItem(param);
  const obj = JSON.parse(item);
  console.debug('Loaded from local storage param: ' + param, obj);
  return obj;
}

/**
 */
function getUrlParam(name: string, u: string | null) {
  const url = !u ? document.location : u;
  name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  const regexS = '[\\?&]' + name + '=([^&#]*)';
  const regex = new RegExp(regexS);
  const results = regex.exec(url.toString());
  if (results == null) return null;
  else return results[1];
}

/**
 * requires input file upload event
 */
function readFileAsBase64(evt: any) {
  const files = evt?.target?.files;
  const file = files[0];

  return file.arrayBuffer().then((ab: ArrayBuffer) => {
    console.debug('File uploaded: ' + ab);
    return convertAbToBase64(ab);
  });
}
/**
 *
 * @param
 * @returns the string in hex
 * @see https://stackoverflow.com/questions/36637146/encode-string-to-hex
 * @see convertHexToString
 */
function convertStringToHex(s: string) {
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
function convertHexToString(hex: string) {
  return hex
    .split(/(\w\w)/g)
    .filter((p) => !!p)
    .map((c) => String.fromCharCode(parseInt(c, 16)))
    .join('');
}

/**
 */
function convertAb2str(buf: ArrayBufferLike) {
  return new TextDecoder('utf-8').decode(new DataView(buf));
}

/**
 */
function convertStr2ab(str: string) {
  return new TextEncoder().encode(str);
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

function convertAbToBase64(buffer: ArrayBuffer) {
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
    // DO DIRTY JOB
    //reject(err);

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

const dateFormat = new Intl.DateTimeFormat(navigator.languages[0], {
  //  dateStyle: 'full',

  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const timeFormat = new Intl.DateTimeFormat(navigator.languages[0], {
    timeStyle: 'short',
  // timeZoneName: 'short',
});

export function getLocalDateString(date: Date) {
  return dateFormat.format(date);
}
export function getLocalTimeString(date: Date) {
  return timeFormat.format(date);
}
export {
  domain,
  localLoad,
  localSave,
  getUrlParam,
  convertAbToBase64,
  convertHexToString,
  convertStringToHex,
  convertAb2str,
  convertStr2ab,
  readFileAsBase64,
};
