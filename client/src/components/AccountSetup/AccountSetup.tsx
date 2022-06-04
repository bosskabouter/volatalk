/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ChangeEvent, useContext, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import { useFormik } from 'formik';
import * as yup from 'yup';
import { isMobile } from 'react-device-detect';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { UserContext } from '../../providers/UserProvider';
import { DatabaseContext } from '../../providers/DatabaseProvider';
import { IUserProfile } from '../../types';
import { AuthContext } from '../../providers/AuthProvider';
import { exportCryptoKey, generateKeyPair, peerIdFromPublicKey } from '../../services/Crypto';
import { requestFollowMe } from '../../util/geo/GeoLocation';
import { notifyMe } from '../../services/PushMessage';
import { setCreated, setIsSecure } from '../../store/slices/accountSlice';
import { resizeFileUpload } from '../../services/Generic';
import { DistanceFromMiddleEarth } from 'util/geo/Distance';
import { questions } from './SecurityQuestions';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      autoWidth: true,
    },
  },
};

const AccountSetup = () => {
  const { authenticated, setAuthenticated } = useContext(AuthContext);
  const { setUser } = useContext(UserContext);
  const dispatch = useDispatch();
  const theme = useTheme();
  const fullScreen = isMobile ? true : false;
  const navigate = useNavigate();
  const db = useContext(DatabaseContext);

  const userCtx = useContext(UserContext);

  const [currentPosition, setCurrentPosition] = useState(userCtx.user?.position);

  const validationSchemaSecure = yup.object({
    nickname: yup
      .string()
      .defined('Enter a nice nickname people will recognize')
      .min(3, 'Nickname must be at least 6 characters')
      .trim(),
    isSecured: yup.boolean(),
    pin: yup.string().when('isSecured', {
      is: true,
      then: yup
        .string()
        .defined('Enter a valid pin')
        .min(6, 'Pin must be at least 6 characters')
        .matches(/^\d+$/, 'Pin must only contain numbers')
        .trim(),
    }),
    question1: yup.string().when('isSecured', {
      is: true,
      then: yup.string().defined('Please enter a security question').trim(),
    }),
    answer1: yup.string().when('isSecured', {
      is: true,
      then: yup.string().defined('Please enter an answer to your security question').trim(),
    }),
    question2: yup.string().when('isSecured', {
      is: true,
      then: yup.string().defined('Please enter a security question').trim(),
    }),
    answer2: yup.string().when('isSecured', {
      is: true,
      then: yup.string().defined('Please enter an answer to your security question').trim(),
    }),
  });

  const formik = useFormik<IUserProfile>({
    initialValues: userCtx.user || {
      nickname: 'Anonymous',
      avatar: 'https://thispersondoesnotexist.com/image?reload=' + Math.random(),

      isSecured: false,
      isSearchable: true, //unused. .where to publish profile ?
      pin: '',
      question1: '',
      answer1: '',
      question2: '',
      answer2: '',

      peerid: '',
      privateKey: '',

      dateRegistered: new Date(),

      useGps: false,
      position: null,

      usePush: false,
      pushSubscription: null,
    },

    validationSchema: validationSchemaSecure,

    onSubmit: (values: IUserProfile) => {
      //gps coords are not controlled by formik
      values.position = currentPosition;
      if (authenticated) updateUser(values);
      else registerUser(values);
    },
  });

  function updateUser(values: IUserProfile) {
    if (!db) return;
    //only update input fields (private key /peerid isnt one)
    if (!values.isSecured) {
      //clear recovery questions
      values.pin = '';
      values.question1 = '';
      values.question2 = '';
      values.answer1 = '';
      values.answer2 = '';
    }

    //only 1 user, for now
    db.userProfile.put(values, 1);
    console.log('Updated user', values);
    setUser(values);
    navigate('/', { replace: true });
  }

  /**
   * Register a new user, by generating a keyPairge
   * @param values from form containing user data
   */
  function registerUser(values: IUserProfile) {
    generateKeyPair().then((keyPair) => {
      if (!keyPair) {
        return;
      }
      const publicCryptoKey: CryptoKey = keyPair.publicKey;
      if (publicCryptoKey === undefined) return;
      exportCryptoKey(publicCryptoKey).then((pubKey) => {
        //convert pubKey to peerid (base64 encoded json.tostring)
        values.peerid = peerIdFromPublicKey(pubKey);
        console.log('Peerid: ' + values.peerid);

        exportCryptoKey(keyPair.privateKey).then((jsonPrivateKey) => {
          console.log(
            'exportCryptoKey(keyPair.privateKey).then((jsonPrivateKey) => ',
            jsonPrivateKey
          );

          values.privateKey = JSON.stringify(jsonPrivateKey);

          // Save to database
          if (db !== null) {
            //only 1 user, for now
            db.userProfile
              .put(values, 1)
              .then(() => {
                dispatch(setCreated());
                if (formik.values.isSecured) {
                  dispatch(setIsSecure());
                }
                setUser(values);

                setAuthenticated(true);

                if (values.usePush) {
                  //reload the app to activate service worker
                  //  document.location = document.location.origin;
                }
                //dont need reload for service worker activation, go directly
                //else
                navigate('/');
              })
              .catch((err) => {
                console.error(err);
              });
          }
        });
      });
    });
  }

  const styles = {
    accountSetupDialogRoot: css`
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      color: ${theme.palette.common.white};
    `,
    accountSetupDialogContent: css`
      background-color: ${theme.palette.primary.main};
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      height: 100%;
      color: ${theme.palette.common.white};
      @media only screen and (min-width: 768px) {
        padding: 2rem 4rem 2rem 4rem;
        min-height: 30rem;
        width: 38rem;
      }
    `,
    avatarUploadDiv: css`
      position: relative;
      overflow: hidden;
      top: 0;
      right: 0;
      margin: 0;
      padding: 27px;
      width: 150px;
      height: 150px;
      align: 'center';
    `,
    avatarUploadImage: css`
      width: 100%;
      height: 100%;
    `,
    avatarUploadButton: css`
      position: absolute;
      top: 0;
      right: 0;
      margin: 0;
      padding: 0;
      font-size: 20px;
      cursor: pointer;
      opacity: 0;
      filter: alpha(opacity=0);
      width: 100%;
      height: 100%;
    `,
    accountNickname: css`
      width: 100%;
      background-color: ${theme.palette.common.white};
      border-radius: 0.5em;
      @media only screen and (min-width: 768px) {
        height: 3.5rem;
      }
    `,
    accountSecureButton: css`
      padding: ${theme.spacing(3)};
      width: 63%;

      min-height: 40px;
      border-radius: 20;
      //background: black;
    `,
    accountPin: css`
      width: 100%;
      background-color: ${theme.palette.common.white};
      border-radius: 0.5em;
      @media only screen and (min-width: 768px) {
        height: 3.5rem;
      }
    `,
    accountQuestionRoot: css`
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 1.5rem;
    `,
    accountQuestionSelect: css`
      border-radius: 0.3em;
      font-size: calc(7px + (16 - 10) * ((100vw - 300px) / (1600 - 300)));
      background-color: ${theme.palette.common.white};
    `,
    accountQuestionMenu: css`
      font-size: calc(7px + (16 - 10) * ((100vw - 300px) / (1600 - 300)));
    `,
    accountQuestionAnswer: css`
      background-color: ${theme.palette.common.white};
      border-radius: 0.5em;
      margin-top: 0.5rem;
      input[type='text'] {
        font-size: calc(7px + (16 - 10) * ((100vw - 300px) / (1600 - 300)));
      }
    `,
    accountSetupButton: css`
      width: 100%;
      min-height: 20px;
      border-radius: 20;
    `,
    form: css`
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
    `,
  };

  /**
   * Only permit closing if user already registered, otherwise do not close
   * @param e
   */
  function handleClose() {
    console.log('User trying to close AccountSetup', userCtx.user);
    if (userCtx.user) navigate('/');
  }

  /**
   * Requests geo location and saves it state for user profile, if permitted.
   * Handles uncontrolled property user.position
   */
  async function handleGPS(e: ChangeEvent<HTMLInputElement>, checked: boolean) {
    console.debug('Current position', currentPosition);
    formik.handleChange(e);
    const pos = checked ? await requestFollowMe() : null;

    console.debug('Setting user position', pos);
    setCurrentPosition(pos);

    //formik.setTouched(formik.values.useGps);
  }

  /**
   * Enables or disables pushsubscription notification service.
   * @param _e
   * @param checked
   */
  async function handlePush(e: ChangeEvent<HTMLInputElement>, checked: boolean) {
    console.info('Notification checked ' + checked);
    formik.handleChange(e);
    if (checked)
      notifyMe(); //test notification. The actual registration of push subscription is done in ServiceWorkerWrapper
    else {
      console.info('Clearing subscription data');
      formik.values.pushSubscription = null;
    }
    // formik.setTouched(usePush);
  }

  return (
    <Dialog
      css={styles.accountSetupDialogRoot}
      open={true}
      onClose={handleClose}
      //only allow escape when already registered before
      disableEscapeKeyDown={!userCtx.user}
      //TransitionComponent={}
      transitionDuration={{ enter: 1500 }}
      maxWidth="lg"
      fullScreen={fullScreen}
    >
      <DialogContent id="dialog-agreement" css={styles.accountSetupDialogContent}>
        <Typography component="h1" variant="h6">
          Profile settings
        </Typography>

        <form css={styles.form} onSubmit={formik.handleSubmit}>
          <Typography variant="subtitle1">Your nickname: </Typography>

          <TextField
            required
            css={styles.accountNickname}
            id="nickname"
            //  variant="standard"
            type="text"
            inputMode="text"
            inputProps={{ maxLength: 60 }}
            value={formik.values.nickname}
            onChange={formik.handleChange}
            error={formik.touched.nickname && Boolean(formik.errors.nickname)}
            //helperText={formik.touched.nickname && formik.errors.nickname}
          />

          <div css={styles.avatarUploadDiv}>
            <Avatar src={formik.values.avatar} css={styles.avatarUploadImage}></Avatar>
            <input
              css={styles.avatarUploadButton}
              aria-label="avatar"
              id="file"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={(event) => {
                if (!event.target.files) return;
                resizeFileUpload(event.target.files[0], 150, 150).then((src) => {
                  formik.setFieldValue('avatar', src);
                });
              }}
              multiple={false}
            />
          </div>
          <Box>
            <FormControlLabel
              label={
                formik.values.usePush
                  ? `Subscribed to offline messages!`
                  : `Notify when I'm offline!`
              }
              control={
                <Switch
                  checked={formik.values.usePush}
                  id="usePush"
                  value={formik.values.usePush}
                  onChange={handlePush}
                />
              }
            />

            <FormControlLabel
              label={
                currentPosition != null
                  ? `Your are ${DistanceFromMiddleEarth(
                      currentPosition
                    )} km. away from Middle Earth`
                  : 'Enable Location Sharing'
              }
              control={
                <Switch
                  //    defaultChecked={formik.values.useGps}
                  checked={formik.values.useGps}
                  id="useGps"
                  value={formik.values.useGps}
                  onChange={handleGPS}
                />
              }
            />
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                css={styles.accountSecureButton}
                name="isSecured"
                //label="isSecured"
                //defaultValue={formik.values.isSecured}
                id="isSecured"
                checked={formik.values.isSecured}
                onChange={formik.handleChange}
                color={formik.values.isSecured ? 'default' : 'error'}
                icon={<LockOpenIcon />}
                checkedIcon={<LockIcon></LockIcon>}
              />
            }
            label={formik.values.isSecured ? "I don't need security" : 'Secure my account'}
          />
          {formik.values.isSecured && (
            <Box>
              <Typography variant="subtitle1">6 digit security PIN</Typography>

              <TextField
                css={styles.accountPin}
                id="pin"
                variant="outlined"
                type="password"
                inputMode="numeric"
                inputProps={{ maxLength: 6 }}
                value={formik.values.pin}
                onChange={formik.handleChange}
                error={formik.touched.pin && Boolean(formik.errors.pin)}
                //helperText={(formik.touched.pin? formik.errors.pin)}
              />
              <Typography variant="subtitle1">Recovery questions</Typography>
              <FormControl css={styles.accountQuestionRoot} variant="standard">
                <Select
                  css={styles.accountQuestionSelect}
                  displayEmpty
                  id="question1"
                  name="question1"
                  input={<OutlinedInput />}
                  MenuProps={MenuProps}
                  inputProps={{ 'aria-label': 'Without label' }}
                  //variant="standard"
                  value={formik.values.question1}
                  onChange={formik.handleChange}
                  error={formik.touched.question1 && Boolean(formik.errors.question1)}
                >
                  <MenuItem css={styles.accountQuestionMenu} disabled value="">
                    <em>Select your first authentication question</em>
                  </MenuItem>
                  {questions.map((question) => (
                    <MenuItem css={styles.accountQuestionMenu} key={question} value={question}>
                      {question}
                    </MenuItem>
                  ))}
                </Select>
                <TextField
                  css={styles.accountQuestionAnswer}
                  placeholder="First authentication answer"
                  id="answer1"
                  name="answer1"
                  value={formik.values.answer1}
                  variant="outlined"
                  onChange={formik.handleChange}
                  error={formik.touched.answer1 && Boolean(formik.errors.answer1)}
                />
              </FormControl>
              <FormControl css={styles.accountQuestionRoot} variant="standard">
                <Select
                  css={styles.accountQuestionSelect}
                  displayEmpty
                  id="question2"
                  name="question2"
                  input={<OutlinedInput />}
                  MenuProps={MenuProps}
                  inputProps={{ 'aria-label': 'Without label' }}
                  variant="standard"
                  value={formik.values.question2}
                  onChange={formik.handleChange}
                >
                  <MenuItem css={styles.accountQuestionMenu} disabled value="">
                    <em>Select your second authentication question</em>
                  </MenuItem>
                  {questions.map((question) => (
                    <MenuItem css={styles.accountQuestionMenu} key={question} value={question}>
                      {question}
                    </MenuItem>
                  ))}
                </Select>
                <TextField
                  css={styles.accountQuestionAnswer}
                  placeholder="Second authentication answer"
                  id="answer2"
                  name="answer2"
                  value={formik.values.answer2}
                  variant="outlined"
                  onChange={formik.handleChange}
                  error={formik.touched.answer2 && Boolean(formik.errors.answer2)}
                />
              </FormControl>
            </Box>
          )}

          <Button css={styles.accountSetupButton} type="submit" color="primary" variant="contained">
            Enter VolaTALK
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default AccountSetup;
