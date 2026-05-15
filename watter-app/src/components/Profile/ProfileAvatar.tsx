import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../styles/theme";

interface Props {
  email?: string;
  name?: string;
  age?: string;
  gender?: string;
  weight?: string;
}

export const ProfileAvatar = ({ email, name, age, gender, weight }: Props) => (
  <View style={styles.container}>
    <View style={styles.avatarCircle}>
      <Ionicons name="person" size={40} color={COLORS.primary} />
    </View>
    <Text style={styles.userName}>{name || "Usuário"}</Text>
    <Text style={styles.userDetails}>
      {age} anos • {gender} • {weight}kg
    </Text>
    <Text style={styles.userEmail}>{email}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 30,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 4,
  },
  userName: { fontSize: 20, fontWeight: "800", color: COLORS.primary },
  userDetails: {
    fontSize: 14,
    color: COLORS.secondary,
    marginVertical: 2,
    fontWeight: "600",
  },
  userEmail: { color: COLORS.secondary, fontSize: 12, opacity: 0.8 },
});
