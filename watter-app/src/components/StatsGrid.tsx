import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatsGridProps {
  goal: number;
  consumed: number;
  percentage: number;
}

export function StatsGrid({ goal, consumed, percentage }: StatsGridProps) {
  return (
    <View style={styles.statsRow}>
      <View style={styles.miniCard}>
        <Text style={styles.miniValue}>{goal}</Text>
        <Text style={styles.miniLabel}>Meta</Text>
      </View>

      <View style={styles.miniCard}>
        <Text style={styles.miniValue}>{consumed}</Text>
        <Text style={styles.miniLabel}>Consumido</Text>
      </View>

      <View style={styles.miniCard}>
        <Text style={styles.miniValue}>{percentage.toFixed(0)}%</Text>
        <Text style={styles.miniLabel}>Hoje</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  miniCard: {
    width: "31%",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: "center",
    elevation: 3,
  },
  miniValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1C4A99",
  },
  miniLabel: {
    marginTop: 5,
    color: "#5A7FB5",
  },
});
