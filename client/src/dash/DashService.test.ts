import { DashService } from './DashService';

describe('your test suite', () => {
  window.URL.createObjectURL = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function noOp() {
    /* TODO document why this function 'noOp' is empty */
  }
  if (typeof window.URL.createObjectURL === 'undefined') {
    Object.defineProperty(window.URL, 'createObjectURL', { value: noOp });
  }

  it('your test case', async () => {
    const dashService = new DashService();
    expect(dashService).toBeDefined();

    // const reg = await dashService
    //   .registerName()
    //   .catch((e) => console.error('Something went wrong:\n', e))
    //   .finally(() => dashService.client.disconnect());
    // expect(reg).toBeDefined();
    //expect(reg.toJSON()).to

    // console.info('Name registered:\n', reg.toJSON());
  });
});
