import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth } from "../src/services/auth";

export default function Onboarding() {
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    const weightNum = parseFloat(weight.replace(",", "."));

    if (!weightNum || weightNum < 20 || weightNum > 300) {
      Alert.alert(
        "Peso Inválido",
        "Por favor, insira um peso válido para o cálculo.",
      );
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não encontrado");

      const db = getFirestore();

      const calculatedGoal = Math.round(weightNum * 35);

      await setDoc(doc(db, "users", user.uid), {
        weight: weightNum,
        dailyGoal: calculatedGoal,
        name: user.displayName || "Usuário",
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      Alert.alert(
        "Tudo pronto!",
        `Sua meta diária calculada é de ${calculatedGoal}ml.`,
      );

      router.replace("/home");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar suas configurações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#B7D0F5", "#8FB8EE", "#78A6E5"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.glassCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="water" size={40} color="#1C4A99" />
          </View>

          <Text style={styles.title}>Vamos configurar sua meta!</Text>
          <Text style={styles.subtitle}>
            Para calcularmos quanto de água seu corpo precisa, informe seu peso
            atual.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Seu peso (kg)</Text>
            <TextInput
              placeholder="Ex: 75.5"
              placeholderTextColor="#5A7FB5"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            onPress={handleSaveProfile}
            style={[styles.button, loading && { opacity: 0.7 }]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>CALCULAR META</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#FFF"
                  style={{ marginLeft: 10 }}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  glassCard: {
    backgroundColor: "rgba(255,255,255,0.85)",
    padding: 30,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    elevation: 5,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1C4A99",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#5A7FB5",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 30,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 30,
  },
  label: {
    color: "#1C4A99",
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 20,
    fontSize: 18,
    color: "#1C4A99",
    textAlign: "center",
    fontWeight: "700",
    borderWidth: 1,
    borderColor: "#D0E1F9",
  },
  button: {
    backgroundColor: "#1C4A99",
    flexDirection: "row",
    paddingVertical: 18,
    borderRadius: 20,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 1,
  },
});
