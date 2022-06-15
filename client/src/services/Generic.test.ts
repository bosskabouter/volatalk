import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;

import {
  convertAbToBase64,
  convertBase58ToObject,
  convertBase64ToAb,
  convertHexToString,
  convertObjectToBase58,
  convertStringToHex,
  round,
} from './Generic';

test('round to decimal', () => {
  const rounded = round(0.11, 1);
  expect(rounded).toBe(0.1);
  expect(rounded).not.toBe(0.11);
  expect(rounded).not.toBe(0.2);
});

const aString = 'a b c 3 2 1';
let aHex: string;
test('convertStringToHex', () => {
  aHex = convertStringToHex(aString);
  expect(aHex).toBeDefined();
  expect(aHex.length).toBeGreaterThan(aString.length);
});
test('convertHexToString', () => {
  const stringBack = convertHexToString(aHex);
  expect(stringBack).toBeDefined();
  expect(stringBack).toEqual(aString);
});

const b64: string = 'TXVsdGliYXNlIGlzIGF3ZXNvbWUhIFxvLw==';
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
