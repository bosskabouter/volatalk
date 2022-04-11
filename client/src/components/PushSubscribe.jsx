const pubKey = "";

export default function PushSubscribe() {
  return "serviceWorker" in navigator ? (
    <button onClick={registerPush}>Subscribe Push Notifications!</button>
  ) : (
    <span>No Push Messages Available.</span>
  );
}

//check for serviceworker
function registerPush() {
  send().catch((err) => {
    console.error(err);
  });
}
//register  SW, Register Push, Send Push
async function send() {
  console.log("Registering service worker...");
  const register = await navigator.serviceWorker
    .register("./serviceWorker.js", {
      scope: "/",
    })
    .catch((err) => {
      console.error(err);
    });
  console.log("Service worker Registered...");

  window.subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(pubKey),
  });

  console.log("Push registered!", window.subscription);

  console.log("Posting Push Subscribe...");

  await fetch("/subscribe", {
    method: "POST",
    body: JSON.stringify(window.subscription),
    headers: { "content-type": "application/json" },
  });

  console.log("Push Subscribe Posted.");
}

function urlBase64ToUint8Array(base64String) {
  var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  var base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function sendMessage(subscription) {
  fetch("/subscribe", {
    method: "POST",
    body: subscription,
    headers: { "content-type": "application/json" },
  });
}
