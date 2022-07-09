import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { UserContext } from '../../providers/UserProvider';

const AccountAvatar = () => {
  const userCtx = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <IconButton
      onClick={() => navigate('AccountSetup')}
      //variant="outlined"
      color="secondary"
      title={userCtx?.user?.nickname + ' Profile'}
    >
      <Avatar src={userCtx?.user?.avatar} sx={{ width: 54, height: 54, border: 1 }}></Avatar>
    </IconButton>
  );
};

export default AccountAvatar;
