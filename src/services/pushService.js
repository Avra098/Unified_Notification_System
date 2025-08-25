import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export async function sendPush(payload){
  console.log(" [PushService] Incoming push payload:", JSON.stringify(payload, null, 2));

  const { token, title, body, data = {} } = payload;

  if (!token || typeof token !== "string" || !token.trim()) {
    console.error(" Push payload missing valid token:", token);
    throw new Error("Push payload missing valid 'token'");
  }
  if (!title || !body) {
    throw new Error("Push payload must include title and body");
  }

  const message = {
    token: token.trim(),
    notification: { title, body },
    data
  };

  console.log(" Final FCM message object:", JSON.stringify(message, null, 2));

  try {
    const response = await admin.messaging().send(message);
    console.log(" Push notification sent:", response);
    return { success: true, data: response };
  } catch (error) {
    console.error(" Error sending push notification:", error);
    return {
      success: false,
      error: error.message || "Unknown push notification error",
    };
  }
};
