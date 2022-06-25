// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { TextEncoder, TextDecoder } from 'util';
import crypto from 'crypto';

require('jest-canvas-mock');
require('crypto');
// eslint-disable-next-line @typescript-eslint/no-var-requires
globalThis.crypto = require('crypto').webcrypto;
// Object.defineProperty(global.self, 'crypto', {
//   value: {
//     subtle: crypto.webcrypto.subtle,
//   },
// });

// globalThis.crypto = require('crypto').webcrypto;
global.TextEncoder = TextEncoder;
