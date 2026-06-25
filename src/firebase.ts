/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  getDocFromServer,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const { firestoreDatabaseId, ...sdkConfig } = firebaseConfig;

const app = initializeApp(sdkConfig);
export const analytics = getAnalytics(app);

// Initialize Firestore with explicit database ID support and settings
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
}, firestoreDatabaseId === '(default)' ? undefined : firestoreDatabaseId);

export const auth = getAuth();
export const storage = getStorage(app);

// Connection check as requested in instructions
async function testConnection() {
  // Wait a bit for the network stack to stabilize
  await new Promise(resolve => setTimeout(resolve, 1000));
  try {
    // Attempt to fetch a non-existent doc from server to verify connectivity
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    // Only log if it's a real connectivity issue, not a permission issue
    const isOffline = error.message?.includes('the client is offline') || error.code === 'unavailable';
    if (isOffline) {
      console.error("Firebase Connection Error: Firestore backend is unreachable. Current code:", error.code, "Message:", error.message);
    }
  }
}
testConnection();
