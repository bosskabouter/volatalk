import { identicon } from "minidenticons";

import React from "react";



export default class UserManager extends React.Component {
  user = { nickname: "Paul2", id: "297931" };
  
  constructor(props) {
    super(props);
    identicon(this.user.id);
  }
  render() {
    return (
      <div>
        <span>{this.user.nickname}</span>
        <identicon-svg username={this.user.id} />
      </div>
    );
  }
}
