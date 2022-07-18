import BIP32Factory from 'bip32';
import { BIP32Interface } from 'bip32';
//import * as ecc from 'tiny-secp256k1';
import { entropyToMnemonic } from 'bip39';
// You must wrap a tiny-secp256k1 compatible implementation

import * as bip39 from 'bip39';

export class VTKey {
  mnemonic: string;

  constructor(entropy?: string | Buffer) {
    // Generate a random mnemonic (uses crypto.randomBytes under the hood), defaults to 128-bits of entropy
    this.mnemonic = entropy ? entropyToMnemonic(entropy) : bip39.generateMnemonic();

    // const bip32 = BIP32Factory(ecc);

    // const node: BIP32Interface = bip32.fromBase58(
    //   'xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi'
    // );

    //const child: BIP32Interface = node.derivePath('m/0/0');

    // const b32 = BIP32Factory(ecc);
    //const restored = bitcoin.then(btc=>{btc.Psbt.fromBuffer(this.toSeed())} );
  }
  validate(): boolean {
    return bip39.validateMnemonic(this.mnemonic);
  }
  toEntropy() {
    return bip39.mnemonicToEntropy(this.mnemonic);
  }
  toSeed(password?: string): Buffer {
    return bip39.mnemonicToSeedSync(this.mnemonic, password);
  }

  toSeedBase64url(password?: string): string {
    return this.toSeed(password).toString('base64url');
  }
  toSeedHex(password?: string): string {
    return this.toSeed(password).toString('hex');
  }
  static validateMnemonic(aMnemonic: string): boolean {
    return bip39.validateMnemonic(aMnemonic);
  }

  static entropyToMnemonic(entropy: string | Buffer) {
    return entropyToMnemonic(entropy);
  }
  static mnemonicToEntropy(mnemonic: string) {
    return bip39.mnemonicToEntropy(mnemonic);
  }

  async doStuf() {
    bip39.mnemonicToSeedSync('basket actual');
    // => <Buffer 5c f2 d4 a8 b0 35 5e 90 29 5b df c5 65 a0 22 a4 09 af 06 3d 53 65 bb 57 bf 74 d9 52 8f 49 4b fa 44 00 f5 3d 83 49 b8 0f da e4 40 82 d7 f9 54 1e 1d ba 2b ...>

    // mnemonicToSeed has an synchronous version
    // mnemonicToSeedSync is less performance oriented
    bip39.mnemonicToSeed('basket actual').then(console.log);
    // => <Buffer 5c f2 d4 a8 b0 35 5e 90 29 5b df c5 65 a0 22 a4 09 af 06 3d 53 65 bb 57 bf 74 d9 52 8f 49 4b fa 44 00 f5 3d 83 49 b8 0f da e4 40 82 d7 f9 54 1e 1d ba 2b ...>

    bip39
      .mnemonicToSeed('basket actual')
      .then((bytes) => bytes.toString('hex'))
      .then(console.log);
    // => '5cf2d4a8b0355e90295bdfc565a022a409af063d5365bb57bf74d9528f494bfa4400f53d8349b80fdae44082d7f9541e1dba2b003bcfec9d0d53781ca676651f'

    bip39.mnemonicToSeedSync('basket actual', 'a password');
    // => <Buffer 46 16 a4 4f 2c 90 b9 69 02 14 b8 fd 43 5b b4 14 62 43 de 10 7b 30 87 59 0a 3b b8 d3 1b 2f 3a ef ab 1d 4b 52 6d 21 e5 0a 04 02 3d 7a d0 66 43 ea 68 3b ... >

    bip39.validateMnemonic('basket actual');
  }
}
