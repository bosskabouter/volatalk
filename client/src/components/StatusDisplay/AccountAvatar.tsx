import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Box, Button } from '@mui/material';
import { UserContext } from '../../providers/UserProvider';
import ContactRequestsButton from 'components/AppBar/ContactRequestsButton';

const AccountAvatar = () => {
  const userCtx = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'right',
        alignItems: 'center',
        border: 0,
        margin: 0,
        padding: 0,
        columnGap: 1,
      }}
    >
      <ContactRequestsButton></ContactRequestsButton>

      <Button
        onClick={() => navigate('AccountSetup')}
        variant="contained"
        color="secondary"
        title={userCtx?.user?.nickname + ' Profile'}
      >
        <Avatar src={userCtx?.user?.avatar} sx={{ width: 27, height: 27, border: 1 }}></Avatar>
      </Button>
    </Box>
  );
};

export default AccountAvatar;
