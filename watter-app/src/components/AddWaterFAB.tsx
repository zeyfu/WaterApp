import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface AddWaterFABProps {
  onPress: () => void;
}

export function AddWaterFAB({ onPress }: AddWaterFABProps) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Text style={styles.fabText}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#1C4A99",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#1C4A99",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  fabText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "700",
  },
});
