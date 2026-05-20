import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface HomeTopProps {
  onProfilePress: () => void;
  onNotificationPress: () => void;
  onLogoutPress: () => void;
  notificationsActive: boolean;
  isGoalReached: boolean;
}

/**
 * Barra de navegação superior da tela Home.
 * Renderiza os botões de acesso ao perfil, controle de notificações e encerramento de sessão,
 * adaptando visualmente as cores do ícone de alerta de acordo com o status atual do usuário.
 */
export function HomeTop({
  onProfilePress,
  onNotificationPress,
  onLogoutPress,
  notificationsActive,
  isGoalReached,
}: HomeTopProps) {
  /**
   * Define dinamicamente a coloração do ícone de lembretes.
   * Regra: Verde se atingiu a meta, Azul se estiver ativo e Cinza se desativado/pausado.
   */
  const getNotificationColor = (): string => {
    if (!notificationsActive) return "#94A3B8";
    return isGoalReached ? "#28a745" : "#1C4A99";
  };

  return (
    <View style={styles.topBar}>
      <TouchableOpacity onPress={onProfilePress}>
        <Ionicons name="person-circle" size={34} color="#1C4A99" />
      </TouchableOpacity>

      <TouchableOpacity onPress={onNotificationPress}>
        <Ionicons
          name={notificationsActive ? "notifications" : "notifications-off"}
          size={28}
          color={getNotificationColor()}
        />
      </TouchableOpacity>

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
    alignItems: "center",
    marginBottom: 25,
  },
});
