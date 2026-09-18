import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase SDK はブラウザ専用なので、サーバー側プリレンダリング時には初期化しない。
const app: FirebaseApp | undefined =
  typeof window !== "undefined"
    ? getApps().length
      ? getApps()[0]
      : initializeApp(firebaseConfig)
    : undefined;

// 電波のない場所でも起動して記録できるよう IndexedDB キャッシュを有効にする。
// 書き込みはローカルに溜まり、オンラインに戻った時点で自動で同期される。
// initializeFirestore は同じappに二度呼ぶと投げるので、HMR等での再評価に備えて握る。
function createDb(instance: FirebaseApp): Firestore {
  try {
    return initializeFirestore(instance, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    return getFirestore(instance);
  }
}

export const auth = app ? getAuth(app) : (undefined as unknown as ReturnType<typeof getAuth>);
export const db = app ? createDb(app) : (undefined as unknown as Firestore);
export const googleProvider = new GoogleAuthProvider();

/** このアプリを開けるアカウント。個人用なので1つだけ。 */
export const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ALLOWED_EMAIL ?? "";
