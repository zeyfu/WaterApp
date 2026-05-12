import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { sendEmailVerification } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { registerUser } from "../src/services/auth";
import { saveUserData } from "../src/services/firestore";

export default function Register() {
  const router = useRouter();

  // Estados dos inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Outro");

  // Estados de controle e UI
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLevel, setPasswordLevel] = useState({
    label: "",
    color: "#DDD",
    percent: 0,
  });

  // 1. Validação de Email (Regex)
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 2. Feedback de Força da Senha
  useEffect(() => {
    if (password.length === 0) {
      setPasswordLevel({ label: "", color: "#DDD", percent: 0 });
    } else if (password.length < 6) {
      setPasswordLevel({ label: "Muito curta", color: "#FF4D4D", percent: 25 });
    } else if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      setPasswordLevel({
        label: "Senha Forte",
        color: "#2ECC71",
        percent: 100,
      });
    } else {
      setPasswordLevel({
        label: "Média (use letras e números)",
        color: "#F1C40F",
        percent: 60,
      });
    }
  }, [password]);

  // 3. Máscara de Peso (Troca vírgula por ponto)
  const handleWeightChange = (text: string) => {
    const formatted = text.replace(",", ".");
    setWeight(formatted);
  };

  const handleRegister = async () => {
    const cleanEmail = email.trim(); // Remove espaços acidentais

    // 1. Log de depuração (olhe o terminal do VS Code/Metro)
    console.log("Tentando cadastrar:", cleanEmail);

    // 2. Validação visual imediata
    if (!validateEmail(cleanEmail)) {
      console.log("Email inválido detectado pelo Regex");
      Alert.alert(
        "E-mail Inválido",
        "O formato do e-mail não é válido. Verifique se esqueceu o '@' ou o '.com'.",
        [{ text: "Entendi" }],
      );
      return; // Para aqui e não tenta cadastrar no Firebase
    }

    if (password.length < 6) {
      Alert.alert("Senha Curta", "A senha precisa de pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    if (!acceptedTerms) {
      Alert.alert("Termos", "Aceite os termos para continuar.");
      return;
    }

    setLoading(true);

    try {
      // Usamos o cleanEmail aqui também
      const userCredential = await registerUser(cleanEmail, password);

      await sendEmailVerification(userCredential.user);

      await saveUserData(userCredential.user.uid, {
        email: cleanEmail,
        name: "",
        weight: Number(weight),
        age: Number(age),
        gender: gender,
        goal: Number(weight) * 35,
      });

      setLoading(false);
      Alert.alert("Sucesso!", "Verifique seu e-mail para validar a conta.");
      router.replace("/");
    } catch (error: any) {
      setLoading(false);
      console.error("Erro do Firebase:", error.code, error.message);

      // Se o Regex passar mas o Firebase ainda achar o email inválido
      if (error.code === "auth/invalid-email") {
        Alert.alert(
          "Erro de Cadastro",
          "O e-mail digitado é inválido para o sistema.",
        );
      } else if (error.code === "auth/email-already-in-use") {
        Alert.alert("Erro", "Este e-mail já está em uso.");
      } else {
        Alert.alert("Erro", "Ocorreu um problema inesperado. Tente novamente.");
      }
    }

    if (passwordLevel.percent < 60) {
      Alert.alert(
        "Senha Fraca",
        "A sua senha precisa ser mais segura (letras maiúsculas e números).",
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    if (!acceptedTerms) {
      Alert.alert("Termos", "Precisas aceitar os termos para continuar.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await registerUser(email, password);

      // Envio do e-mail de confirmação
      await sendEmailVerification(userCredential.user);

      await saveUserData(userCredential.user.uid, {
        email: email,
        name: "",
        weight: Number(weight),
        age: Number(age),
        gender: gender,
        goal: Number(weight) * 35,
      });

      setLoading(false);
      Alert.alert(
        "Sucesso!",
        "Conta criada! Verifique o link enviado para o seu e-mail.",
        [{ text: "OK", onPress: () => router.replace("/") }],
      );
    } catch (error: any) {
      setLoading(false);
      // Tratamento de erros do Firebase
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Erro", "Este e-mail já está registado.");
      } else {
        Alert.alert("Erro no cadastro", error.message);
      }
    }
  };

  const GenderOption = ({ label }: { label: string }) => (
    <TouchableOpacity
      style={[styles.genderBtn, gender === label && styles.genderBtnActive]}
      onPress={() => setGender(label)}
    >
      <Text
        style={[styles.genderText, gender === label && styles.genderTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#B7D0F5", "#8FB8EE", "#78A6E5"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.glassCard}>
            <Text style={styles.title}>Criar Conta</Text>

            <TextInput
              placeholder="Email"
              placeholderTextColor="#5A7FB5"
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            {/* Input Senha com Olhinho */}
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

            {/* Feedback Força da Senha */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBarBackground}>
                  <View
                    style={[
                      styles.strengthBarFill,
                      {
                        width: `${passwordLevel.percent}%`,
                        backgroundColor: passwordLevel.color,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[styles.strengthText, { color: passwordLevel.color }]}
                >
                  {passwordLevel.label}
                </Text>
              </View>
            )}

            <TextInput
              placeholder="Confirmar Senha"
              placeholderTextColor="#5A7FB5"
              secureTextEntry={!showPassword}
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              style={[styles.input, { marginTop: 12 }]}
            />

            {/* ROW DE PESO E IDADE CORRIGIDA (WRAPPER) */}
            <View style={styles.row}>
              <View style={[styles.inputWrapper, { marginRight: 10 }]}>
                <Text style={styles.miniLabel}>Peso (kg)</Text>
                <TextInput
                  placeholder="00"
                  placeholderTextColor="#5A7FB5"
                  onChangeText={handleWeightChange}
                  value={weight}
                  keyboardType="numeric"
                  style={styles.inputRow}
                />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.miniLabel}>Idade</Text>
                <TextInput
                  placeholder="00"
                  placeholderTextColor="#5A7FB5"
                  onChangeText={setAge}
                  value={age}
                  keyboardType="numeric"
                  style={styles.inputRow}
                />
              </View>
            </View>

            <Text style={styles.label}>Gênero</Text>
            <View style={styles.genderContainer}>
              <GenderOption label="M" />
              <GenderOption label="F" />
              <GenderOption label="Outro" />
            </View>

            <View style={styles.termsRow}>
              <Switch
                value={acceptedTerms}
                onValueChange={setAcceptedTerms}
                trackColor={{ false: "#D1D1D1", true: "#1C4A99" }}
              />
              <Text style={styles.termsText}>Aceito os termos e políticas</Text>
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              style={[
                styles.button,
                (!acceptedTerms || loading) && { opacity: 0.7 },
              ]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>CADASTRAR</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/")}
              style={styles.backBtn}
            >
              <Text style={styles.backBtnText}>Voltar para o Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  glassCard: {
    backgroundColor: "rgba(255,255,255,0.85)",
    padding: 25,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1C4A99",
    textAlign: "center",
    marginBottom: 20,
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
    marginBottom: 0,
  },
  eyeIcon: { paddingHorizontal: 15 },
  strengthContainer: { marginTop: 8, marginLeft: 5 },
  strengthBarBackground: {
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 2,
    overflow: "hidden",
    width: "100%",
  },
  strengthBarFill: { height: "100%" },
  strengthText: { fontSize: 11, fontWeight: "bold", marginTop: 4 },
  row: { flexDirection: "row", marginTop: 12, marginBottom: 15 },
  inputWrapper: { flex: 1 },
  inputRow: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 16,
    color: "#1C4A99",
    fontSize: 16,
  },
  miniLabel: {
    color: "#1C4A99",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    marginLeft: 5,
  },
  label: {
    color: "#1C4A99",
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 5,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  genderBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.6)",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: "center",
  },
  genderBtnActive: { backgroundColor: "#1C4A99" },
  genderText: { color: "#1C4A99", fontWeight: "600" },
  genderTextActive: { color: "white" },
  termsRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  termsText: { color: "#1C4A99", marginLeft: 10, fontSize: 14 },
  button: {
    backgroundColor: "#1C4A99",
    padding: 16,
    borderRadius: 16,
    height: 55,
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  backBtn: { marginTop: 20 },
  backBtnText: { textAlign: "center", color: "#1C4A99", fontWeight: "600" },
});
