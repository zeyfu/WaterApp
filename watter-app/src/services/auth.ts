import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  UserCredential,
} from "firebase/auth";

import { app } from "./firebaseConfig";

const auth = getAuth(app);

// 📝 cadastro
export const registerUser = (
  email: string,
  password: string,
): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// 🔐 login
export const loginUser = (
  email: string,
  password: string,
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export { auth };

