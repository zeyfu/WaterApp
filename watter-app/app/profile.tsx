import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../src/services/auth";
import { app } from "../src/services/firebaseConfig";
import { updateUserData } from "../src/services/firestore";

// 🔔 notifications
import {
  getNotificationSettings,
  saveNotificationSettings,
} from "../src/services/notifications";

const db = getFirestore(app);

// 👤 tipo do usuário
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

  // 🔔 notificações
  const [interval, setIntervalState] = useState<string>("3600");

  // 🔍 Buscar dados
  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;

      if (!user) return;

      // 👤 user
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;

        setUserData(data);

        setName(data.name || "");
        setGoal(String(data.goal || ""));
      }

      // 🔔 notifications
      const notif = await getNotificationSettings(user.uid);

      if (notif) {
        setIntervalState(String(notif.interval));
      }
    };

    fetchUser();
  }, []);

  // 💾 Salvar perfil
  const handleSaveProfile = async (): Promise<void> => {
    const user = auth.currentUser;

    if (!user) return;

    await updateUserData(user.uid, {
      name,
      goal: Number(goal),
    });

    alert("Perfil atualizado!");

    setUserData((prev: UserData | null) => ({
      ...prev,
      name,
      goal: Number(goal),
    }));
  };

  // 🔔 Salvar notificações
  const handleSaveNotifications = async (): Promise<void> => {
    const user = auth.currentUser;

    if (!user) return;

    await saveNotificationSettings(user.uid, {
      enabled: true,
      interval: Number(interval),
    });

    alert("Configurações de notificação salvas!");
  };

  // 🚪 Logout
  const handleLogout = async (): Promise<void> => {
    await signOut(auth);

    router.replace("/");
  };

  if (!userData) {
    return <Text style={{ padding: 20 }}>Carregando...</Text>;
  }

  return (
    <LinearGradient
      colors={["#9DB8DB", "#6FA3E8"]}
      style={{ flex: 1, paddingTop: 50, paddingHorizontal: 20 }}
    >
      {/* TOPO */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#1C4A99" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={28} color="#1C4A99" />
        </TouchableOpacity>
      </View>

      {/* CARD */}
      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.9)",
          borderRadius: 25,
          padding: 20,
        }}
      >
        <Text style={title}>👤 Perfil</Text>

        <Text style={item}>Email: {userData.email}</Text>
        <Text style={item}>Peso: {userData.weight} kg</Text>
        <Text style={item}>Idade: {userData.age}</Text>
        <Text style={item}>Sexo: {userData.gender}</Text>

        {/* PERFIL */}
        <Text style={label}>Nome</Text>

        <TextInput value={name} onChangeText={setName} style={input} />

        <Text style={label}>Meta diária (ml)</Text>

        <TextInput
          value={goal}
          onChangeText={setGoal}
          keyboardType="numeric"
          style={input}
        />

        <TouchableOpacity style={button} onPress={handleSaveProfile}>
          <Text style={buttonText}>Salvar Perfil</Text>
        </TouchableOpacity>

        {/* 🔔 NOTIFICAÇÕES */}
        <Text style={section}>🔔 Notificações</Text>

        <Text style={label}>Intervalo (segundos)</Text>

        <TextInput
          value={interval}
          onChangeText={setIntervalState}
          keyboardType="numeric"
          style={input}
        />

        <TouchableOpacity style={button} onPress={handleSaveNotifications}>
          <Text style={buttonText}>Salvar Notificações</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

/* estilos */
const title = {
  fontSize: 22,
  fontWeight: "700",
  color: "#1C4A99",
  textAlign: "center" as const,
  marginBottom: 20,
};

const section = {
  marginTop: 20,
  fontWeight: "bold" as const,
  color: "#1C4A99",
  fontSize: 16,
};

const item = {
  fontSize: 16,
  color: "#334155",
  marginBottom: 10,
};

const label = {
  color: "#1C4A99",
  marginTop: 10,
  marginBottom: 5,
  fontWeight: "bold" as const,
};

const input = {
  backgroundColor: "#fff",
  padding: 12,
  borderRadius: 10,
  marginBottom: 10,
};

const button = {
  backgroundColor: "#1C4A99",
  padding: 15,
  borderRadius: 10,
  marginTop: 10,
};

const buttonText = {
  color: "#fff",
  textAlign: "center" as const,
};
