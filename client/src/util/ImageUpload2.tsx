import React, { useState, useEffect, ChangeEvent } from 'react';
import { convertAbToBase64 } from 'services/Generic';

export default function ImageUpload2(props: { value: string }) {
  const [image, setImage] = useState<File | null>();
  const [imageURL, setImageURL] = useState(props.value);

  useEffect(() => {
    if (!image) return;
    const newImageURL = URL.createObjectURL(image);
    setImageURL(newImageURL);
  }, [image]);

  function onImageChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const uploadFile = e.target.files[0];
    uploadFile.arrayBuffer().then((ab) => {
      const base64Img = convertAbToBase64(ab);
      setImageURL('data:image/png;base64,' + base64Img);
    });

    setImage(uploadFile);
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={onImageChange} />

      <img width="200px" src={imageURL}></img>
    </div>
  );
}

/**
 * @see https://imagekit.io/blog/how-to-resize-image-in-javascript/

export function resizeFileUpload(uploadTargetFile, previewOutput, MAX_WIDTH, MAX_HEIGHT) {
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

      // Show resized image in preview element
      const dataurl = canvas.toDataURL(imageFile.type);
      previewOutput.src = dataurl;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(uploadTargetFile);
}
 */
