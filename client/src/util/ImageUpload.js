import React, { useState, useEffect } from 'react';

export default function ImageUpload(props) {
  const [image, setImage] = useState('');
  const [imageURL, setImageURL] = useState('');
  useEffect(() => {
    if (!image) return;
    const newImageURL = URL.createObjectURL(image);
    setImageURL(newImageURL);
  }, image);

  function onImageChange(e) {
    setImage(...e.target.files[0]);
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={onImageChange} />
      <img width="200px" src={props.value} />

      <img width="200px" src={imageURL}  />
    </div>
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
