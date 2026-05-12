import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ProgressBarProps {
  percentage: number;
  remainingText: string;
}

export function ProgressBar({ percentage, remainingText }: ProgressBarProps) {
  return (
    <View style={styles.progressSection}>
      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.remainingText}>{remainingText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  progressSection: {
    backgroundColor: "rgba(255,255,255,0.60)",
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
  },
  progressBackground: {
    height: 7,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1C4A99",
    borderRadius: 999,
  },
  remainingText: {
    marginTop: 10,
    color: "#1C4A99",
    fontWeight: "600",
  },
});
