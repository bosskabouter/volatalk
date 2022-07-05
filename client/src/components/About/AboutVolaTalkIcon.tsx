import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';

export const AboutVolaTalkIcon = () => {
  const navigate = useNavigate();

  return (
    <IconButton
      onClick={() => {
        navigate('/About');
      }}
    >
      <InfoIcon />
    </IconButton>
  );
};
