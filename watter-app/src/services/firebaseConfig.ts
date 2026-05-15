import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeAuth, 
  getAuth, 
  getReactNativePersistence 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyB7jSKKxgreHgJjeFFZ6whFSfiUBkwR1dQ",
  authDomain: "water-app-c2d5e.firebaseapp.com",
  projectId: "water-app-c2d5e",
  storageBucket: "water-app-c2d5e.appspot.com",
  messagingSenderId: "57277302927",
  appId: "1:57277302927:web:5d514237f6c7f42dae48fa",
  measurementId: "G-DVM09VS05T",
};


const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };