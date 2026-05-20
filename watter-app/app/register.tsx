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

interface PasswordStrength {
  label: string;
  color: string;
  percent: number;
}

export default function Register() {
  const router = useRouter();

  // Estados dos formulários de cadastro
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Outro");

  // Estados de controle de UI e validação
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLevel, setPasswordLevel] = useState<PasswordStrength>({
    label: "",
    color: "#DDD",
    percent: 0,
  });

  /**
   * Executa a validação sintática do formato do e-mail via Regex.
   */
  const validateEmail = (inputEmail: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(inputEmail);
  };

  /**
   * Monitora e calcula em tempo real o nível de complexidade
   * e segurança da senha inserida pelo usuário.
   */
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

  /**
   * Normaliza a inserção do peso substituindo vírgulas por pontos decimais.
   */
  const handleWeightChange = (text: string) => {
    const formatted = text.replace(",", ".");
    setWeight(formatted);
  };

  /**
   * Orquestra o fluxo de validação local, criação da credencial
   * de autenticação no Firebase e persistência do perfil no Firestore.
   */
  const handleRegister = async () => {
    const cleanEmail = email.trim();

    if (!validateEmail(cleanEmail)) {
      Alert.alert(
        "E-mail Inválido",
        "O formato do e-mail não é válido. Verifique os caracteres informados.",
        [{ text: "Entendi" }],
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Senha Curta",
        "A senha precisa ter pelo menos 6 caracteres.",
      );
      return;
    }

    if (passwordLevel.percent < 60) {
      Alert.alert(
        "Senha Fraca",
        "Sua senha precisa ser mais segura (mescle letras maiúsculas, minúsculas e números).",
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas informadas não coincidem.");
      return;
    }

    if (!acceptedTerms) {
      Alert.alert(
        "Termos de Uso",
        "É necessário aceitar os termos e políticas para continuar.",
      );
      return;
    }

    setLoading(true);

    try {
      const userCredential = await registerUser(cleanEmail, password);

      // Dispara o gatilho nativo de verificação por e-mail do Firebase
      await sendEmailVerification(userCredential.user);

      // Inicializa os dados do perfil biográfico com cálculo dinâmico de meta base (35ml/kg)
      await saveUserData(userCredential.user.uid, {
        email: cleanEmail,
        name: "",
        weight: Number(weight),
        age: Number(age),
        gender: gender,
        goal: Number(weight) * 35,
      });

      setLoading(false);
      Alert.alert(
        "Sucesso!",
        "Conta criada com sucesso! Verifique a caixa de entrada do seu e-mail para validar o acesso.",
        [{ text: "OK", onPress: () => router.replace("/") }],
      );
    } catch (error: any) {
      setLoading(false);
      console.error("Erro no fluxo de registro Firebase:", error.code);

      if (error.code === "auth/email-already-in-use") {
        Alert.alert(
          "Erro de Cadastro",
          "Este endereço de e-mail já está registrado.",
        );
      } else if (error.code === "auth/invalid-email") {
        Alert.alert(
          "Erro de Cadastro",
          "O e-mail digitado foi recusado pelo servidor.",
        );
      } else {
        Alert.alert(
          "Erro",
          "Não foi possível concluir seu cadastro. Tente novamente.",
        );
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
