import { keys } from '@mui/system';
import { VTKey } from './KeyService';

let keyService: VTKey;
test('KeyService', async () => {
  keyService = new VTKey();
  expect(keyService.mnemonic).toBeDefined();
  console.log('mnemonic: ' + keyService.mnemonic);
});
test('getSeed', async () => {
  const seed1 = await keyService.toSeedBase64url();
  const seed2 = await keyService.toSeedBase64url();

  expect(seed1).toBeDefined();

  expect(seed2).toBeDefined();
  expect(seed1 === seed2).toBeTruthy();
  console.log('Seed: ' + seed1);
});
test('validate', async () => {
  const valid: boolean = keyService.validate();
  expect(valid).toBeDefined();
  expect(valid).toBeTruthy();

  console.log('valid: ' + valid);
});
test('entropy', async () => {
  const entropy: string = keyService.toEntropy();
  expect(entropy).toBeDefined();

  console.log('entropy: ' + entropy);
});

test('KeyService entropy', async () => {
  const valid = new VTKey(keyService.toEntropy()).validate();
  expect(valid).toBeDefined();
  expect(valid).toBeTruthy();
  console.log('KeyService entropy: ' + valid);
});

test('KeyService 96e738e82362594683f1a1350be0751f entropy', async () => {
  const valid = new VTKey('96e738e82362594683f1a1350be0751f').validate();
  expect(valid).toBeDefined();
  expect(valid).toBeTruthy();
  console.log('KeyService entropy: ' + valid);
});

test('KeyService 96e738e82362594683f1a1350be0751f entropy', async () => {
  const mnem = new VTKey(keyService.toEntropy()).mnemonic;
  const same: boolean = keyService.toEntropy() === keyService.mnemonicToEntropy(mnem);

  expect(same).toBeTruthy();
  console.log('KeyService entropy: ' + mnem);
});
