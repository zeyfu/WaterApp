import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  Auth
} from "firebase/auth";

// Importamos o auth do seu arquivo de configuração
import * as firebaseConfig from "./firebaseConfig"; 

// Aqui a gente força o tipo explicitamente para matar o erro de 'any'
const auth = firebaseConfig.auth as Auth;

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