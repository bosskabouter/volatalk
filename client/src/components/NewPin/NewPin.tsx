/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useContext, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  FormControl,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { isMobile } from 'react-device-detect';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { useNavigate } from 'react-router-dom';

const NewPin = () => {
  const [created, setCreated] = useState(false);
  const theme = useTheme();
  const fullScreen = isMobile ? true : false;
  const navigate = useNavigate();
  const db = useContext(DatabaseContext);

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
    onSubmit: (values) => {
      if (db !== null) {
        db.userProfile.update(1, values).then((updated) => {
          if (updated) {
            setCreated(true);
            navigate('/');
          }
        });
      }
    },
  });

  const styles = {
    pinResetDialogRoot: css`
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      color: ${theme.palette.common.white};
    `,
    pinResetDialogContent: css`
      background-color: ${theme.palette.primary.main};
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      height: 100%;
      color: ${theme.palette.common.white};
      padding: 7rem 1.5rem 4rem 1.5rem;
      @media only screen and (min-width: 768px) {
        padding: 7rem 4rem 5rem 4rem;
        min-height: 24rem;
        width: 38rem;
      }
    `,
    pinResetRoot: css`
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 1.5rem;
    `,
    pinResetAnswer: css`
      background-color: ${theme.palette.common.white};
      input[type='text'] {
        font-size: calc(7px + (16 - 10) * ((100vw - 300px) / (1600 - 300)));
      }
    `,
    pinResetButton: css`
      width: 100%;
      min-height: 20px;
      border-radius: 20;
      background-color: ${theme.palette.primary.dark};
    `,
    form: css`
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin-top: 1rem;
      width: 100%;
      height: 100%;
      @media only screen and (min-width: 768px) {
        margin-top: 0rem;
        /* flex-direction: column; */
        justify-content: space-around;
      }
    `,
  };

  return (
    <Dialog
      css={styles.pinResetDialogRoot}
      open={!created}
      disableEscapeKeyDown
      maxWidth="lg"
      fullScreen={fullScreen}
    >
      <DialogContent id="dialog-agreement" css={styles.pinResetDialogContent}>
        <Typography component="h1" variant="h5">
          Set PIN:
        </Typography>
        <form css={styles.form} onSubmit={formik.handleSubmit}>
          <FormControl css={styles.pinResetRoot} variant="standard">
            <TextField
              required
              css={styles.pinResetAnswer}
              hiddenLabel
              id="pin"
              variant="filled"
              type="password"
              inputMode="numeric"
              inputProps={{ maxLength: 6 }}
              value={formik.values.pin}
              onChange={formik.handleChange}
              error={formik.touched.pin && Boolean(formik.errors.pin)}
              helperText={formik.touched.pin && formik.errors.pin}
            />
          </FormControl>
          <Button css={styles.pinResetButton} type="submit" color="primary" variant="contained">
            Submit PIN
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPin;
