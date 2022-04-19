import React, { useState, useEffect } from 'react';

export default function ImageUpload() {
  const [images, setImages] = useState([]);
  const [imageURLS, setImageURLS] = useState([]);
  useEffect(() => {
    if (images.length < 1) return;
    const newImageURLS = [];
    images.forEach((image) => newImageURLS.push(URL.createObjectURL(image)));
    setImageURLS(newImageURLS);
  }, [images]);

  function onImageChange(e) {
    setImages([...e.target.files]);
  }

  return (
    <>
      <input type="file" multiple accept="image/*" onChange={onImageChange} />
      {imageURLS.map((imageSrc) => (
        <img width="200px" src={imageSrc} />
      ))}
    </>
  );
}

/**
 * @see https://imagekit.io/blog/how-to-resize-image-in-javascript/
 */
export function resizeFileUpload(uploadTargetFile, previewOutput, MAX_WIDTH, MAX_HEIGHT) {
  var reader = new FileReader();
  reader.onload = function (e) {
    var img = document.createElement('img');
    img.onload = function (_event) {
      // Dynamically create a canvas element
      var width = img.width;
      var height = img.height;

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

      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Show resized image in preview element
      var dataurl = canvas.toDataURL(imageFile.type);
      previewOutput.src = dataurl;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(uploadTargetFile);
}
