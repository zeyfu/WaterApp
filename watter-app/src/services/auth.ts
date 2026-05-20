import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import { Platform } from "react-native";
import * as firebaseConfig from "./firebaseConfig";

const auth = firebaseConfig.auth as Auth;

// Inicialização da API nativa do Google Sign-In para dispositivos móveis
GoogleSignin.configure({
  webClientId:
    "57277302927-j3cu22pu9vmr8bb4cqkie86plcklhus7.apps.googleusercontent.com",
});

/**
 * Cria uma nova credencial de usuário utilizando e-mail e senha.
 */
export const registerUser = (
  email: string,
  password: string,
): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Realiza a autenticação de um usuário existente através de e-mail e senha.
 */
export const loginUser = (
  email: string,
  password: string,
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Executa a autenticação via Google Sign-In.
 * Este método detecta automaticamente o ambiente operacional do app:
 * - Em ambiente Web: Utiliza o fluxo de autenticação por Pop-up do Firebase.
 * - Em ambiente Nativo: Aciona o SDK nativo do Google Play Services.
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  // 1. Fluxo de Execução: Navegador (Web)
  if (Platform.OS === "web") {
    try {
      const provider = new GoogleAuthProvider();
      return await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(
        "Erro no serviço de autenticação Google Sign-In (Web):",
        error,
      );
      throw error;
    }
  }

  // 2. Fluxo de Execução: Dispositivo Móvel (Android / iOS Nativo)
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const response = await GoogleSignin.signIn();
    const idToken = response.data?.idToken;

    if (!idToken) {
      throw new Error(
        "O token de identidade (ID Token) do Google não foi gerado.",
      );
    }

    const credential = GoogleAuthProvider.credential(idToken);
    return await signInWithCredential(auth, credential);
  } catch (error) {
    console.error(
      "Erro no serviço de autenticação Google Sign-In (Nativo):",
      error,
    );
    throw error;
  }
};

export { auth };

