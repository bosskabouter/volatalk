/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ChangeEvent, SyntheticEvent, useContext } from 'react';
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

const questions = [
  'In what city did you meet your first spouse/partner?',
  'In what city did your parents meet?',
  'In what city does your nearest sibling live?',
  'In what city was your father born?',
  'In what city was your first job?',
  'In what city was your mother born?',
  "What city were you in on New Year's 2000?",
  'What is the last name of your favorite teacher in high school?',
  "What is the name of a college you applied to but didn't attend?",
  "What is your father's middle name?",
  'What is your favorite food?',
  "What is your maternal grandmother's first and last name?",
  "What is your mother's middle name?",
  "What is your oldest sibling's middle name?",
  "What is your paternal grandfather's first and last name?",
  "What is your youngest sibling's middle name?",
  'What school did you attend for sixth grade?',
  'What was the first and last name of your childhood best friend?',
  'What was the first and last name of your first significant other?',
  'What was the last name of your favorite grade school teacher?',
  'What was the make and model of your first car or motorcycle?',
  'What was the name of the first school you attended?',
  'What was the name of the hospital in which you were born?',
  'What was the name of the street of your first childhood home?',
  'What was the name of your childhood hero?',
  'What was the name of your favorite stuffed animal?',
  'What was the name of your first pet?',
  'What was your childhood nickname?',
  'What was your favorite sport in high school?',
  'What was your first job?',
  'What were the last four digits of your childhood telephone number?',
  'When you were young, what did you want to be when you grew up?',
  'Who is the most famous person you have ever met?',
];

const AccountSetup = () => {
  const { authenticated, setAuthenticated } = useContext(AuthContext);
  const { setUser } = useContext(UserContext);
  const dispatch = useDispatch();
  const theme = useTheme();
  const fullScreen = isMobile ? true : false;
  const navigate = useNavigate();
  const db = useContext(DatabaseContext);

  const userCtx = useContext(UserContext);

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

  const formik = useFormik({
    //   validateOnChange: true,
    //  validateOnBlur: true,
    initialValues: userCtx.user || {
      nickname: 'Anonymous',
      avatar: 'https://thispersondoesnotexist.com/image?reload=' + Math.random(),

      isSecured: false, //unused. .where to publish profile ?
      isSearchable: true,
      pin: '',
      question1: '',
      answer1: '',
      question2: '',
      answer2: '',

      peerid: '',
      privateKey: '',

      dateRegistered: new Date(),
      position: null,
      usePush: false,
      pushSubscription: null,
    },

    validationSchema: validationSchemaSecure,

    onSubmit: (values) => {
      if (authenticated) updateUser(values);
      else registerUser(values);
      //formik.setSubmitting(false);
    },
  });

  function updateUser(values: IUserProfile) {
    // Save to database
    if (db !== null) {
      //only update input fields (private key /peerid isnt one)
      if (!values.isSecured) {
        //clear recovery questions
        values.pin = '';
        values.question1 = '';
        values.question2 = '';
        values.answer1 = '';
        values.answer2 = '';
      }
      db.userProfile.put(values, 1);
      setUser(values);
      //navigate('/', { replace: false });
    }
  }

  /**
   *
   * @param values from form
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
                  document.location = document.location.origin;
                }
                //else navigate('/');
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
   * Only permit closing if user already registered
   * @param e
   */
  function handleClose(_e: SyntheticEvent) {
    console.log('User trying to close AccountSetup', userCtx.user);
    if (userCtx.user) navigate('/');
  }

  /**
   * Requests geo location and saves it state for user profile, if permitted.
   */
  async function handleGPS(e: ChangeEvent<HTMLInputElement>, checked: boolean) {
    console.info('GPS checked ' + checked);
    formik.handleChange(e);
    if (checked) {
      const pos = await requestFollowMe();
      console.log('User position', pos);
      formik.values.position = pos;
    } //reset
    else formik.values.position = null;

    formik.setTouched(formik.values.position);
  }

  /**
   * Enables or disables pushsubscription notification service.
   * @param _e
   * @param checked
   */
  async function handleUsePush(e: ChangeEvent<HTMLInputElement>, checked: boolean) {
    console.info('Notification checked ' + checked);
    formik.handleChange(e);
    if (checked)
      notifyMe(); //test notification. The actual registration of push subscription depends on the saved boolean usePush in UserProfile
    else {
      console.info('Clearing subscription data');
      formik.values.pushSubscription = null;
    }
    formik.setTouched(formik.values.usePush);
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
            // helperText={formik.touched.nickname && formik.errors.nickname}
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
                  onChange={handleUsePush}
                />
              }
            />

            <FormControlLabel
              label={
                formik.values.position
                  ? `Your are ${DistanceFromMiddleEarth(
                      formik.values.position
                    )} km. away from Middle Earth`
                  : 'Enable Location Sharing'
              }
              control={
                <Switch
                  defaultChecked={formik.values.position !== null}
                  name="position"
                  //value={formik.values.position}
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
