import admin from "firebase-admin";

const initializeAdmin = () => {
  if (admin.apps.length) {
    return admin.app();
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY in environment variables");
  }

  let serviceAccount: admin.ServiceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountKey) as admin.ServiceAccount;
  } catch {
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON format");
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};

export const getFirestore = () => {
  initializeAdmin();
  return admin.firestore();
};

export const getMessaging = () => {
  initializeAdmin();
  return admin.messaging();
};
