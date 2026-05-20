import * as Notifications from "expo-notifications";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { Platform } from "react-native";
import { app } from "./firebaseConfig";

const db = getFirestore(app);

// Configuração do comportamento global dos alertas com o aplicativo em primeiro plano
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

/**
 * Solicita as permissões de notificação do sistema operacional e, no Android,
 * registra o canal de áudio customizado vinculado ao arquivo local "waterdrop.mp3".
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return false;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("water-alerts", {
        name: "Lembretes de Água",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#B7D0F5",
        sound: "waterdrop.mp3", // Nome exato do arquivo embutido pelo plugin no app.json
      });
    }
    return true;
  } catch (error) {
    console.error("Erro ao solicitar permissões de notificação:", error);
    return false;
  }
}

/**
 * Cancela agendamentos anteriores e registra um novo lembrete intermitente
 * baseado no intervalo escolhido, respeitando travas de meta e horários restritos.
 */
export async function scheduleWaterNotifications(
  settings: NotificationSettings,
  isGoalReached: boolean = false,
): Promise<void> {
  try {
    // Evita acúmulo de processos idênticos limpando a fila local
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Regra de Negócio: Se os alertas estiverem desligados ou a meta diária batida, interrompe o fluxo
    if (!settings.enabled || isGoalReached) {
      console.log("Notificações suspensas: Meta atingida ou serviço inativo.");
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();

    // Regra de Negócio: Janela de silêncio obrigatória do Modo Dormir (entre 22h e 08h)
    if (settings.sleepMode) {
      if (currentHour >= 22 || currentHour < 8) {
        console.log("Modo dormir ativo: Lembretes silenciados até as 08h.");
        return;
      }
    }

    // Registra o gatilho recorrente com base no fuso horário do dispositivo
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hora de beber água! 💧",
        body: "Mantenha sua meta em dia e sinta-se melhor.",
        sound: "waterdrop.mp3",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: settings.interval * 60,
        repeats: true,
      },
    });
  } catch (error) {
    console.error("Erro ao agendar notificações de água:", error);
  }
}

/* ==========================================================================
   FUNÇÕES DE PERSISTÊNCIA (FIRESTORE)
   ========================================================================== */

/**
 * Salva as preferências de alertas na coleção do usuário e atualiza
 * imediatamente o motor de agendamentos do dispositivo.
 */
export async function saveNotificationSettings(
  userId: string,
  data: NotificationSettings,
  isGoalReached: boolean = false,
): Promise<void> {
  try {
    await setDoc(doc(db, "notifications", userId), data);
    await scheduleWaterNotifications(data, isGoalReached);
  } catch (error) {
    console.error("Erro ao persistir configurações de notificação:", error);
    throw error;
  }
}

/**
 * Recupera as configurações de alertas customizadas do usuário salvas no Firestore.
 */
export async function getNotificationSettings(
  userId: string,
): Promise<NotificationSettings | null> {
  try {
    const docSnap = await getDoc(doc(db, "notifications", userId));

    if (docSnap.exists()) {
      return docSnap.data() as NotificationSettings;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar configurações de notificação:", error);
    return null;
  }
}
