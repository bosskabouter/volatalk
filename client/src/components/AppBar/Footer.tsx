import { AppBar, Box, Fab, Stack, Toolbar } from '@mui/material';
import { AboutVolaTalkIcon } from 'components/About/About';
import AccountAvatar from 'components/StatusDisplay/AccountAvatar';

import MainLogo from 'components/Widgets/MainLogo';
import PeerDisplay from 'components/Widgets/PeerDisplay';
import styled from '@emotion/styled';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import ContactRequestsButton from 'components/Invite/ContactRequestsButton';
const Footer = () => {
  const navigate = useNavigate();
  const StyledFab = styled(Fab)({
    position: 'absolute',
    zIndex: 1,
    top: -30,
    left: 0,
    right: 0,
    margin: '0 auto',
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" variant="elevation" color="primary" sx={{ top: 'auto', bottom: 0 }}>
        <Toolbar>
          <StyledFab
            color="secondary"
            aria-label="add"
            onClick={() => {
              navigate('/Invite');
            }}
          >
            <AddIcon />
          </StyledFab>

          <Stack
            direction={'row'}
            alignItems={'center'}
            justifyContent={'space-evenly'}
            spacing={3}
            sx={{ flexGrow: 1 }}
          >
            <MainLogo />

            <PeerDisplay />

            <AboutVolaTalkIcon />
            <ContactRequestsButton />
            <AccountAvatar />
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Footer;
