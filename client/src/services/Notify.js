/**
 * https://mdn.github.io/to-do-notifications/
 */


export const enabled = Notification.permission === "granted";

export function askNotificationPermission() {
  // function to actually ask the permissions
  function handlePermission(permission) {
    // Whatever the user answers, we make sure Chrome stores the information
    if (!("permission" in Notification)) {
      Notification.permission = permission;
    }

  }

  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications.");
  } else {
    if (checkNotificationPromise()) {
      Notification.requestPermission().then((permission) => {
        handlePermission(permission);
      });
    } else {
      Notification.requestPermission(function (permission) {
        handlePermission(permission);
      });
    }
  }
}

// Function to check whether browser supports the promise version of requestPermission()
// Safari only supports the old callback-based version
function checkNotificationPromise() {
  try {
    Notification.requestPermission().then();
  } catch (e) {
    return false;
  }

  return true;
}

// function for creating the notification
function notifyUser(titleText, bodyText) {
  if (!enabled) {
    alert(titleText + "\r\n\r\n" + bodyText);
    return;
  }
  // Create and show the notification
  let img = "./ico/mstile-150x150.png";
  let notification = new Notification(titleText, { body: bodyText, icon: img });
  console.debug("Created notification: " + notification);
}
