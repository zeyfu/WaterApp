import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

import { app } from "./firebaseConfig";

const db = getFirestore(app);

// 🔔 tipo das notificações
type NotificationSettings = {
  enabled: boolean;
  interval: number;
};

// salvar config
export async function saveNotificationSettings(
  userId: string,
  data: NotificationSettings,
): Promise<void> {
  await setDoc(doc(db, "notifications", userId), data);
}

// buscar config
export async function getNotificationSettings(
  userId: string,
): Promise<NotificationSettings | null> {
  const docSnap = await getDoc(doc(db, "notifications", userId));

  if (docSnap.exists()) {
    return docSnap.data() as NotificationSettings;
  }

  return null;
}
