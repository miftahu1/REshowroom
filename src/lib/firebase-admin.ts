
import * as admin from 'firebase-admin';

// Check if the service account JSON is available, otherwise, this will fail.
if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  throw new Error('The FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
}

// Parse the service account key from the environment variable.
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON as string);

// Initialize the app if it's not already initialized.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

const db = admin.firestore();

export { admin, db };
