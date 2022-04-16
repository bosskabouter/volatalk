/**
 *
 */
export class Message {
  constructor(peerid, data, outgoing = true, read = true) {
    this.created = new Date();
    this.peerid = peerid;
    this.data = data;
    this.outgoing = outgoing;
    this.read = read;
    this.sent = null; //date when successfully delivered
  }
}
