importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-messaging-compat.js');

// Firebase configuration
firebase.initializeApp({
    // Add your Firebase configuration here
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.jpg',
        badge: '/logo.jpg',
        data: payload.data
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Example: Send a health update
await supabase
  .from('health_updates')
  .insert([
    {
      title: 'New Health Initiative',
      content: 'A new health program has been launched...',
      category: 'program'
    }
  ]);

// Example: Send an agriculture update
await supabase
  .from('agriculture_updates')
  .insert([
    {
      title: 'New Farming Technique',
      content: 'A new sustainable farming method has been discovered...',
      category: 'technique'
    }
  ]);

// Enable RLS
await supabase
  .from('notifications')
  .update({
    rowLevelSecurity: true
  });

await supabase
  .from('health_updates')
  .update({
    rowLevelSecurity: true
  });

await supabase
  .from('agriculture_updates')
  .update({
    rowLevelSecurity: true
  });

// Allow all authenticated users to read notifications
await supabase
  .from('notifications')
  .update({
    policy: 'Allow read access to all authenticated users'
  });

await supabase
  .from('health_updates')
  .update({
    policy: 'Allow read access to all authenticated users'
  });

await supabase
  .from('agriculture_updates')
  .update({
    policy: 'Allow read access to all authenticated users'
  }); 