/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useContext, useEffect, useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { DatabaseContext } from '../../providers/DatabaseProvider';

const PinReset = () => {
  const [
    pinReset,
    // setPinReset
  ] = useState(false);
  const [question1, setQuestion1] = useState('');
  const [question2, setQuestion2] = useState('');
  const theme = useTheme();
  const fullScreen = isMobile ? true : false;
  const navigate = useNavigate();
  const db = useContext(DatabaseContext);

  const validationSchema = yup.object({
    answer1: yup.string().defined('Please answer your security question').trim(),
    answer2: yup.string().defined('Please answer your security question').trim(),
  });

  const formik = useFormik({
    initialValues: {
      answer1: '',
      answer2: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values, { setErrors }) => {
      if (db !== null) {
        db.userProfile
          .get(1)
          .then((res) => {
            if (res !== undefined) {
              if (
                res.security.answer1 === values.answer1 &&
                res.security.answer2 === values.answer2
              ) {
                navigate('/newPin');
              }
            }
          })
          .catch((err) => {
            console.error(err);
          });
      }
    },
  });

  useEffect(() => {
    if (!db) return;
    console.debug('useEffect setQuestions');
    db.userProfile
      .get(1)
      .then((res) => {
        if (res !== undefined) {
          setQuestion1(res.security.question1);
          setQuestion2(res.security.question2);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [db]);

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
      padding: 3rem 1.5rem 4rem 1.5rem;
      @media only screen and (min-width: 768px) {
        padding: 4rem 4rem 4rem 4rem;
        min-height: 30rem;
        width: 38rem;
      }
    `,
    pinResetPin: css`
      width: 100%;
      background-color: ${theme.palette.common.white};
      border-radius: 0.5em;
      @media only screen and (min-width: 768px) {
        height: 3.5rem;
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
      justify-content: space-around;
      width: 100%;
      height: 100%;
      @media only screen and (min-width: 768px) {
        justify-content: space-between;
      }
    `,
  };

  return (
    <Dialog
      css={styles.pinResetDialogRoot}
      open={!pinReset}
      disableEscapeKeyDown
      maxWidth="lg"
      fullScreen={fullScreen}
    >
      <DialogContent id="dialog-agreement" css={styles.pinResetDialogContent}>
        <Typography component="h1" variant="h4">
          Reset PIN
        </Typography>
        <Typography variant="subtitle2">
          Please answer the following authentication questions to reset your pin
        </Typography>
        <form css={styles.form} onSubmit={formik.handleSubmit}>
          <FormControl css={styles.pinResetRoot} variant="standard">
            <Typography variant="subtitle1">{question1}</Typography>
            <TextField
              // defaultValue="Normal"
              required
              css={styles.pinResetAnswer}
              hiddenLabel
              id="answer1"
              variant="filled"
              value={formik.values.answer1}
              onChange={formik.handleChange}
              error={formik.touched.answer1 && Boolean(formik.errors.answer1)}
              helperText={formik.touched.answer1 && formik.errors.answer1}
            />
          </FormControl>
          <FormControl css={styles.pinResetRoot} variant="standard">
            <Typography variant="subtitle1">{question2}</Typography>
            <TextField
              // defaultValue="Normal"
              required
              css={styles.pinResetAnswer}
              hiddenLabel
              id="answer2"
              variant="filled"
              value={formik.values.answer2}
              onChange={formik.handleChange}
              error={formik.touched.answer2 && Boolean(formik.errors.answer2)}
              helperText={formik.touched.answer2 && formik.errors.answer2}
            />
          </FormControl>
          <Button css={styles.pinResetButton} type="submit" color="primary" variant="contained">
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PinReset;
