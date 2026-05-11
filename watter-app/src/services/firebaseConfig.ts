import { initializeApp } from "firebase/app";

import { FirebaseOptions } from "firebase/app";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyB7jSKKxgreHgJjeFFZ6whFSfiUBkwR1dQ",

  authDomain: "water-app-c2d5e.firebaseapp.com",

  projectId: "water-app-c2d5e",

  storageBucket: "water-app-c2d5e.appspot.com",

  messagingSenderId: "57277302927",

  appId: "1:57277302927:web:5d514237f6c7f42dae48fa",

  measurementId: "G-DVM09VS05T",
};

export const app = initializeApp(firebaseConfig);
