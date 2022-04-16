import React from "react";
import Peer from "peerjs";
const icons = "✅✅ 🚫 ";
export default class PeerDisplay extends React.Component {
  constructor(props) {
    super(props);
    let p = new Peer(props);
    this.state = { peer: p };
  }

  componentWillUnmount() {
    this.state.peer.destroy();
  }

  handleTextChange(event) {
    this.setState({
      peer_id: event.target.value,
    });
  }

  render() {
    var result;

    if (this.state.initialized) {
      result = (
        <div>
          <div>
            <strong>"Your PeerJS ID:" {this.state.peer.id}</strong>
          </div>
          {this.state.connected
            ? this.renderConnected()
            : this.renderNotConnected()}
        </div>
      );
    } else {
      result = <div>Loading...</div>;
    }

    return result;
  }

  renderNotConnected() {
    return (
      <div>
        Not connected
      </div>
    );
  }

  renderConnected() {
    return (
      <div>
      Connected!
      </div>
    );
  }

  componentDidMount() {
    console.debug("PeerDisplay mounted");
  }
}
