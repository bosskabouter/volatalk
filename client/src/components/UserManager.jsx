import { identicon } from "minidenticons";

import React from "react";

export default class UserManager extends React.Component {
  user = { nickname: "Paul2", id: "297931" };

  constructor() {
    super();
    this.state = {
      user: this.user,
    };

    this.iconStr = identicon(this.user.id);
    console.info("iconStr " + this.iconStr);
  }
  render() {
    return (
      <div>
        <span>{this.user.nickname}</span>
        <span style={{ width: "20px" }}>
          <img
            src={`data:image/svg+xml;utf8,${this.iconStr}`}
            alt={"Your personsal identification icon"}
          />
        </span>
      </div>
    );
  }
}

export class User {}
