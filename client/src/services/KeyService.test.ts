import { VTKey } from './VTKey';

let vtKey: VTKey;
test('KeyService Default constructor', async () => {
  vtKey = new VTKey();
  expect(vtKey.mnemonic).toBeDefined();
  console.log('mnemonic: ' + vtKey.mnemonic);
});

test('getSeed', async () => {
  const seed1 = vtKey.toSeedBase64url();
  const seed2 = vtKey.toSeedBase64url();

  expect(seed1).toBeDefined();

  expect(seed2).toBeDefined();
  expect(seed1 === seed2).toBeTruthy();
  console.log('Seed: ' + seed1);
});

test('getSeed', async () => {
  const seed1 = vtKey.toSeedBase64url();
  const seed2 = vtKey.toSeedBase64url();

  expect(seed1).toBeDefined();

  expect(seed2).toBeDefined();
  expect(seed1 === seed2).toBeTruthy();
  console.log('Seed: ' + seed1);
});

test('validate', async () => {
  const valid: boolean = vtKey.validate();
  expect(valid).toBeDefined();
  expect(valid).toBeTruthy();

  console.log('valid: ' + valid);
});

test('entropy', async () => {
  const entropy: string = vtKey.toEntropy();
  expect(entropy).toBeDefined();

  console.log('entropy: ' + entropy);
});

test('KeyService entropy', async () => {
  const valid = new VTKey(vtKey.toEntropy()).validate();
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
  const mnem = new VTKey(vtKey.toEntropy()).mnemonic;
  //const same: boolean = keyService.toEntropy() === keyService.mnemonicToEntropy(mnem);

  // expect(same).toBeTruthy();
  console.log('KeyService entropy: ' + mnem);
});

test('KeyService 96e738e82362594683f1a1350be0751f entropy', async () => {
  const password = 'abc123';
  const seed1 = new VTKey().toSeed(password);

  //const same: boolean = keyService.toEntropy() === keyService.mnemonicToEntropy(mnem);

  // expect(same).toBeTruthy();
});
