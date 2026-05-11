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

// 🌡️ clima
import { calculateGoal, getWeather } from "../src/services/weather";

const db = getFirestore(app);

// 📜 tipo do histórico
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

  // 🔐 Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.replace("/");
      }
    });

    return unsubscribe;
  }, []);

  // 🔔 Permissão
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  // 📊 Dados
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
          query(collection(db, "waterLogs"), where("userId", "==", user.uid)),
        );

        const data: Record<string, number> = {};

        historySnap.forEach((doc) => {
          const { date, amount } = doc.data();

          if (!data[date]) {
            data[date] = 0;
          }

          data[date] += amount;
        });

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

  // 🔔 Notificação
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

  // 🚪 Logout
  const handleLogout = async (): Promise<void> => {
    await signOut(auth);

    router.replace("/");
  };

  // 💧 adicionar água
  const addWaterAmount = async (amount: number): Promise<void> => {
    if (!user) return;

    await addWaterLog(user.uid, amount);

    setWater((prev: number) => prev + amount);

    setModalVisible(false);
  };

  const addCustomWater = async (): Promise<void> => {
    if (!user) return;

    const amount = Number(customAmount);

    if (!amount) return;

    await addWaterAmount(amount);

    setCustomAmount("");
  };

  // 🔥 meta final
  const currentGoal = goalAdjusted || goal;

  const progress = currentGoal > 0 ? water / currentGoal : 0;

  const percentage = Math.min(progress * 100, 100);

  if (!user) {
    return <Text style={{ padding: 20 }}>Carregando...</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#9DB8DB", "#6FA3E8"]}
        style={{
          flex: 1,
          paddingTop: 50,
          paddingHorizontal: 20,
        }}
      >
        {/* TOPO */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Ionicons
            name="person-circle"
            size={32}
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
            size={28}
            color="#1C4A99"
            onPress={handleLogout}
          />
        </View>

        {/* CARD */}
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: 25,
            padding: 20,
            flex: 1,
          }}
        >
          <Text style={title}>Controle de Hidratação</Text>

          {/* 🌡️ clima */}
          {temperature !== null && (
            <Text style={{ marginBottom: 5 }}>🌡️ {temperature}°C</Text>
          )}

          <Text>Meta base: {goal} ml</Text>

          <Text
            style={{
              fontWeight: "700",
              color: "#1C4A99",
            }}
          >
            Meta ajustada: {currentGoal} ml
          </Text>

          <Text>Consumido hoje: {water} ml</Text>

          {/* 📊 barra */}
          <View style={{ marginVertical: 15 }}>
            <Text
              style={{
                color: "#1C4A99",
                fontWeight: "700",
              }}
            >
              {percentage.toFixed(0)}% da meta
            </Text>

            <View
              style={{
                height: 12,
                backgroundColor: "#e2e8f0",
                borderRadius: 10,
                overflow: "hidden",
                marginTop: 5,
              }}
            >
              <View
                style={{
                  width: `${percentage}%`,
                  height: "100%",
                  backgroundColor: percentage >= 100 ? "#16a34a" : "#1C4A99",
                }}
              />
            </View>

            <Text
              style={{
                marginTop: 5,
                fontSize: 12,
              }}
            >
              {water >= currentGoal
                ? "Meta atingida 🎉"
                : `Faltam ${currentGoal - water} ml`}
            </Text>
          </View>

          <Text style={subtitle}>Histórico</Text>

          <ScrollView>
            {history.map((item, index) => {
              const bateuMeta = item.total >= currentGoal;

              return (
                <View key={index} style={card}>
                  <Text>{item.date}</Text>

                  <Text>{item.total} ml</Text>

                  <Text
                    style={{
                      color: bateuMeta ? "green" : "red",
                    }}
                  >
                    {bateuMeta ? "Meta atingida" : "Meta não atingida"}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* ➕ FAB */}
      <TouchableOpacity style={fab} onPress={() => setModalVisible(true)}>
        <Text
          style={{
            color: "#fff",
            fontSize: 30,
          }}
        >
          +
        </Text>
      </TouchableOpacity>

      {/* 📦 Modal */}
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
                  textAlign: "center",
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

/* estilos */
const title = {
  fontSize: 20,
  fontWeight: "700" as const,
  marginBottom: 10,
  color: "#1C4A99",
};

const subtitle = {
  marginTop: 15,
  fontWeight: "700" as const,
  color: "#1C4A99",
};

const card = {
  backgroundColor: "#fff",
  padding: 10,
  marginBottom: 10,
  borderRadius: 10,
};

const button = {
  backgroundColor: "#1C4A99",
  padding: 15,
  borderRadius: 10,
  marginBottom: 10,
};

const buttonText = {
  color: "#fff",
  textAlign: "center" as const,
};

const input = {
  backgroundColor: "#fff",
  padding: 10,
  borderRadius: 10,
  marginBottom: 10,
};

const fab = {
  position: "absolute" as const,
  bottom: 30,
  right: 30,
  backgroundColor: "#1C4A99",
  width: 60,
  height: 60,
  borderRadius: 30,
  justifyContent: "center" as const,
  alignItems: "center" as const,
};

const modalOverlay = {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center" as const,
  padding: 20,
};

const modal = {
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 20,
};
