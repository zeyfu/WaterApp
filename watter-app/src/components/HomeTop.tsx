import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface HomeTopProps {
  onProfilePress: () => void;
  onNotificationPress: () => void; // Removi o '?' pois agora é essencial
  onLogoutPress: () => void;
  notificationsActive: boolean; // NOVO: Para saber se está ON ou OFF
  isGoalReached: boolean; // NOVO: Para mudar a cor para verde
}

export function HomeTop({
  onProfilePress,
  onNotificationPress,
  onLogoutPress,
  notificationsActive,
  isGoalReached,
}: HomeTopProps) {
  return (
    <View style={styles.topBar}>
      {/* PERFIL */}
      <TouchableOpacity onPress={onProfilePress}>
        <Ionicons name="person-circle" size={34} color="#1C4A99" />
      </TouchableOpacity>

      {/* SINO DINÂMICO */}
      <TouchableOpacity onPress={onNotificationPress}>
        <Ionicons
          name={notificationsActive ? "notifications" : "notifications-off"}
          size={28}
          // Lógica de cores: Verde (Meta), Azul (Ativo), Cinza (Pausado)
          color={
            notificationsActive
              ? isGoalReached
                ? "#28a745"
                : "#1C4A99"
              : "#94A3B8"
          }
        />
      </TouchableOpacity>

      {/* LOGOUT */}
      <TouchableOpacity onPress={onLogoutPress}>
        <Ionicons name="log-out-outline" size={30} color="#1C4A99" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Garante que fiquem alinhados na mesma linha
    marginBottom: 25,
  },
});
