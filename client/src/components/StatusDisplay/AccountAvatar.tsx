import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Box, Button } from '@mui/material';
import { UserContext } from '../../providers/UserProvider';
import ContactRequestsButton from 'components/AppBar/ContactRequestsButton';

const StatusDisplay = () => {
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
        title="Account Setup"
      >
        <Avatar src={userCtx?.user?.avatar} sx={{ width: 23, height: 23, border: 1 }}></Avatar>
      </Button>
    </Box>
  );
};

export default StatusDisplay;
