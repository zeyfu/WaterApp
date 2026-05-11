import { Ionicons } from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";

import * as Notifications from "expo-notifications";

import { useRouter } from "expo-router";

import { onAuthStateChanged, signOut, User } from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";

import { useEffect, useState } from "react";

import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth } from "../src/services/auth";

import { app } from "../src/services/firebaseConfig";

import { addWaterLog } from "../src/services/firestore";

import { calculateGoal, getWeather } from "../src/services/weather";

import WaterGlass from "../src/components/WaterGlass";

import HistoryCard from "../src/components/HistoryCard";
import StreakBadge from "../src/components/StreakBadge";

const db = getFirestore(app);

type HistoryItem = {
  date: string;
  total: number;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  const [goal, setGoal] = useState<number>(0);

  const [goalAdjusted, setGoalAdjusted] = useState<number>(0);

  const [temperature, setTemperature] = useState<number | null>(null);

  const [water, setWater] = useState<number>(0);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [customAmount, setCustomAmount] = useState<string>("");

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const router = useRouter();

  const [streak, setStreak] = useState<number>(0);

  // 🔐 auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔔 permissão
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  // 📊 dados
  useEffect(() => {
    if (!user) return;

    const fetchData = async (): Promise<void> => {
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));

        let userGoal = 2000;

        if (docSnap.exists()) {
          userGoal = docSnap.data().goal || 2000;

          setGoal(userGoal);
        }

        // 🌡️ clima
        const temp = await getWeather();

        setTemperature(temp);

        const adjusted = calculateGoal(userGoal, temp);

        setGoalAdjusted(adjusted);

        // 📅 hoje
        const today = new Date().toISOString().split("T")[0];

        const snapshot = await getDocs(
          query(
            collection(db, "waterLogs"),

            where("userId", "==", user.uid),

            where("date", "==", today),
          ),
        );

        let total = 0;

        snapshot.forEach((doc) => {
          total += doc.data().amount;
        });

        setWater(total);

        // 📜 histórico
        const historySnap = await getDocs(
          query(
            collection(db, "waterLogs"),

            where("userId", "==", user.uid),
          ),
        );

        const data: Record<string, number> = {};

        historySnap.forEach((doc) => {
          const { date, amount } = doc.data();

          if (!data[date]) {
            data[date] = 0;
          }

          data[date] += amount;
        });

        // 🔥 streak real
        let currentStreak = 0;

        const sortedHistory = Object.entries(data)
          .map(([date, total]) => ({
            date,
            total,
          }))
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );

        for (const day of sortedHistory) {
          if (day.total >= adjusted) {
            currentStreak++;
          } else {
            break;
          }
        }

        setStreak(currentStreak);

        // 📜 histórico formatado
        const formattedHistory: HistoryItem[] = Object.entries(data)
          .map(([date, total]) => ({
            date,
            total,
          }))
          .reverse();

        setHistory(formattedHistory);
      } catch (error) {
        console.log("Erro Home:", error);
      }
    };

    fetchData();
  }, [user]);

  // 🎯 meta final
  const currentGoal = goalAdjusted || goal;

  const progress = currentGoal > 0 ? water / currentGoal : 0;

  const percentage = Math.min(progress * 100, 100);

  // 🔔 notificação
  const scheduleNotification = async (): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hora de beber água 💧",

        body: "Não esqueça de se hidratar!",
      },

      trigger: {
        seconds: 3600,
        repeats: true,
      } as Notifications.TimeIntervalTriggerInput,
    });
  };

  // 🚪 logout
  const handleLogout = async (): Promise<void> => {
    await signOut(auth);

    router.replace("/");
  };

  // 💧 adicionar água
  const addWaterAmount = async (amount: number): Promise<void> => {
    if (!user) return;

    await addWaterLog(user.uid, amount);

    setWater((prev) => prev + amount);

    setModalVisible(false);
  };

  const addCustomWater = async (): Promise<void> => {
    if (!user) return;

    const amount = Number(customAmount);

    if (!amount) return;

    await addWaterAmount(amount);

    setCustomAmount("");
  };

  if (!user) {
    return (
      <Text
        style={{
          padding: 20,
        }}
      >
        Carregando...
      </Text>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#B7D0F5", "#8FB8EE", "#78A6E5"]}
        style={{
          flex: 1,

          paddingTop: 55,

          paddingHorizontal: 20,
        }}
      >
        {/* TOPO */}
        <View style={topBar}>
          <Ionicons
            name="person-circle"
            size={34}
            color="#1C4A99"
            onPress={() => router.push("/profile" as any)}
          />

          <Ionicons
            name="notifications"
            size={28}
            color="#1C4A99"
            onPress={scheduleNotification}
          />

          <Ionicons
            name="log-out-outline"
            size={30}
            color="#1C4A99"
            onPress={handleLogout}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 👋 saudação */}
          <View
            style={{
              marginBottom: 20,
            }}
          >
            <Text style={hello}>Continue se hidratando 💧</Text>

            <Text style={subtitleText}>Seu progresso de hoje</Text>
          </View>

          {/* 🥛 CARD COPO */}
          <View style={glassCard}>
            {/* glow */}
            <View style={glassGlow} />

            <WaterGlass percentage={percentage} />

            {/* 🌡️ temperatura */}
            {temperature !== null && (
              <Text
                style={{
                  marginTop: -10,

                  color: "#1C4A99",

                  fontWeight: "600" as const,
                }}
              >
                🌡️ {temperature}°C
              </Text>
            )}
          </View>

          {/* 📊 métricas */}
          <View style={statsRow}>
            <View style={miniCard}>
              <Text style={miniValue}>{currentGoal}</Text>

              <Text style={miniLabel}>Meta</Text>
            </View>

            <View style={miniCard}>
              <Text style={miniValue}>{water}</Text>

              <Text style={miniLabel}>Consumido</Text>
            </View>

            <View style={miniCard}>
              <Text style={miniValue}>{percentage.toFixed(0)}%</Text>

              <Text style={miniLabel}>Hoje</Text>
            </View>
          </View>

          {/* 📈 barra */}
          <View style={progressSection}>
            <View style={progressBackground}>
              <View
                style={[
                  progressFill,
                  {
                    width: `${percentage}%`,
                  },
                ]}
              />
            </View>

            <Text
              style={{
                marginTop: 10,

                color: "#1C4A99",

                fontWeight: "600" as const,
              }}
            >
              {currentGoal - water > 0
                ? `Faltam ${currentGoal - water} ml`
                : "Meta atingida 🎉"}
            </Text>
          </View>

          {/* 🔥 streak fake */}
          <StreakBadge streak={streak} />

          {/* 📜 histórico */}
          <HistoryCard history={history} currentGoal={currentGoal} />

          <View
            style={{
              height: 120,
            }}
          />
        </ScrollView>
      </LinearGradient>

      {/* ➕ FAB */}
      <TouchableOpacity style={fab} onPress={() => setModalVisible(true)}>
        <Text style={fabText}>+</Text>
      </TouchableOpacity>

      {/* 📦 modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={modalOverlay}>
          <View style={modal}>
            {[200, 250, 500].map((amt) => (
              <TouchableOpacity
                key={amt}
                style={button}
                onPress={() => addWaterAmount(amt)}
              >
                <Text style={buttonText}>+{amt} ml</Text>
              </TouchableOpacity>
            ))}

            <TextInput
              placeholder="Quantidade personalizada"
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="numeric"
              style={input}
            />

            <TouchableOpacity style={button} onPress={addCustomWater}>
              <Text style={buttonText}>Adicionar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text
                style={{
                  textAlign: "center" as const,

                  color: "#1C4A99",

                  fontWeight: "600" as const,
                }}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* 🎨 estilos */

const topBar = {
  flexDirection: "row" as const,

  justifyContent: "space-between" as const,

  marginBottom: 25,
};

const hello = {
  fontSize: 28,

  fontWeight: "700" as const,

  color: "#1C4A99",
};

const subtitleText = {
  marginTop: 5,

  color: "#355E9B",

  fontSize: 15,
};

const glassCard = {
  backgroundColor: "rgba(255,255,255,0.10)",

  paddingVertical: 10,

  alignItems: "center" as const,

  marginBottom: 10,
};

const glassGlow = {
  position: "absolute" as const,

  width: 220,

  height: 220,

  borderRadius: 999,

  backgroundColor: "rgba(120,180,255,0.12)",

  top: 40,
};

const statsRow = {
  flexDirection: "row" as const,

  justifyContent: "space-between" as const,

  marginBottom: 25,
};

const miniCard = {
  width: "31%" as const,

  backgroundColor: "rgba(255,255,255,0.72)",

  borderRadius: 22,

  paddingVertical: 18,

  alignItems: "center" as const,

  shadowColor: "#1C4A99",

  shadowOpacity: 0.08,

  shadowRadius: 5,

  elevation: 3,
};

const miniValue = {
  fontSize: 24,

  fontWeight: "700" as const,

  color: "#1C4A99",
};

const miniLabel = {
  marginTop: 5,

  color: "#5A7FB5",
};

const progressSection = {
  backgroundColor: "rgba(255,255,255,0.60)",

  borderRadius: 25,

  padding: 20,

  marginBottom: 20,
};

const progressBackground = {
  height: 7,

  backgroundColor: "rgba(255,255,255,0.4)",

  borderRadius: 999,

  overflow: "hidden" as const,
};

const progressFill = {
  height: "100%" as const,
  backgroundColor: "#1C4A99",
  borderRadius: 999,
  shadowColor: "#1C4A99",
  shadowOpacity: 0.35,
  shadowRadius: 6,
};

const streakCard = {
  backgroundColor: "rgba(255,255,255,0.65)",

  padding: 18,

  borderRadius: 22,

  marginBottom: 25,

  alignItems: "center" as const,
};

const streakText = {
  fontSize: 15,
  fontWeight: "700",
  color: "#E67E22",
};

const historyTitle = {
  fontSize: 22,

  fontWeight: "700" as const,

  color: "#1C4A99",

  marginBottom: 15,
};

const historyCard = {
  backgroundColor: "rgba(255,255,255,0.75)",

  padding: 18,

  borderRadius: 22,

  marginBottom: 15,
};

const button = {
  backgroundColor: "#1C4A99",

  padding: 15,

  borderRadius: 14,

  marginBottom: 10,
};

const buttonText = {
  color: "#fff",

  textAlign: "center" as const,

  fontWeight: "700" as const,
};

const input = {
  backgroundColor: "rgba(240,248,255,0.9)",

  padding: 14,

  borderRadius: 14,

  marginBottom: 10,
};

const fab = {
  position: "absolute" as const,

  bottom: 30,

  right: 30,

  backgroundColor: "#1C4A99",

  width: 70,

  height: 70,

  borderRadius: 35,

  justifyContent: "center" as const,

  alignItems: "center" as const,

  shadowColor: "#1C4A99",

  shadowOpacity: 0.45,

  shadowRadius: 10,

  shadowOffset: {
    width: 0,
    height: 5,
  },

  elevation: 10,
};

const fabText = {
  color: "#fff",

  fontSize: 34,

  fontWeight: "700" as const,
};

const modalOverlay = {
  flex: 1,

  backgroundColor: "rgba(0,0,0,0.35)",

  justifyContent: "center" as const,

  padding: 20,
};

const modal = {
  backgroundColor: "#EEF6FF",

  padding: 20,

  borderRadius: 25,
};
