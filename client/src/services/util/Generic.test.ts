import {
  convertAbToBase64,
  convertBase58ToObject,
  convertBase64ToAb,
  convertObjectToBase58,
  round,
} from './Generic';

test('round to decimal', () => {
  const rounded = round(0.11, 1);
  expect(rounded).toBe(0.1);
  expect(rounded).not.toBe(0.11);
  expect(rounded).not.toBe(0.2);
});

const aString = 'a b c 3 2 1';

const b64 = 'TXVsdGliYXNlIGlzIGF3ZXNvbWUhIFxvLw==';
let anAb: ArrayBuffer;

test('convertBase64ToAb', () => {
  anAb = convertBase64ToAb(b64);
  expect(anAb).toBeDefined();
  //expect(anAb.length).toBeGreaterThan(aString.length);
});
test('convertAbToBase64', () => {
  const stringBack = convertAbToBase64(anAb);
  expect(stringBack).toBeDefined();
  expect(stringBack).toEqual(b64);
});

let b58: string;
const anObj = { theString: aString, anotherThing: Number('1') };
test('convertObjectToBase58', () => {
  b58 = convertObjectToBase58(anObj);
  expect(b58).toBeDefined();
  //expect(anAb.length).toBeGreaterThan(aString.length);
});
test('convertBase58ToObject', () => {
  const objBack = convertBase58ToObject(b58);
  expect(objBack).toBeDefined();
  expect(objBack).toEqual(anObj);
});
