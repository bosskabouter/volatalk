import { useTheme } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/svg/logo-yellow.svg';
import { Avatar } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import React from 'react';

const MainLogo = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const sd = () => {
    return (
      <IconButton onClick={() => navigate('/')}>
        <Avatar
          src={Logo}
          // variant="rounded"
          sx={{
            width: 36,
            height: 36,
            border: 0,
            // color: theme.palette.secondary.main,
            bgcolor: theme.palette.secondary.main,
          }}
        ></Avatar>
      </IconButton>
    );
  };
  return sd() ? (
    sd()
  ) : (
    <IconButton>
      <Link to="/">
        <Avatar
          src={Logo}
          // variant="rounded"
          sx={{
            width: 36,
            height: 36,
            border: 0,
            // color: theme.palette.secondary.main,
            bgcolor: theme.palette.secondary.main,
          }}
        ></Avatar>
      </Link>
    </IconButton>
  );
};

export default MainLogo;
