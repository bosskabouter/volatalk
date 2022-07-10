import { IContact } from 'types';
import { AppDatabase } from './Database';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { Provider } from 'react-redux';

import store from 'store/store';
import DatabaseProvider from 'providers/DatabaseProvider';
const db = new AppDatabase();

export const aContact: IContact = {
  signature: '123',
  dateTimeCreated: 0,
  dateTimeAccepted: 0,
  dateTimeDeclined: 0,
  dateTimeResponded: 0,
  peerid: '4241sdsfs-34',
  dateRegistered: new Date(),
  nickname: 'test',
  avatar: 'rgrg',
  avatarThumb: 'rgrg',
  position: null,
  pushSubscription: null,
  favorite: false,
};

test('should create', async () => {
  expect(db).toBeDefined();
});
// test('should insert aContact', async () => {
//      const key = await db.contacts.add(aContact);
//      expect(key).toBeDefined();
// });

test(
  'Database provider',
  async () => {
    const { queryByTestId } = render(
      <BrowserRouter>
        <Provider store={store}>
          <DatabaseProvider>
            <em>dd</em>
          </DatabaseProvider>
        </Provider>
      </BrowserRouter>
    );

    //    expect(queryByTestId('solely_for_jesttest')).toBeInTheDocument();
  },
  30 * 100
);
