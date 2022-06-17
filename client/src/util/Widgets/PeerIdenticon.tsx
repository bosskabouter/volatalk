import Identicon, { IdenticonOptions } from 'identicon.js';

export const PeerIdenticon = ({ peerid }: { peerid: string }) => {
  const options: IdenticonOptions = {
    //foreground: [0, 0, 0, 255], // rgba black
    //background: [255, 255, 255, 255], // rgba white
    margin: 0.1, // 20% margin
    size: 256, // 256px square
    format: 'svg', // use SVG instead of PNG
  };

  const idString = cyrb53(peerid); //.substring(207, 245);
  console.log(idString);

  const identicon = 'data:image/svg+xml;base64,' + new Identicon(idString, options).toString();
  console.info('identicon', identicon);
  return identicon;
};

const cyrb53 = function (str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
};
