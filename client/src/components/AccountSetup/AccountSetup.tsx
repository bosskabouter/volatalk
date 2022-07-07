/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ChangeEvent, useContext, useState } from 'react';

import {
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

import { notifyMe } from '../../services/PushMessage';
import { setCreated, setIsSecure } from '../../store/slices/accountSlice';
import { DistanceFromMiddleEarth } from 'util/geo/Distance';
import { questions } from './SecurityQuestions';
import { requestFollowMe } from 'services/LocationService';
import enrollUser from 'services/UserService';
import { ImageUploader } from 'components/ImageUploader';

const ITEM_HEIGHT = 18;
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
  const { user, setUser } = useContext(UserContext);
  const dispatch = useDispatch();
  const theme = useTheme();
  const fullScreen = isMobile ? true : false;
  const navigate = useNavigate();
  const db = useContext(DatabaseContext);

  const [currentPosition, setCurrentPosition] = useState<GeolocationCoordinates | null>(
    user?.position ? user.position : null
  );

  const validationSchema = yup.object({
    nickname: yup
      .string()
      .defined('Enter a nice nickname people will recognize')
      .min(2, 'Nickname must be at least 2 characters')
      .trim(),

    security: yup.object({
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
      answer1: yup.string().when('security.isSecured', {
        is: true,
        then: yup.string().defined('Please enter an answer to your security question').trim(),
      }),
      question2: yup.string().when('security.isSecured', {
        is: true,
        then: yup.string().defined('Please enter a security question').trim(),
      }),
      answer2: yup.string().when('security.isSecured', {
        is: true,
        then: yup.string().defined('Please enter an answer to your security question').trim(),
      }),
    }),
  });

  const randImage = () =>
    'https://thispersondoesnotexist.com/image?notRandomImage=' + Math.round(Math.random() * 100);

  //TODO: try to (a) fetch the image and save in profile, or (b) cache the specific URL for this image in service worker
  const userHasAvatar = user?.avatar?.length > randImage.length - 3;

  //use a random image if user doesn't have one

  const [avatarData, setAvatarData] = useState(userHasAvatar ? user.avatar : randImage);

  const formik = useFormik<IUserProfile>({
    initialValues: user || {
      dateRegistered: new Date(),

      peerid: '',

      nickname: 'Anonymous',

      avatar: avatarData,
      avatarThumb: avatarData,

      security: {
        privateKey: '',
        isSecured: false,
        pin: '',
        question1: '',
        answer1: '',
        question2: '',
        answer2: '',
      },

      useGps: false,
      position: null,

      usePush: false,
      pushSubscription: null,
    },

    validationSchema: validationSchema,

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
    if (!values.security.isSecured) {
      //clear recovery questions
      values.security.pin = '';
      values.security.question1 = '';
      values.security.question2 = '';
      values.security.answer1 = '';
      values.security.answer2 = '';
    }

    //only 1 user, for now
    db.userProfile.put(values, 1);
    setUser(values);
    navigate('/', { replace: true });
  }

  /**
   * Register a new user, by generating a keyPair
   * @param aUser from form containing user data
   */
  async function registerUser(aUser: IUserProfile) {
    if (!db) throw Error('No DB');
    await enrollUser(aUser);
    // Save to database

    //only 1 user, for now
    db.userProfile.put(aUser, 1).then(() => {
      dispatch(setCreated());
      if (formik.values.security.isSecured) {
        dispatch(setIsSecure());
      }
      setUser(aUser);

      setAuthenticated(true);

      if (aUser.usePush) {
        //reload the app to activate service worker
        //  document.location = document.location.origin;
      }
      //dont need reload for service worker activation, go directly
      //else
      navigate('/');
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
      #background: black;
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
    console.debug('User trying to close AccountSetup', user);
    if (user) navigate('/');
  }

  /**
   * Requests geo location and saves it state for user profile, if permitted.
   * Handles uncontrolled property user.position
   */
  async function handleGPS(e: ChangeEvent<HTMLInputElement>, checked: boolean) {
    formik.handleChange(e);
    const pos = checked ? await requestFollowMe() : null;

    setCurrentPosition(pos);

    //formik.setTouched(formik.values.useGps);
  }

  /**
   * Enables or disables pushsubscription notification service.
   * @param e
   * @param checked
   */
  async function handlePush(e: ChangeEvent<HTMLInputElement>, checked: boolean) {
    formik.handleChange(e);
    if (checked)
      notifyMe(); //test notification. The actual registration of push subscription is done in ServiceWorkerWrapper
    else {
      formik.values.pushSubscription = null;
    }
  }
  return (
    <Dialog
      css={styles.accountSetupDialogRoot}
      open={true}
      onClose={handleClose}
      //only allow escape when already registered before
      disableEscapeKeyDown={!user}
      //TransitionComponent={}
      transitionDuration={{ enter: 1500 }}
      maxWidth="lg"
      fullScreen={fullScreen}
      scroll={'paper'}
    >
      <DialogContent id="dialog-agreement" css={styles.accountSetupDialogContent}>
        <Typography variant="h5">Profile settings</Typography>

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
          <ImageUploader
            source={avatarData}
            onUploaded={(base64EncodedUpload, base64EncodedUploadThumb) => {
              formik.setFieldValue('avatar', base64EncodedUpload);
              formik.setFieldValue('avatarThumb', base64EncodedUploadThumb);
              setAvatarData(base64EncodedUpload);
            }}
          />
          <Typography
            variant={'overline'}
            onClick={() => {
              formik.setFieldValue('avatar', randImage);
              formik.setFieldValue('avatarThumb', randImage);
              setAvatarData(randImage);
            }}
          >
            * thispersondoesnotexist.com
          </Typography>

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
                  ? `Your are ${DistanceFromMiddleEarth(currentPosition)} km from Middle Earth`
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
                name="security.isSecured"
                //label="isSecured"
                //defaultValue={formik.values.isSecured}
                id="security.isSecured"
                checked={formik.values.security?.isSecured}
                onChange={formik.handleChange}
                color={formik.values.security?.isSecured ? 'default' : 'error'}
                icon={<LockOpenIcon />}
                checkedIcon={<LockIcon></LockIcon>}
              />
            }
            label={
              formik.values.security?.isSecured ? "I don't need security" : 'Secure my account'
            }
          />
          {formik.values.security.isSecured && (
            <Box>
              <Typography variant="subtitle1">6 digit security PIN</Typography>

              <TextField
                css={styles.accountPin}
                id="security.pin"
                variant="outlined"
                type="password"
                inputMode="numeric"
                inputProps={{ maxLength: 6 }}
                value={formik.values.security?.pin}
                onChange={formik.handleChange}
                error={formik.touched.security?.pin && Boolean(formik.errors.security?.pin)}
                //helperText={(formik.touched.pin? formik.errors.pin)}
              />
              <Typography variant="subtitle1">Recovery questions</Typography>
              <FormControl css={styles.accountQuestionRoot} variant="standard">
                <Select
                  css={styles.accountQuestionSelect}
                  displayEmpty
                  id="security.question1"
                  name="security.question1"
                  input={<OutlinedInput />}
                  MenuProps={MenuProps}
                  inputProps={{ 'aria-label': 'Without label' }}
                  //variant="standard"
                  value={formik.values.security?.question1}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.security?.question1 && Boolean(formik.errors.security?.question1)
                  }
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
                  id="security.answer1"
                  name="security.answer1"
                  value={formik.values.security?.answer1}
                  variant="outlined"
                  onChange={formik.handleChange}
                  error={
                    formik.touched.security?.answer1 && Boolean(formik.errors.security?.answer1)
                  }
                />
              </FormControl>
              <FormControl css={styles.accountQuestionRoot} variant="standard">
                <Select
                  css={styles.accountQuestionSelect}
                  displayEmpty
                  id="security.question2"
                  name="security.question2"
                  input={<OutlinedInput />}
                  MenuProps={MenuProps}
                  inputProps={{ 'aria-label': 'Without label' }}
                  variant="standard"
                  value={formik.values.security?.question2}
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
                  id="security.answer2"
                  name="security.answer2"
                  value={formik.values.security?.answer2}
                  variant="outlined"
                  onChange={formik.handleChange}
                  error={
                    formik.touched.security?.answer2 && Boolean(formik.errors.security?.answer2)
                  }
                />
              </FormControl>
            </Box>
          )}

          <Button css={styles.accountSetupButton} type="submit" color="primary" variant="contained">
            {!authenticated ? 'Enter VolaTALK' : 'UPDATE PROFILE'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default AccountSetup;
