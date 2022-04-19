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
        <img width='200px' src={imageSrc} />
      ))}
    </>
  );
}
