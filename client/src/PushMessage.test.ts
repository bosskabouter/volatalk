import { aContact } from 'Database/Database.test';
import pushMessage from 'services/push/PushMessage';
import { IMessage } from 'types';

export const aSubscription: PushSubscription = JSON.parse(
  `{"endpoint":"https://fcm.googleapis.com/fcm/send/fPzbDHJG3h8:APA91bFCR_GXQmt59H2G5SsSv79i_QHcUKXPB_AJi9bkaRmnX_QhEz5oHHQHcK2owIKUzfTVEzSHrA_dJfdMS1_UaTRGbH6yq1leBlvIiYkwgso_aEKbQWNs9gM1QTJqV51iU_03mEmv","expirationTime":null,"keys":{"p256dh":"BI78i4OgoG80PILKj8fCpb3CvxiV9WQKuCo7Ql8ZE1m5FaY7Z1WrHTjqJsDkHfJMCr8fIMnR9SBU0BCw5Ku0ps8","auth":"eDcZ-WotIC-9y5QWgYpYOw"}}`
);

export const aMessage: IMessage = {
  sender: '',
  receiver: '',
  payload: '',
  dateTimeCreated: 0,
  dateTimePushed: 0,
  dateTimeSent: 0,
  dateTimeReceived: 0,
  dateTimeRead: 0,
};
test('should Push', async () => {
  expect.assertions(1);
  //global.fetch = fetch;

  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

  aContact.pushSubscription = aSubscription;
  const result = await pushMessage(aMessage, aContact);
  expect(result).toBeDefined();
  // expect(result).toBeLessThan(500);
  //TODO: mock fetch
});
