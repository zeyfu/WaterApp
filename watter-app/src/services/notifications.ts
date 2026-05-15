import * as Notifications from "expo-notifications";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { Platform } from "react-native";
import { app } from "./firebaseConfig";

const db = getFirestore(app);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type NotificationSettings = {
  enabled: boolean;
  interval: number;
  sleepMode: boolean;
};

// --- FUNÇÕES NATIVAS ---

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#B7D0F5",
    });
  }
  return true;
}

export async function scheduleWaterNotifications(
  settings: NotificationSettings, 
  isGoalReached: boolean = false
) {
  // 1. Limpa tudo para começar do zero e evitar duplicatas
  await Notifications.cancelAllScheduledNotificationsAsync();

  // 2. Se desativado ou se a meta já foi batida, não agenda nada
  if (!settings.enabled || isGoalReached) {
    console.log("Notificações pausadas: Meta batida ou desativado.");
    return;
  }

  const now = new Date();
  const currentHour = now.getHours();

  // 3. Verificação do Modo Dormir (22h às 08h)
  if (settings.sleepMode) {
    if (currentHour >= 22 || currentHour < 8) {
      console.log("Modo dormir ativo: Silenciando até as 08h.");
      return; 
    }
  }

  // 4. Agenda a notificação
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Hora de beber água! 💧",
      body: "Mantenha sua meta em dia e sinta-se melhor.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: settings.interval * 60,
      repeats: true, 
    },
  });
}

// --- FUNÇÕES DO FIREBASE ---

export async function saveNotificationSettings(
  userId: string,
  data: NotificationSettings,
  isGoalReached: boolean = false // Adicionado para consistência
): Promise<void> {
  // Salva no Banco de Dados
  await setDoc(doc(db, "notifications", userId), data);
  
  // Aplica a configuração no celular imediatamente
  await scheduleWaterNotifications(data, isGoalReached);
}

export async function getNotificationSettings(
  userId: string,
): Promise<NotificationSettings | null> {
  const docSnap = await getDoc(doc(db, "notifications", userId));

  if (docSnap.exists()) {
    return docSnap.data() as NotificationSettings;
  }
  return null;
}