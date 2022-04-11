console.log("Service worker loaded");

self.addEventListener("push", (e) => {
  const data = e.data.json();
  self.registration.showNotification(data.title, {
    body: "Notified by VolaTLAK",
    icon: "https://www.volatalk.org/logo.png",
  });
});
