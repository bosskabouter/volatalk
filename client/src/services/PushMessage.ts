import { encryptString, generateKeyFromString } from 'dha-encryption';
import { IContact, IMessage } from 'types';

const WEBPUSH_SERVER_ADDRESS = 'https://www.volatalk.org/subscribe';

const POST_PUSH_HTTP_STATUS_SUCCESS = 201;
/**
 * Tries to send a message through Notification Push to a contact, if he opted in for this.
 * @param message
 * @param contact
 * @returns
 */
export async function pushMessage(message: IMessage, contact: IContact): Promise<boolean> {
  if (!contact.pushSubscription) {
    console.log(`Contact without subscription. Not pushing message.`, message, contact);
    return false;
  }

  return new Promise((resolve, rejectj) => {
    //TODO encrypt with contact signature...
    const encryptedMessage = encryptString(JSON.stringify(message), generateKeyFromString('1234'));
    //body matches the expected server input
    const body = JSON.stringify({
      subscription: contact.pushSubscription,
      payload: encryptedMessage,
    });

    console.log('Posting Push message to ' + WEBPUSH_SERVER_ADDRESS, body);
    fetch(WEBPUSH_SERVER_ADDRESS, {
      method: 'POST',
      body: body,
      headers: { 'content-type': 'application/json' },
    })
      .then((resp) => {
        const success = resp.status === POST_PUSH_HTTP_STATUS_SUCCESS;
        console.log(
          `Post Push Message (${resp.status}) - (${success ? 'success' : 'failed'})`,
          resp
        );
        resolve(success);
      })
      .catch((err) => {
        console.error('Error posting push message', err, body);
        rejectj(err);
      });
  });
}
