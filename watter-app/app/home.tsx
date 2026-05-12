import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Serviços e Hooks
import { useWaterData } from "../src/hooks/useWaterData";
import { auth } from "../src/services/auth";
import { addWaterLog } from "../src/services/firestore";

// Componentes
import { AddWaterFAB } from "../src/components/AddWaterFAB";
import { AddWaterModal } from "../src/components/AddWaterModal";
import HistoryCard from "../src/components/HistoryCard";
import { HomeTop } from "../src/components/HomeTop";
import { ProgressBar } from "../src/components/ProgressBar";
import StreakBadge from "../src/components/StreakBadge";
import WaterGlass from "../src/components/WaterGlass";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  // ESTADO PARA O DROPOUT DO HISTÓRICO
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const {
    water,
    currentGoal,
    history,
    streak,
    bestStreak,
    temperature,
    setWater,
    refresh,
  } = useWaterData(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else router.replace("/" as any);
    });
    return unsubscribe;
  }, []);

  const addWaterAmount = async (amount: number) => {
    if (!user) return;
    try {
      await addWaterLog(user.uid, amount);
      setWater((prev) => prev + amount);
      setModalVisible(false);
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const percentage = Math.min((water / currentGoal) * 100, 100);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={["#B7D0F5", "#8FB8EE", "#78A6E5"]}
        style={styles.background}
      >
        <View style={styles.content}>
          <HomeTop
            onProfilePress={() => router.push("/profile" as any)}
            onLogoutPress={() => auth.signOut()}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* HERO CARD UNIFICADO */}
            <View style={styles.heroCard}>
              <View style={styles.glassHeader}>
                <WaterGlass percentage={percentage} />
                {temperature !== null && (
                  <View style={styles.tempBadge}>
                    <Text style={styles.tempText}>
                      🌡️ {temperature.toFixed(0)}°C
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.integratedStats}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{currentGoal}ml</Text>
                  <Text style={styles.statLabel}>Meta</Text>
                </View>
                <View style={styles.vDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{water}ml</Text>
                  <Text style={styles.statLabel}>Hoje</Text>
                </View>
                <View style={styles.vDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{percentage.toFixed(0)}%</Text>
                  <Text style={styles.statLabel}>Foco</Text>
                </View>
              </View>

              {/* BARRA DE PROGRESSO INTEGRADA DENTRO DO HERO CARD */}
              <View style={styles.integratedProgress}>
                <ProgressBar percentage={percentage} />
                <Text style={styles.progressStatus}>
                  {water >= currentGoal
                    ? "Objetivo Alcançado! 🎯"
                    : `Ainda faltam ${currentGoal - water}ml`}
                </Text>
              </View>
            </View>

            {/* GAMIFICAÇÃO */}
            <StreakBadge streak={streak} bestStreak={bestStreak} />

            {/* HISTÓRICO COM DROPOUT (ACCORDION) */}
            <TouchableOpacity
              style={styles.historyHeader}
              onPress={() => setHistoryExpanded(!historyExpanded)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>Histórico Recente</Text>
              <Ionicons
                name={historyExpanded ? "chevron-up" : "chevron-down"}
                size={22}
                color="#1C4A99"
              />
            </TouchableOpacity>

            {/* RENDERIZAÇÃO CONDICIONAL DO HISTÓRICO */}
            {historyExpanded && (
              <View style={styles.historyContainer}>
                <HistoryCard history={history} currentGoal={currentGoal} />
              </View>
            )}
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
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },

  heroCard: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 35,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    marginTop: 10,
    marginBottom: 20,
  },
  glassHeader: { alignItems: "center", marginBottom: 20 },
  tempBadge: {
    backgroundColor: "rgba(255,255,255,0.4)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },
  tempText: { color: "#1C4A99", fontWeight: "700", fontSize: 14 },

  integratedStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    paddingTop: 20,
    paddingBottom: 15,
  },
  statBox: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800", color: "#1C4A99" },
  statLabel: { fontSize: 12, color: "#5A7FB5", fontWeight: "600" },
  vDivider: { width: 1, height: 25, backgroundColor: "rgba(255,255,255,0.3)" },

  integratedProgress: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  progressStatus: {
    textAlign: "center",
    color: "#1C4A99",
    fontWeight: "700",
    marginTop: 8,
    fontSize: 13,
  },

  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 20,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#1C4A99" },
  historyContainer: {
    marginTop: 5,
    paddingBottom: 20,
  },
});
