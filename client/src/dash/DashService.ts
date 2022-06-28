import Dash from 'dash';
/**
 *
 * https://github.com/dashevo/dashcore-lib
 *
 * https://github.com/dashevo/platform/tree/master/packages/js-dash-sdk
 *
 * https://dashplatform.readme.io/docs/tutorial-register-a-name-for-an-identity
 *
 * https://github.com/dashevo/insight-api
 *
 */
export class DashService {
  constructor() {
    const clientOpts = {
      network: 'testnet',
      wallet: {
        mnemonic:
          'arena light cheap control apple buffalo indicate rare motor valid accident isolate',
        unsafeOptions: {
          skipSynchronizationBeforeHeight: 650000, // only sync from early-2022
        },
      },
    };
    const client = new Dash.Client(clientOpts);

    async function registerName() {
      const { platform } = client;

      const identity = await platform.identities.get('an identity ID goes here');
      return platform.names.register(
        '<identity name goes here>.dash',
        { dashUniqueIdentityId: identity.getId() },
        identity
      );
    }

    registerName()
      .then((d) => console.log('Name registered:\n', d.toJSON()))
      .catch((e) => console.error('Something went wrong:\n', e))
      .finally(() => client.disconnect());
  }
}
