import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../styles/theme";

interface Props {
  onBack: () => void;
  onLogout: () => void;
}

export const ProfileHeader = ({ onBack, onLogout }: Props) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack}>
      <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Meu Perfil</Text>
    <TouchableOpacity onPress={onLogout}>
      <Ionicons name="log-out-outline" size={28} color={COLORS.danger} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.primary },
});
