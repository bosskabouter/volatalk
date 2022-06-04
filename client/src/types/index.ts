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

  dateRegistered: Date;

  usePush: boolean; //bridge to signal ServiceWorkerWrapper to save subscription
  pushSubscription: PushSubscription | null;

  useGps: boolean; //basically to make formik understand the switch...
  position: GeolocationPosition | null;
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
  position: GeolocationPosition | null;
  pushSubscription: PushSubscription | null;
}
export interface IMessage {
  id?: number;

  sender: string;
  receiver: string;
  payload: string;

  dateTimeCreated: number;

  dateTimePushed: number;
  dateTimeSent: number;
  dateTimeReceived: number;
  dateTimeRead: number;
}
