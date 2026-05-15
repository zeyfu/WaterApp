import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, loginUser } from "../src/services/auth";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha e-mail e senha.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await loginUser(email.trim(), password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        Alert.alert(
          "E-mail não verificado",
          "Você precisa validar seu e-mail antes de acessar. Verifique sua caixa de entrada.",
        );
        setLoading(false);
        return;
      }

      router.replace("/home" as any);
    } catch (error: any) {
      setLoading(false);
      let message = "Erro ao entrar.";
      if (error.code === "auth/user-not-found")
        message = "Usuário não encontrado.";
      if (error.code === "auth/wrong-password") message = "Senha incorreta.";

      Alert.alert("Erro", message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(
        "Redefinir Senha",
        "Digite seu e-mail no campo acima primeiro.",
      );
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert("Sucesso", "E-mail de redefinição enviado!");
    } catch (error: any) {
      Alert.alert("Erro", "Não conseguimos enviar o e-mail de recuperação.");
    }
  };

  return (
    <LinearGradient
      colors={["#B7D0F5", "#8FB8EE", "#78A6E5"]}
      style={styles.container}
    >
      <View style={styles.glassCard}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.subtitle}>Hidrate-se melhor todos os dias</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#5A7FB5"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          style={styles.input}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Senha"
            placeholderTextColor="#5A7FB5"
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
            value={password}
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color="#1C4A99"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.rememberAndForgotRow}>
          <View style={styles.rememberContainer}>
            <Checkbox
              style={styles.checkbox}
              value={rememberMe}
              onValueChange={setRememberMe}
              color={rememberMe ? "#1C4A99" : undefined}
            />
            <Text style={styles.rememberText}>Lembrar-me</Text>
          </View>

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          style={[styles.buttonPrimary, loading && { opacity: 0.7 }]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>ENTRAR</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/register" as any)}
          style={styles.buttonSecondary}
        >
          <Text style={styles.buttonText}>CRIAR CONTA</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  glassCard: {
    backgroundColor: "rgba(255,255,255,0.85)",
    padding: 25,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    elevation: 5,
  },
  logo: {
    width: 280,
    height: 120,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    color: "#1C4A99",
    marginBottom: 25,
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    color: "#1C4A99",
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 15,
  },
  eyeIcon: { paddingHorizontal: 15 },

  rememberAndForgotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 25,
    paddingHorizontal: 2,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 120,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  rememberText: {
    marginLeft: 8,
    color: "#1C4A99",
    fontSize: 14,
    fontWeight: "600",
  },
  forgotText: {
    color: "#163B7A",
    fontSize: 14,
    fontWeight: "700",
    paddingVertical: 5,
  },

  buttonPrimary: {
    backgroundColor: "#1C4A99",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    height: 55,
    justifyContent: "center",
  },
  buttonSecondary: {
    backgroundColor: "#163B7A",
    padding: 16,
    borderRadius: 16,
    height: 55,
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
});
