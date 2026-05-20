import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StreakBadgeProps {
  streak: number;
  bestStreak: number;
}

interface BadgeTheme {
  color: string;
  bg: string;
  emoji: string;
  label: string;
}

/**
 * Componente de gamificação que exibe a sequência de dias (streak) do usuário.
 * Renderiza o recorde histórico e adapta dinamicamente as cores e conquistas
 * de acordo com a consistência de metas diárias atingidas.
 */
export default function StreakBadge({ streak, bestStreak }: StreakBadgeProps) {
  /**
   * Determina a identidade visual, insígnia e título do badge
   * com base na quantidade de dias consecutivos atuais.
   */
  const getBadgeTheme = (): BadgeTheme => {
    if (streak >= 30) {
      return { color: "#A855F7", bg: "#9333EA", emoji: "👑", label: "Mestre" };
    }
    if (streak >= 7) {
      return { color: "#2563EB", bg: "#1D4ED8", emoji: "⚡", label: "Focado" };
    }
    if (streak >= 3) {
      return { color: "#EA580C", bg: "#C2410C", emoji: "🔥", label: "No Fogo" };
    }

    return { color: "#0EA5E9", bg: "#0284C7", emoji: "💧", label: "Iniciante" };
  };

  const theme = getBadgeTheme();

  return (
    <View style={[styles.mainCard, { backgroundColor: theme.bg }]}>
      {/* Seção: Sequência de Dias Atual */}
      <View style={styles.section}>
        <View style={styles.iconCircle}>
          <Text style={styles.emoji}>{theme.emoji}</Text>
        </View>
        <Text style={styles.number}>{streak}</Text>
        <Text style={styles.label}>Dias Atuais</Text>
      </View>

      <View style={styles.divider} />

      {/* Seção: Recorde Histórico (Best Streak) */}
      <View style={styles.section}>
        <View style={styles.iconCircle}>
          <Text style={styles.emoji}>🏆</Text>
        </View>
        <Text style={[styles.number, { color: "#FDE047" }]}>
          {bestStreak || 0}
        </Text>
        <Text style={styles.label}>Recorde</Text>
      </View>

      {/* Indicador Flutuante de Categoria de Status */}
      <View style={styles.statusTag}>
        <Text style={styles.statusTagText}>{theme.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    flexDirection: "row",
    width: "100%",
    alignSelf: "center",
    paddingVertical: 20,
    borderRadius: 25,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "space-around",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    position: "relative",
  },
  section: {
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  emoji: {
    fontSize: 24,
  },
  number: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  label: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },
  divider: {
    width: 1,
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  statusTag: {
    position: "absolute",
    top: -10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  statusTagText: {
    color: "#1C4A99",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
