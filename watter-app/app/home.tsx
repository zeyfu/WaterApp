import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// Estilos e Temas
import { COLORS } from "../src/styles/theme";
import { styles } from "./styles/homeStyles";

// Serviços e Hooks
import { useWaterData } from "../src/hooks/useWaterData";
import { auth } from "../src/services/auth";
import { addWaterLog } from "../src/services/firestore";
import {
  getNotificationSettings,
  requestNotificationPermissions,
  saveNotificationSettings,
  scheduleWaterNotifications,
} from "../src/services/notifications";

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
  const user = auth.currentUser;
  const [modalVisible, setModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [notificationsActive, setNotificationsActive] = useState(true);
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

  // 2. Sincronizar Notificações
  useEffect(() => {
    async function syncNotifications() {
      if (user && currentGoal > 0) {
        try {
          const hasPermission = await requestNotificationPermissions();
          if (hasPermission) {
            const settings = await getNotificationSettings(user.uid);
            if (settings) {
              setNotificationsActive(settings.enabled);
              await scheduleWaterNotifications(settings, water >= currentGoal);
            }
          }
        } catch (error) {
          console.error("Erro ao sincronizar notificações:", error);
        }
      }
    }
    syncNotifications();
  }, [user, water, currentGoal]);

  // 3. Controle do Sino
  const handleToggleNotifications = async () => {
    if (!user) return;
    const newStatus = !notificationsActive;
    setNotificationsActive(newStatus);
    try {
      const settings = await getNotificationSettings(user.uid);
      const updatedSettings = {
        enabled: newStatus,
        interval: settings?.interval || 60,
        sleepMode: settings?.sleepMode ?? true,
      };
      await saveNotificationSettings(user.uid, updatedSettings);
      await scheduleWaterNotifications(updatedSettings, water >= currentGoal);
    } catch (error) {
      setNotificationsActive(!newStatus);
    }
  };

  // 4. Lógica de Beber Água
  const addWaterAmount = async (amount: number) => {
    if (!user) return;
    try {
      await addWaterLog(user.uid, amount, currentGoal);
      const newTotal = water + amount;
      setWater(newTotal);
      const settings = await getNotificationSettings(user.uid);
      if (settings) {
        const reached = newTotal >= currentGoal;
        await scheduleWaterNotifications(settings, reached);
        if (reached && water < currentGoal) {
          Alert.alert("Meta Atingida! 🎯", "Lembretes pausados. Bom descanso!");
        }
      }
      setModalVisible(false);
      refresh();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível registrar a água.");
    }
  };

  const percentage = Math.min((water / currentGoal) * 100, 100);
  if (!user) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={COLORS.backgroundGradient as any}
        style={styles.background}
      >
        <View style={styles.content}>
          <HomeTop
            onProfilePress={() => router.push("/profile" as any)}
            onLogoutPress={() => auth.signOut()}
            onNotificationPress={handleToggleNotifications}
            notificationsActive={notificationsActive}
            isGoalReached={water >= currentGoal}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
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

              <View style={styles.integratedProgress}>
                <ProgressBar percentage={percentage} />
                <Text style={styles.progressStatus}>
                  {water >= currentGoal
                    ? "Objetivo Alcançado! 🎯"
                    : `Ainda faltam ${currentGoal - water}ml`}
                </Text>
              </View>
            </View>

            <StreakBadge streak={streak} bestStreak={bestStreak} />

            <TouchableOpacity
              style={styles.historyHeader}
              onPress={() => setHistoryExpanded(!historyExpanded)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>Histórico Recente</Text>
              <Ionicons
                name={historyExpanded ? "chevron-up" : "chevron-down"}
                size={22}
                color={COLORS.primary}
              />
            </TouchableOpacity>

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
