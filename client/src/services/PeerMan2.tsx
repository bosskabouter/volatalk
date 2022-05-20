import { Component } from 'react';

import { IContact, IMessage, IUserProfile } from 'types';
import { getLocalDateString } from './Generic';
import { PeerManager } from './PeerManager';

interface PeerManProps {
  user: IUserProfile;
  peer: PeerManager;
  contact: IContact;
}
interface PeerManState {
  message: IMessage;
  messages: Array<IMessage>;
  friendId: string;
}

const cleanMessage: IMessage = {
  id: 0,
  payload: '',
  sender: '',
  receiver: '',
  dateTimeCreated: new Date().getTime(),
  dateTimeSent: 0,
  dateTimeReceived: 0,
  dateTimeRead: 0,
};
class PeerMan2 extends Component<PeerManProps, PeerManState> {
  // static contextType = UserContext;

  constructor(props: PeerManProps) {
    super(props);
    this.state = {
      message: cleanMessage,
      messages: [],
      friendId: '',
    };
  }
  myVideo: HTMLVideoElement | null | undefined;
  friendVideo: HTMLVideoElement | null | undefined;

  componentDidMount() {
    this.props.peer.on('connection', (conn) => {
      conn.on('data', (data: IMessage) => {
        this.setState({
          messages: [...this.state.messages, data],
        });
      });
    });

    this.props.peer.on('call', (call: unknown) => {
      /*
      const getUserMedia =
        navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      getUserMedia({ video: true, audio: false }, (stream: MediaStream | undefined) => {
        this.myVideo.srcObject = stream;
        this.myVideo.play();

        call.answer(stream);

        call.on('stream', (remoteStream) => {
          this.friendVideo.srcObject = remoteStream;
          this.friendVideo.play();
        });
      });
   
    */
      alert('Receiving call: ' + call);
    });
  }

  send = () => {
    this.props.peer?.sendText(this.state.message.payload, this.state.message.receiver);
    this.setState({
      messages: [...this.state.messages, this.state.message],
      message: cleanMessage,
    });
  };

  videoCall = () => {
    /*
    const getUserMedia =
      navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    getUserMedia({ video: true, audio: true }, (stream: any) => {
      this.myVideo.srcObject = stream;
      this.myVideo.play();

      const call = this.state.peer.call(this.state.friendId, stream);

      call.on('stream', (remoteStream) => {
        this.friendVideo.srcObject = remoteStream;
        this.friendVideo.play();
      });
    });*/
  };

  render() {
    return (
      <div className="wrapper">
        <div className="col">
          <h1>
            My ID:
            <input type="text" value={this.props.user.peerid} readOnly />
          </h1>
          <label>Friend ID:</label>
          <input
            type="text"
            value={this.state.friendId}
            onChange={(e) => {
              this.setState({ friendId: e.target.value });
            }}
          />

          <br />
          <br />

          <label>Message:</label>
          <input
            type="text"
            value={this.state.message?.payload}
            onChange={(e) => {
              this.setState({
                message: {
                  id: 0,
                  sender: this.props.user.peerid,
                  receiver: this.state.friendId,
                  dateTimeCreated: new Date().getTime(),
                  payload: e.target.value,
                  dateTimeRead: 0,
                  dateTimeReceived: 0,
                  dateTimeSent: 0,
                },
              });
            }}
          />
          <button onClick={this.send}>Send</button>

          <button onClick={this.videoCall}>Video Call</button>
          {this.state.messages.map((message, i) => {
            return (
              <div key={i}>
                <h3>{message.sender}:</h3>
                <p>{message.payload}</p>
                <p>{getLocalDateString(new Date(message.dateTimeCreated))}</p>
              </div>
            );
          })}
        </div>

        <div className="col">
          <div>
            <video ref={(ref) => (this.myVideo = ref)} />
          </div>
          <div>
            <video ref={(ref) => (this.friendVideo = ref)} />
          </div>
        </div>
      </div>
    );
  }
}

export default PeerMan2;
