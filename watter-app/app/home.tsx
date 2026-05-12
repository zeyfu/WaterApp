import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

// Serviços
import { auth } from "../src/services/auth";
import { addWaterLog } from "../src/services/firestore";

// Componentes
import { AddWaterFAB } from "../src/components/AddWaterFAB";
import { AddWaterModal } from "../src/components/AddWaterModal";
import HistoryCard from "../src/components/HistoryCard";
import { HomeTop } from "../src/components/HomeTop";
import { ProgressBar } from "../src/components/ProgressBar";
import { StatsGrid } from "../src/components/StatsGrid";
import StreakBadge from "../src/components/StreakBadge";
import WaterGlass from "../src/components/WaterGlass";

// Hook Customizado
import { useWaterData } from "../src/hooks/useWaterData";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  // Usando o Hook para gerenciar os dados
  const {
    water,
    currentGoal,
    history,
    streak,
    temperature,
    setWater,
    refresh,
  } = useWaterData(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.replace("/" as any);
      }
    });
    return unsubscribe;
  }, []);

  const addWaterAmount = async (amount: number) => {
    if (!user) return;
    try {
      await addWaterLog(user.uid, amount);
      setWater((prev) => prev + amount); // Atualização otimista (UI rápida)
      setModalVisible(false);
      refresh(); // Sincroniza histórico e streak
    } catch (error) {
      console.error("Erro ao adicionar:", error);
    }
  };

  const percentage = Math.min((water / currentGoal) * 100, 100);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#B7D0F5", "#8FB8EE", "#78A6E5"]}
        style={styles.background}
      >
        <View style={styles.content}>
          <HomeTop
            onProfilePress={() => router.push("/profile" as any)}
            onNotificationPress={() => {}}
            onLogoutPress={() => auth.signOut()}
          />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.glassContainer}>
              <WaterGlass percentage={percentage} />
              {temperature !== null && (
                <Text style={styles.tempText}>
                  🌡️ {temperature.toFixed(0)}°C
                </Text>
              )}
            </View>

            <StatsGrid
              goal={currentGoal}
              consumed={water}
              percentage={percentage}
            />

            <ProgressBar
              percentage={percentage}
              remainingText={
                currentGoal - water > 0
                  ? `Faltam ${currentGoal - water} ml`
                  : "Meta atingida! 🎉"
              }
            />

            <StreakBadge streak={streak} />

            <HistoryCard history={history} currentGoal={currentGoal} />
          </ScrollView>
        </View>
      </LinearGradient>

      <AddWaterFAB onPress={() => setModalVisible(true)} />

      <AddWaterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addWaterAmount}
        customAmount={customAmount}
        setCustomAmount={setCustomAmount}
        onAddCustom={() => {
          const amt = parseInt(customAmount);
          if (amt > 0) addWaterAmount(amt);
          setCustomAmount("");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 50 },
  glassContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 30,
    padding: 20,
  },
  tempText: {
    marginTop: 10,
    color: "#1C4A99",
    fontWeight: "700",
    fontSize: 16,
  },
});
