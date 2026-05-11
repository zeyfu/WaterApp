import {
  addDoc,
  collection,
  doc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { app } from "./firebaseConfig";

const db = getFirestore(app);

// 👤 tipo do usuário
type UserData = {
  name?: string;
  email?: string;
  weight?: number;
  age?: number;
  gender?: string;
  goal?: number;
};

// 💧 tipo do consumo
type WaterLog = {
  userId: string;
  date: string;
  amount: number;
};

// salvar usuário
export const saveUserData = async (
  userId: string,
  data: UserData,
): Promise<void> => {
  await setDoc(doc(db, "users", userId), data);
};

// atualizar usuário
export const updateUserData = async (
  userId: string,
  data: Partial<UserData>,
): Promise<void> => {
  const userRef = doc(db, "users", userId);

  await updateDoc(userRef, data);
};

// adicionar consumo
export const addWaterLog = async (
  userId: string,
  amount: number,
): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];

  const waterLog: WaterLog = {
    userId,
    date: today,
    amount,
  };

  await addDoc(collection(db, "waterLogs"), waterLog);
};
