import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
  Alert,
  Switch, // Adicionado para o Modo Dormir
} from "react-native";

// Serviços
import { auth } from "../src/services/auth";
import { db } from "../src/services/firebaseConfig";
import { updateUserData } from "../src/services/firestore";
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermissions,
  scheduleWaterNotifications,
} from "../src/services/notifications";

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
  const [sleepMode, setSleepMode] = useState(true); // NOVO ESTADO
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace("/" as any);
        return;
      }

      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data() as UserData;
          setUserData(data);
          setName(data.name || "");
          setGoal(String(data.goal || ""));
        }

        const notif = await getNotificationSettings(user.uid);
        if (notif) {
          setIntervalMinutes(String(notif.interval));
          setSleepMode(notif.sleepMode ?? true); // Carrega o modo dormir do banco
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await updateUserData(user.uid, { name, goal: Number(goal) });
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar.");
    }
  };

  const handleSaveNotifications = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert("Atenção", "Ative as notificações para receber os alertas.");
        return;
      }

      const settings = {
        enabled: true,
        interval: Number(intervalMinutes),
        sleepMode: sleepMode, // Enviando o novo estado
      };

      // Salva no Firebase e agenda no Celular
      await saveNotificationSettings(user.uid, settings);
      
      // Passamos false no isGoalReached aqui pois o usuário está apenas configurando
      await scheduleWaterNotifications(settings, false);

      Alert.alert("Configurado!", `Lembretes ativos a cada ${intervalMinutes} minutos.`);
    } catch (e) {
      Alert.alert("Erro", "Falha ao configurar notificações.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/" as any);
  };

  if (loading) return (
    <View style={styles.loading}>
      <Text style={styles.loadingText}>Carregando perfil...</Text>
    </View>
  );

  return (
    <LinearGradient colors={["#B7D0F5", "#8FB8EE", "#78A6E5"]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="#1C4A99" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Meu Perfil</Text>
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={30} color="#1C4A99" />
            </TouchableOpacity>
          </View>

          {/* CARD DE INFORMAÇÕES */}
          <View style={styles.glassCard}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={40} color="#1C4A99" />
            </View>
            <Text style={styles.userEmail}>{userData?.email}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Peso</Text>
                <Text style={styles.statValue}>{userData?.weight}kg</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Idade</Text>
                <Text style={styles.statValue}>{userData?.age}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Gênero</Text>
                <Text style={styles.statValue}>{userData?.gender}</Text>
              </View>
            </View>
          </View>

          {/* FORMULÁRIO DE DADOS */}
          <View style={styles.glassCard}>
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
            <Text style={styles.inputLabel}>Nome</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} />
            <Text style={styles.inputLabel}>Meta Diária (ml)</Text>
            <TextInput value={goal} onChangeText={setGoal} keyboardType="numeric" style={styles.input} />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>Atualizar Perfil</Text>
            </TouchableOpacity>
          </View>

          {/* CONFIGURAÇÃO DE ALERTAS */}
          <View style={styles.glassCard}>
            <Text style={styles.sectionTitle}>Lembretes de Água</Text>
            
            <Text style={styles.inputLabel}>Intervalo entre alertas (minutos)</Text>
            <TextInput
              value={intervalMinutes}
              onChangeText={setIntervalMinutes}
              keyboardType="numeric"
              style={styles.input}
            />

            {/* INTERRUPTOR DO MODO DORMIR */}
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>Modo Dormir</Text>
                <Text style={styles.switchSubLabel}>Silenciar entre 22h e 08h</Text>
              </View>
              <Switch
                trackColor={{ false: "#D1D5DB", true: "#8FB8EE" }}
                thumbColor={sleepMode ? "#1C4A99" : "#F4F3F4"}
                onValueChange={() => setSleepMode(!sleepMode)}
                value={sleepMode}
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: '#3B82F6', marginTop: 20 }]} 
              onPress={handleSaveNotifications}
            >
              <Ionicons name="notifications-outline" size={20} color="white" style={{ marginRight: 8 }} />
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
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#B7D0F5" },
  loadingText: { color: "#1C4A99", fontWeight: "700" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 25 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1C4A99" },
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
  userEmail: { textAlign: "center", color: "#5A7FB5", marginBottom: 20, fontWeight: "600" },
  statsRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  statItem: { alignItems: "center" },
  statLabel: { fontSize: 12, color: "#5A7FB5" },
  statValue: { fontSize: 16, fontWeight: "bold", color: "#1C4A99" },
  statDivider: { width: 1, height: "100%", backgroundColor: "rgba(0,0,0,0.05)" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1C4A99", marginBottom: 15 },
  inputLabel: { color: "#1C4A99", fontSize: 13, fontWeight: "600", marginBottom: 6, marginLeft: 4 },
  input: { backgroundColor: "white", padding: 14, borderRadius: 16, marginBottom: 15, color: "#333", fontSize: 16 },
  saveButton: { 
    backgroundColor: "#1C4A99", 
    padding: 16, 
    borderRadius: 16, 
    alignItems: "center", 
    flexDirection: 'row',
    justifyContent: 'center'
  },
  saveButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  
  // ESTILOS DO SWITCH
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    marginTop: 10
  },
  switchLabel: { fontSize: 16, fontWeight: "700", color: "#1C4A99" },
  switchSubLabel: { fontSize: 12, color: "#5A7FB5" },
});