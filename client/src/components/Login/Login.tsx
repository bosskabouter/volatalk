/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { useContext, useState } from 'react';
import { Button, Dialog, DialogContent, TextField, Typography, useTheme } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { isMobile } from 'react-device-detect';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from 'providers/AuthProvider';
import { UserContext } from 'providers/UserProvider';
import { useDispatch } from 'react-redux';

const Login = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const { setAuthenticated } = useContext(AuthContext);
  const { setUser } = useContext(UserContext);


  const queryParams = new URLSearchParams(useLocation().search);

  const theme = useTheme();
  const fullScreen = isMobile ? true : false;
  const navigate = useNavigate();
  const db = useContext(DatabaseContext);
  const dispatch = useDispatch();

  const validationSchema = yup.object({
    pin: yup
      .string()
      .defined('Enter a valid pin')
      .min(6, 'Pin must be at least 6 characters')
      .matches(/^\d+$/, 'Pin must only contain numbers')
      .trim(),
  });

  const formik = useFormik({
    initialValues: {
      pin: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values, { setErrors }) => {
      // Check if pin is valid
      // Cache pin with ref
      if (db !== null) {
        db.userProfile
          .get(1)
          .then((res) => {
            if (res !== undefined) {
              if (res.pin === values.pin) {
                setLoggedIn(true);
                setAuthenticated(true);
                setUser(res);
                //dispatch(setUser(res));

                navigate('/');
              } else {
                setErrors({ pin: 'Pin does not match' });
              }
            }
          })
          .catch((err) => {
            console.error(err);
          });
      }
    },
  });

  const onForget = () => {
    navigate('/pinReset');
  };

  const styles = {
    loginDialogRoot: css`
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      color: ${theme.palette.common.white};
    `,
    loginDialogContent: css`
      background-color: ${theme.palette.primary.main};
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      height: 100%;
      color: ${theme.palette.common.white};
      padding: 3rem 1rem 2rem 1rem;
      @media only screen and (min-width: 768px) {
        padding: 4rem 6rem 4rem 6rem;
        min-height: 30rem;
        width: 38rem;
      }
    `,
    loginPin: css`
      width: 100%;
      background-color: ${theme.palette.common.white};
      border-radius: 0.5em;
      @media only screen and (min-width: 768px) {
        height: 3.5rem;
      }
    `,
    loginForm: css`
      padding-top: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 100%;
    `,
    loginButton: css`
      width: 100%;
      min-height: 2.5rem;
      border-radius: 20;
    `,
  };

  return (
    <Dialog
      css={styles.loginDialogRoot}
      open={!loggedIn}
      disableEscapeKeyDown
      maxWidth="lg"
      fullScreen={fullScreen}
    >
      <DialogContent id="dialog-agreement" css={styles.loginDialogContent}>
        <div>
          <Typography component="h1" variant="h4">
            Welcome Back!
          </Typography>
          <Typography variant="subtitle1">Enter PIN to unlock the app</Typography>
        </div>
        <form css={styles.loginForm} onSubmit={formik.handleSubmit}>
          <TextField
            required
            css={styles.loginPin}
            id="pin"
            variant="outlined"
            type="password"
            inputMode="numeric"
            inputProps={{ maxLength: 6 }}
            value={formik.values.pin}
            onChange={formik.handleChange}
            error={formik.touched.pin && Boolean(formik.errors.pin)}
            helperText={formik.touched.pin && formik.errors.pin}
          />
          <Typography variant="subtitle1" onClick={onForget}>
            Forgot PIN
          </Typography>
          <Button css={styles.loginButton} type="submit" color="primary" variant="contained">
            Done
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Login;
