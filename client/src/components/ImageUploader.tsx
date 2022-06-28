/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Avatar } from '@mui/material';

import { resizeFileUpload2 } from 'services/ImageResize';

export const ImageUploader = ({
  source,
  onUploaded: uploaded,
}: {
  source?: string;
  onUploaded: (base64EncodedImage: string, base64EncodedImageThumb: string) => void;
}) => {
  const styles = {
    uploadDiv: css`
      position: relative;
      overflow: hidden;
      top: 0;
      right: 0;
      margin: 0;
      padding: 18px;
      width: 180px;
      height: 180px;
      align: 'center';
    `,
    uploadImage: css`
      width: 100%;
      height: 100%;
    `,
    uploadButton: css`
      position: absolute;
      top: 0;
      right: 0;
      margin: 0;
      padding: 0;
      font-size: 20px;
      cursor: pointer;
      opacity: 0;
      filter: alpha(opacity=0);
      width: 100%;
      height: 100%;
    `,
  };

  return (
    <div css={styles.uploadDiv}>
      <Avatar src={source} css={styles.uploadImage} variant={'rounded'}></Avatar>
      <input
        css={styles.uploadButton}
        aria-label="avatar"
        id="file"
        name="avatar"
        type="file"
        accept="image/*"
        onChange={async (event) => {
          if (!event.target.files) return;

          const imgSrc = await resizeFileUpload2(event.target.files[0], 180, 180, 0.7);
          const thumbSrc = await resizeFileUpload2(event.target.files[0], 27, 27, 0.3);

          uploaded(imgSrc, thumbSrc);
        }}
        multiple={false}
      />
    </div>
  );
};
