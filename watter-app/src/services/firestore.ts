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

type UserData = {
  name?: string;
  email?: string;
  weight?: number;
  age?: number;
  birthDate?: string;
  gender?: string;
  goal?: number;
  bestStreak?: number;
};

type WaterLog = {
  userId: string;
  date: string;
  amount: number;
  currentGoal: number;
};

export const saveUserData = async (
  userId: string,
  data: UserData,
): Promise<void> => {
  await setDoc(doc(db, "users", userId), data);
};

export const updateUserData = async (
  userId: string,
  data: Partial<UserData>,
): Promise<void> => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, data);
};

export const addWaterLog = async (
  userId: string,
  amount: number,
  currentGoal: number,
): Promise<void> => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localToday = new Date(now.getTime() - offset)
    .toISOString()
    .split("T")[0];

  const waterLog: WaterLog = {
    userId,
    date: localToday,
    amount,
    currentGoal,
  };

  await addDoc(collection(db, "waterLogs"), waterLog);
};
