export interface IInvite {
  peerid: string;
  text: string;
  signature: ArrayBuffer;
}

// defines the interface for the db
export interface IUserProfile extends IContactResume {
  id?: string;

  /**
   * Securtity context, not serialized in connection metadata
   */
  security: Security;

  /**
   * bridge to signal ServiceWorkerWrapper to save subscription
   */
  usePush: boolean;

  /**
   * User wants GPS tracking
   * Basically to make formik understand the switch...
   */
  useGps: boolean;
}

export interface Security {
  /**
   * Private KEY for public peer id key,
   */
  privateKey: string;

  /**
   * User option to secure account with pin
   */
  isSecured: boolean;

  /**
   *  Indicates if user uses a pin secured context
   */
  pin: string;

  /**
   * Recovery questions/answers
   */
  question1: string;
  answer1: string;
  question2: string;
  answer2: string;
}
/**
 * Basic UserInfo serialized in connection metadata
 */
export interface IContactResume {
  peerid: string;
  dateRegistered: Date;

  nickname: string;

  avatar: string;
  avatarThumb: string;

  position: GeolocationCoordinates | null;
  pushSubscription: PushSubscription | null;
}

/**
 * Full contact information, for local use. Excluded from serialization in metadata
 *
 */
export interface IContact extends IContactResume {
  /* was pure signature ArrayBuffer, but encryption db could not save.
  Now is a JSON string
  */
  signature: string;

  dateTimeCreated: number;
  dateTimeAccepted: number;
  dateTimeDeclined: number;
  dateTimeResponded: number;

  favorite: boolean;
}

/**
 * A classification based on contacts current status
 */
export type IContactClass = 'new' | 'wait' | 'block' | 'fav' | 'unread' | 'rest';

/**
 * Basic Data Message object
 * TODO : split in different Message types;
 *
 * receive-confirm
 * read-confirm
 *
 */
export interface IMessage {
  //auto generated id
  id?: number;

  //peerid of sender
  sender: string;

  //peerid of receiver
  receiver: string;

  //data sent
  payload: string;

  dateTimeCreated: number;

  /**
   * timestamp when pushed, or http error code if failed
   */
  dateTimePushed: number;

  /**
   * Timestamp when successfully transmitted p2p
   */
  dateTimeSent: number;

  /**
   * Timestamp when successfully received through p2p
   */
  dateTimeReceived: number;

  /**
   * Timestamp when user opens the message
   */
  dateTimeRead: number;

  /**
   * Boolean to give urgency to the message. Notification will be
   */
  urgent?: boolean;
}
