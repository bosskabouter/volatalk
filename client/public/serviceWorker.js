/* eslint-disable no-restricted-globals */
console.log("Service worker loaded");

self.addEventListener("push", (e) => {
  const data = e.data.json();
  self.registration.showNotification(data.title, {
    body: "VolaTALK Pushed",
    icon: "https://www.volatalk.org/logo.png",
  });
});
