/**
 * data container for local user
 */
export default class User {
  privateKey;
  publicKey;

  peerid;
  nickname;

  dateReg;
  remember;
  loggedin;

  avatar;

  /**
   *
   * @param {*} peerid
   * @param {*} publicKey
   * @param {*} privateKey
   */
  constructor(peerid, publicKey, privateKey) {
    if (!peerid || !publicKey || !privateKey) throw Error("User needs keys");
    this.peerid = peerid;
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.dateReg = new Date();
    this.remember = true;
    this.loggedin = true;
    this.nickname = "";
  }
}

User.prototype.toString = function () {
  return JSON.stringify(this);
};
