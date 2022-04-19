
console.log("Push Service worker loaded");
let self = this.self;

self.addEventListener("push", (e) => {
  const data = e.data.json();
  self.registration.showNotification(data.title, {
    body: "VolaTALK Pushed",
    icon: "https://www.volatalk.org/logo.png",
  });
});
