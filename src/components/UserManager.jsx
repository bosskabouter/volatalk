import { identicon } from "minidenticons";

export default function UserManager() {
  let user = { nickname: "Paul", id: "29793" };
  let identiconEl = identicon(user.id);
  return (
    <div>
      <span>{user.nickname}</span>
      <div>{identiconEl}</div>
    </div>
  );
}
