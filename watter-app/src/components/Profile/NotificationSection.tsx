import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../styles/theme";
import { ProfileInput } from "./ProfileInput";

interface Props {
  interval: string;
  onChangeInterval: (val: string) => void;
  sleepMode: boolean;
  onToggleSleepMode: () => void;
  onSave: () => void;
}

export const NotificationSection = ({
  interval,
  onChangeInterval,
  sleepMode,
  onToggleSleepMode,
  onSave,
}: Props) => (
  <View style={styles.container}>
    <Text style={styles.sectionTitle}>Configurações de Alerta</Text>

    <ProfileInput
      label="Intervalo (min)"
      icon="time-outline"
      value={interval}
      onChangeText={onChangeInterval}
      keyboardType="numeric"
    />

    <View style={styles.switchRow}>
      <View>
        <Text style={styles.switchLabel}>Modo Dormir</Text>
        <Text style={styles.switchSubLabel}>Silenciar entre 22h e 08h</Text>
      </View>
      <Switch
        trackColor={{ false: COLORS.gray, true: COLORS.lightBlue }}
        thumbColor={sleepMode ? COLORS.primary : "#F4F3F4"}
        onValueChange={onToggleSleepMode}
        value={sleepMode}
      />
    </View>

    <TouchableOpacity style={styles.saveButton} onPress={onSave}>
      <Ionicons
        name="notifications-outline"
        size={20}
        color="white"
        style={{ marginRight: 8 }}
      />
      <Text style={styles.saveButtonText}>Configurar Alertas</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 30,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    marginTop: 10,
  },
  switchLabel: { fontSize: 16, fontWeight: "700", color: COLORS.primary },
  switchSubLabel: { fontSize: 12, color: COLORS.secondary },
  saveButton: {
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  saveButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
