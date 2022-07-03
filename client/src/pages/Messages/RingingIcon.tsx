/** @jsxImportSource @emotion/react */

import { css, keyframes, useTheme } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';

export const RingingIcon = () => {
  const ringEffect = keyframes`
    10% {
      -webkit-transform: translateX(3px) rotate(2deg);
      transform: translateX(3px) rotate(2deg);
    }
    20% {
      -webkit-transform: translateX(-3px) rotate(-2deg);
      transform: translateX(-3px) rotate(-2deg);
    }
    30% {
      -webkit-transform: translateX(3px) rotate(2deg);
      transform: translateX(3px) rotate(2deg);
    }
    40% {
      -webkit-transform: translateX(-3px) rotate(-2deg);
      transform: translateX(-3px) rotate(-2deg);
    }
    50% {
      -webkit-transform: translateX(2px) rotate(1deg);
      transform: translateX(2px) rotate(1deg);
    }
    60% {
      -webkit-transform: translateX(-2px) rotate(-1deg);
      transform: translateX(-2px) rotate(-1deg);
    }
    70% {
      -webkit-transform: translateX(2px) rotate(1deg);
      transform: translateX(2px) rotate(1deg);
    }
    80% {
      -webkit-transform: translateX(-2px) rotate(-1deg);
      transform: translateX(-2px) rotate(-1deg);
    }
    90% {
      -webkit-transform: translateX(1px) rotate(0);
      transform: translateX(1px) rotate(0);
    }
    100% {
      -webkit-transform: translateX(-1px) rotate(0);
      transform: translateX(-1px) rotate(0);
    }

  `;

  const theme = useTheme();

  const animatedItem = css`
    animation: ${ringEffect} 3000ms ${theme.transitions.easing.easeInOut} 1s infinite;
  `;

  return <PhoneIcon color="info" css={animatedItem} />;
};
