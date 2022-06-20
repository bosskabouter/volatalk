/**
 * https://stackoverflow.com/questions/14672746/how-to-compress-an-image-via-javascript-in-the-browser
 * @param file
 * @param MAX_WIDTH
 * @param MAX_HEIGHT
 * @param MIME_TYPE
 * @param QUALITY
 */
export async function resizeFileUpload2(
  file: File,
  MAX_WIDTH: number,
  MAX_HEIGHT: number,

  QUALITY = 1
): Promise<string> {
  const MIME_TYPE = 'image/png';
  const blobURL = URL.createObjectURL(file);
  const img = new Image();
  img.src = blobURL;
  img.onerror = function () {
    URL.revokeObjectURL(this.src);
    // Handle the failure properly
    console.log('Cannot load image');
  };
  return new Promise((resolve) => {
    img.onload = function () {
      URL.revokeObjectURL(img.src);
      const [newWidth, newHeight] = calculateSize(img, MAX_WIDTH, MAX_HEIGHT);
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);
      canvas.toBlob(
        (blob) => {
          // Handle the compressed image. es. upload or save in local state
          displayInfo('Original file', file);
          blob && displayInfo('Compressed file', blob);
        },
        MIME_TYPE,
        QUALITY
      );
      return resolve(canvas.toDataURL());
    };
  });
}
function calculateSize(img: HTMLImageElement, maxWidth: number, maxHeight: number) {
  let width = img.width;
  let height = img.height;

  // calculate the width and height, constraining the proportions
  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }
  return [width, height];
}

/**
 * @see https://imagekit.io/blog/how-to-resize-image-in-javascript/
 * @param imageFile
 * @param MAX_WIDTH
 * @param MAX_HEIGHT
 * @returns
 */
export function resizeFileUpload(
  imageFile: File,
  MAX_WIDTH: number,
  MAX_HEIGHT: number,
  QUALITY = 1
): Promise<string> {
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

        const dataurl = canvas.toDataURL(imageFile.type, QUALITY);
        resolve(dataurl);
      };
      if (e.target?.result) img.src = e.target.result.toString();
    };
    reader.readAsDataURL(imageFile);
  });
}

// Utility functions for demo purpose

function displayInfo(label: string, file: Blob) {
  console.info(`${label} - ${readableBytes(file.size)}`);
}

function readableBytes(bytes: number) {
  const i = Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}
