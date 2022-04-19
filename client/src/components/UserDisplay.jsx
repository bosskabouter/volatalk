import { identicon } from "minidenticons";

import React from "react";
import { initUser } from "../services/UserService";
import UserRegistration from "./UserRegistration";
export default class UserDisplay extends React.Component {
  constructor() {
    super();
    let user = initUser();
    this.state = {
      user: user,
      nickname: user.nickname,
      iconStr: identicon(user.peerid),
    };
  }

  render() {
    return (
      <div>
        <div>
          Username
          <br /> {this.state.user.nickname}
        </div>
        <div style={{ width: "90px" }}>
          ID icon
          <br />
          <img
            src={`data:image/svg+xml;utf8,${this.state.iconStr}`}
            alt={"Your personsal identification icon"} width={"90px" }
          />
        </div>
        <div >
          <img src={`${this.state.user.avatar}`} alt={"Your Avatar"} width={"90px" }/>
        </div>
        <UserRegistration/>
      </div>
    );
  }
}
