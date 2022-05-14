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
export interface IConnectionMetadata {
  peerid: string;
  signature: string;
  nickname: string;
  avatar: string;
  dateRegistered: Date;
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
}

export interface IContact {
  peerid: string;
  nickname: string;
  dateCreated: Date;

  signature: ArrayBuffer;
  avatar?: string;

  dateResponded?: Date;

  accepted?: boolean;
  declined?: boolean;
}
export interface IMessage {
  id?: number;

  sender: string;
  receiver: string;
  dateCreated: Date;
  dateSent?: Date;
  dateReceived?: Date;
  dateRead?: Date;
  payload: string;
}
