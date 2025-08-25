importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "your api key",
  authDomain: "demoproject-2f4cb.firebaseapp.com",
  projectId: "demoproject-2f4cb",
  storageBucket: "demoproject-2f4cb.appspot.com",  
  messagingSenderId: "371774821665",
  appId: "1:371774821665:web:89d8509e16f039a6f29a60",
  measurementId: "G-KJBYN1CK4T"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log(" Received background message: ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.png" 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
