import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB7jSKKxgreHgJjeFFZ6whFSfiUBkwR1dQ",
  authDomain: "water-app-c2d5e.firebaseapp.com",
  projectId: "water-app-c2d5e",
  storageBucket: "water-app-c2d5e.appspot.com",
  messagingSenderId: "57277302927",
  appId: "1:57277302927:web:5d514237f6c7f42dae48fa",
  measurementId: "G-DVM09VS05T",
};

// Inicialização do núcleo do Firebase Application Singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;

/**
 * Inicialização do serviço de Autenticação com persistência nativa.
 * Configura o AsyncStorage para reter a sessão do usuário logado no dispositivo móvel,
 * mitigando perdas de estado ao fechar o aplicativo.
 */
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

/**
 * Inicialização do banco de dados Firestore com suporte a Cache Local Persistente.
 * Habilita o gerenciamento de múltiplas abas/instâncias, garantindo que o app
 * funcione offline de forma transparente e sincronize os dados ao recuperar conexão.
 */
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export { app, auth, db };

