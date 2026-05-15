import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { COLORS } from "../src/styles/theme";

export default function Terms() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Termos e Condições</Text>
      <Text style={styles.text}>
        1. Uso do App: O Beba+ é uma ferramenta de auxílio à hidratação...
        {"\n\n"}
        2. Dados: Seus dados de peso e idade são usados apenas para cálculo de
        meta...{"\n\n"}
        3. Responsabilidade: O app não substitui orientações médicas.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Entendi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 30, alignItems: "center" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
    textAlign: "justify",
  },
  button: {
    marginTop: 30,
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 15,
    width: "100%",
  },
  buttonText: { color: "#FFF", textAlign: "center", fontWeight: "bold" },
});
