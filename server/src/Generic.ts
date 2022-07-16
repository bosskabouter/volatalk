import { encode, decode } from '@web3pack/base58-check';
/**
 *
 * @param value https://stackoverflow.com/questions/7342957/how-do-you-round-to-1-decimal-place-in-javascript
 * @param precision
 * @returns
 */
export function round(value: number, precision: number): number {
  const multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertObjectToBase58(o: any): string {
  return convertStringToBase58(JSON.stringify(o));
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertBase58ToObject(b58: string): any | null {
  return JSON.parse(convertBase58ToString(b58));
}
export function convertStringToBase58(s: string): string {
  return convertBufToBase58(Buffer.from(s));
}
export function convertBase58ToString(b58: string): string {
  return convertBase58ToBuf(b58).toString();
}
export function convertBufToBase58(buf: Buffer): string {
  return encode(buf);
}
export function convertBase58ToBuf(b58: string): Buffer {
  return decode(b58);
}

export function convertBase64ToAb(base64: string) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export function convertAbToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}



export function ENV_VARN(varName: string, defaults: number): number {
  return Number(ENV_VAR(varName, "" + defaults));
}
export function ENV_VARB(varName: string): boolean {
  return ENV_VAR(varName, "false") === "false";
}
export function ENV_VAR(varName: string, defaults: string): string {
  let val = process.env[varName];
  val = val?.trim();

  console.log(
    varName + (!val ? " [UNDEFINED] Using default: " + defaults : ": " + val)
  );

  return val?.trim() || defaults;
}
