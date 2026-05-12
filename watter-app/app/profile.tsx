import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth } from "../src/services/auth";
import { app } from "../src/services/firebaseConfig";
import { updateUserData } from "../src/services/firestore";
import {
  getNotificationSettings,
  saveNotificationSettings,
} from "../src/services/notifications";

const db = getFirestore(app);

type UserData = {
  email?: string;
  name?: string;
  weight?: number;
  age?: number;
  gender?: string;
  goal?: number;
};

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [name, setName] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  const [intervalMinutes, setIntervalMinutes] = useState<string>("60");

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;
        setUserData(data);
        setName(data.name || "");
        setGoal(String(data.goal || ""));
      }

      const notif = await getNotificationSettings(user.uid);
      if (notif) {
        setIntervalMinutes(String(Math.floor(notif.interval / 60)));
      }
    };
    fetchUser();
  }, []);

  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateUserData(user.uid, { name, goal: Number(goal) });
      alert("Sucesso! Perfil atualizado.");
    } catch (e) {
      alert("Erro ao salvar perfil.");
    }
  };

  const handleSaveNotifications = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await saveNotificationSettings(user.uid, {
        enabled: true,
        interval: Number(intervalMinutes) * 60,
      });
      alert("Notificações configuradas!");
    } catch (e) {
      alert("Erro ao salvar notificações.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/" as any);
  };

  if (!userData)
    return (
      <View style={styles.loading}>
        <Text>Carregando...</Text>
      </View>
    );

  return (
    <LinearGradient
      colors={["#B7D0F5", "#8FB8EE", "#78A6E5"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER PADRONIZADO COM A HOME */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="#1C4A99" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Meu Perfil</Text>

            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={30} color="#1C4A99" />
            </TouchableOpacity>
          </View>

          {/* INFO CARD */}
          <View style={styles.glassCard}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={40} color="#1C4A99" />
            </View>
            <Text style={styles.userEmail}>{userData.email}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Peso</Text>
                <Text style={styles.statValue}>{userData.weight}kg</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Idade</Text>
                <Text style={styles.statValue}>{userData.age}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Gênero</Text>
                <Text style={styles.statValue}>{userData.gender}</Text>
              </View>
            </View>
          </View>

          {/* EDIT FORM */}
          <View style={styles.glassCard}>
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>

            <Text style={styles.inputLabel}>Nome</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Meta Diária (ml)</Text>
            <TextInput
              value={goal}
              onChangeText={setGoal}
              keyboardType="numeric"
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveButtonText}>Salvar Perfil</Text>
            </TouchableOpacity>
          </View>

          {/* NOTIFICATION FORM */}
          <View style={styles.glassCard}>
            <Text style={styles.sectionTitle}>Lembretes</Text>
            <Text style={styles.inputLabel}>Intervalo (em minutos)</Text>
            <TextInput
              value={intervalMinutes}
              onChangeText={setIntervalMinutes}
              keyboardType="numeric"
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveNotifications}
            >
              <Text style={styles.saveButtonText}>Configurar Alertas</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25, // Ajustado para bater com o padrão da HomeTop
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C4A99",
  },
  glassCard: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 4,
  },
  userEmail: { textAlign: "center", color: "#5A7FB5", marginBottom: 20 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  statItem: { alignItems: "center" },
  statLabel: { fontSize: 12, color: "#5A7FB5" },
  statValue: { fontSize: 16, fontWeight: "bold", color: "#1C4A99" },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C4A99",
    marginBottom: 15,
  },
  inputLabel: {
    color: "#1C4A99",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 16,
    marginBottom: 15,
    color: "#333",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#1C4A99",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 5,
  },
  saveButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
