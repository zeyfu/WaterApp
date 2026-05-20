import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { NotificationSection } from "../src/components/Profile/NotificationSection";
import { ProfileAvatar } from "../src/components/Profile/ProfileAvatar";
import { ProfileHeader } from "../src/components/Profile/ProfileHeader";
import { ProfileInput } from "../src/components/Profile/ProfileInput";
import { auth, db } from "../src/services/firebaseConfig";
import { updateUserData } from "../src/services/firestore";
import {
  getNotificationSettings,
  requestNotificationPermissions,
  saveNotificationSettings,
  scheduleWaterNotifications,
} from "../src/services/notifications";
import { COLORS } from "../src/styles/theme";
import { styles } from "./styles/profileStyles";

interface UserProfileData {
  name?: string;
  goal?: number;
  weight?: number;
  age?: number;
  gender?: string;
  email?: string;
}

export default function Profile() {
  const router = useRouter();

  // Estados de controle de fluxo e UI
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [showPersonalData, setShowPersonalData] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Estados dos formulários de dados pessoais
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  // Estados dos formulários de notificações
  const [intervalMinutes, setIntervalMinutes] = useState("60");
  const [sleepMode, setSleepMode] = useState(true);

  /**
   * Inicializa o componente buscando os dados do perfil do usuário
   * no Firestore e suas respectivas configurações de notificação local.
   */
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace("/" as any);
        return;
      }

      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfileData;
          setUserData(data);
          setName(data.name || "");
          setGoal(String(data.goal || ""));
          setWeight(String(data.weight || ""));
          setAge(String(data.age || ""));
          setGender(data.gender || "");
        }

        const notif = await getNotificationSettings(user.uid);
        if (notif) {
          setIntervalMinutes(String(notif.interval));
          setSleepMode(notif.sleepMode ?? true);
        }
      } catch (error) {
        console.error("Erro ao inicializar dados do perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  /**
   * Persiste as alterações dos dados biométricos e metas do usuário no Firestore.
   */
  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateUserData(user.uid, {
        name,
        goal: Number(goal),
        weight: Number(weight),
        age: Number(age),
        gender,
      });
      Alert.alert("Sucesso! ✨", "Dados atualizados com sucesso.");
      setShowPersonalData(false);
    } catch (error) {
      console.error("Erro ao salvar dados pessoais:", error);
      Alert.alert("Erro", "Falha ao salvar as alterações do perfil.");
    }
  };

  /**
   * Valida as permissões do sistema operacional e agenda os novos
   * intervalos de lembretes para ingestão de água.
   */
  const handleSaveNotifications = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) return;

      const settings = {
        enabled: true,
        interval: Number(intervalMinutes),
        sleepMode,
      };

      await saveNotificationSettings(user.uid, settings);
      await scheduleWaterNotifications(settings, false);

      Alert.alert("Configurado! 🔔", "Lembretes atualizados com sucesso.");
      setShowNotifications(false);
    } catch (error) {
      console.error("Erro ao salvar configurações de notificação:", error);
      Alert.alert("Erro", "Falha ao configurar as notificações.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={COLORS.backgroundGradient as any}
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
          <ProfileHeader
            onBack={() => router.back()}
            onLogout={() =>
              signOut(auth).then(() => router.replace("/" as any))
            }
          />

          <ProfileAvatar
            email={userData?.email}
            name={name}
            age={age}
            gender={gender}
            weight={weight}
          />

          {/* Seção: Dados Pessoais */}
          <TouchableOpacity
            style={styles.dropoutHeader}
            onPress={() => setShowPersonalData(!showPersonalData)}
          >
            <Text style={styles.dropoutTitle}>Editar Dados Pessoais</Text>
            <Ionicons
              name={showPersonalData ? "chevron-up" : "chevron-down"}
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>

          {showPersonalData && (
            <View style={styles.glassCardInside}>
              <ProfileInput
                label="Nome"
                icon="person-outline"
                value={name}
                onChangeText={setName}
              />

              <View style={styles.row}>
                <ProfileInput
                  label="Peso (kg)"
                  icon="speedometer-outline"
                  value={weight}
                  onChangeText={setWeight}
                  containerStyle={styles.column}
                  keyboardType="numeric"
                />
                <ProfileInput
                  label="Idade"
                  icon="calendar-outline"
                  value={age}
                  onChangeText={setAge}
                  containerStyle={styles.column}
                  keyboardType="numeric"
                />
              </View>

              <ProfileInput
                label="Gênero"
                icon="transgender-outline"
                value={gender}
                onChangeText={setGender}
              />

              <ProfileInput
                label="Meta (ml)"
                icon="water-outline"
                value={goal}
                onChangeText={setGoal}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Seção: Alertas */}
          <TouchableOpacity
            style={[styles.dropoutHeader, { marginTop: 10 }]}
            onPress={() => setShowNotifications(!showNotifications)}
          >
            <Text style={styles.dropoutTitle}>Ajustes de Alerta</Text>
            <Ionicons
              name={showNotifications ? "chevron-up" : "chevron-down"}
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>

          {showNotifications && (
            <View style={styles.glassCardInside}>
              <NotificationSection
                interval={intervalMinutes}
                onChangeInterval={setIntervalMinutes}
                sleepMode={sleepMode}
                onToggleSleepMode={() => setSleepMode(!sleepMode)}
                onSave={handleSaveNotifications}
              />
            </View>
          )}

          {/* Seção de Exclusão de Conta */}
          <View style={styles.dangerZone}>
            <TouchableOpacity
              style={styles.deleteButtonModern}
              onPress={() =>
                Alert.alert("Atenção", "Deseja realmente excluir sua conta?")
              }
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              <Text style={styles.deleteButtonTextModern}>
                Excluir Minha Conta
              </Text>
            </TouchableOpacity>
            <Text style={styles.dangerNote}>Esta ação é irreversível.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
