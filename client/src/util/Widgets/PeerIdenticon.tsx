import Identicon, { IdenticonOptions } from 'identicon.js';

export const PeerIdenticon = ({ peerid }: { peerid: string }) => {
  const options: IdenticonOptions = {
    //foreground: [0, 0, 0, 255], // rgba black
    //background: [255, 255, 255, 255], // rgba white
    margin: 0.1, // 20% margin
    size: 256, // 256px square
    format: 'svg', // use SVG instead of PNG
  };

  const idString = peerid.substring(225, 252);
  const identicon = 'data:image/svg+xml;base64,' + new Identicon(idString, options).toString();
  console.info('identicon', identicon);
  return identicon;
};
