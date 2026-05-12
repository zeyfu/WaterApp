import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

interface HomeTopProps {
  onProfilePress: () => void;
  onNotificationPress?: () => void;
  onLogoutPress: () => void;
}

export function HomeTop({
  onProfilePress,
  onNotificationPress,
  onLogoutPress,
}: HomeTopProps) {
  return (
    <View style={styles.topBar}>
      <Ionicons
        name="person-circle"
        size={34}
        color="#1C4A99"
        onPress={onProfilePress}
      />
      <Ionicons
        name="notifications"
        size={28}
        color="#1C4A99"
        onPress={onNotificationPress}
      />
      <Ionicons
        name="log-out-outline"
        size={30}
        color="#1C4A99"
        onPress={onLogoutPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
});
