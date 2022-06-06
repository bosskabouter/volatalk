export type WebRTCUser = {
  id: string;
  email: string;
  stream: MediaStream;
};
export interface IInvite {
  peerId: string;
  text: string;
  signature: ArrayBuffer;
}

export interface ConnectionMetadata {
  //me as a contact for the other side
  contact: IContact;
  //my personal signature for this contact
  signature: string;
}
// defines the interface for the db
export interface IUserProfile {
  id?: string;

  /**
   * Indicates if user uses a pin secured context
   */
  isSecured: boolean;
  /**
   * Indicates if user wants to be be searchable by nickname. PeerManager will instantiate a second peer connection using the user's nickname.
   */
  isSearchable: boolean;

  pin: string;
  question1: string;
  answer1: string;
  question2: string;
  answer2: string;

  peerid: string;
  privateKey: string;

  nickname: string;
  avatar: string;
  avatarMini: string;

  dateRegistered: Date;

  usePush: boolean; //bridge to signal ServiceWorkerWrapper to save subscription
  pushSubscription: PushSubscription | null;

  useGps: boolean; //basically to make formik understand the switch...
  position: GeolocationCoordinates | null;
}

export interface IContact {
  peerid: string;
  signature: ArrayBuffer;

  nickname: string;
  dateTimeCreated: number;

  dateTimeAccepted: number;
  dateTimeDeclined: number;
  //?
  dateTimeResponded: number;

  avatar: string;
  position: GeolocationCoordinates | null;
  pushSubscription: PushSubscription | null;
}
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
