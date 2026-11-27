const env = import.meta.env;
export const useFirebaseEmulators = env.VITE_USE_FIREBASE_EMULATORS === 'true';
const configured = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};
export const firebaseEnabled = useFirebaseEmulators || Object.values(configured).some(Boolean);
export const firebaseOptions = useFirebaseEmulators ? {
  apiKey: 'demo-offpace-local', authDomain: 'demo-offpace.firebaseapp.com',
  projectId: 'demo-offpace', appId: '1:123:web:offpace',
} : configured;

export function validateFirebaseConfig() {
  if (!Object.values(firebaseOptions).every(Boolean)) {
    throw new Error('Firebase is enabled but the web config is incomplete. Check .env.local.');
  }
}
