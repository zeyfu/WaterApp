import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TextInput, View, ViewStyle } from "react-native";
import { COLORS } from "../../styles/theme";

interface Props {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "numeric";
  placeholder?: string;
  containerStyle?: ViewStyle;
}

export const ProfileInput = ({
  label,
  icon,
  value,
  onChangeText,
  keyboardType,
  placeholder,
  containerStyle,
}: Props) => (
  <View style={[styles.container, containerStyle]}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Ionicons
        name={icon}
        size={20}
        color={COLORS.primary}
        style={styles.icon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        style={styles.input}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  label: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 5,
    marginLeft: 4,
    textTransform: "uppercase",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: "rgba(28, 74, 153, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  icon: { marginRight: 10, opacity: 0.7 },
  input: { flex: 1, color: "#333", fontSize: 16 },
});
