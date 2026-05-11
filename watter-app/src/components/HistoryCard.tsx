import React from "react";

import { Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

type HistoryItem = {
  date: string;
  total: number;
};

type Props = {
  history: HistoryItem[];

  currentGoal: number;
};

export default function HistoryCard({ history, currentGoal }: Props) {
  return (
    <>
      {/* título */}
      <Text style={styles.title}>Histórico</Text>

      {/* vazio */}
      {history.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nenhum registro ainda 💧</Text>
        </View>
      )}

      {/* lista */}
      {history.map((item) => (
        <View key={item.date} style={styles.card}>
          <View
            style={{
              flexDirection: "row" as const,

              justifyContent: "space-between" as const,
            }}
          >
            <Text style={styles.date}>{item.date}</Text>

            <Ionicons name="water" size={18} color="#1C4A99" />
          </View>

          <Text style={styles.amount}>{item.total} ml</Text>

          <Text
            style={[
              styles.status,

              {
                color: item.total >= currentGoal ? "#16A34A" : "#EF4444",
              },
            ]}
          >
            {item.total >= currentGoal ? "Meta atingida" : "Meta não atingida"}
          </Text>
        </View>
      ))}
    </>
  );
}

const styles = {
  title: {
    fontSize: 22,

    fontWeight: "700" as const,

    color: "#1C4A99",

    marginBottom: 15,
  },

  emptyCard: {
    backgroundColor: "rgba(255,255,255,0.6)",

    padding: 20,

    borderRadius: 22,

    alignItems: "center" as const,
  },

  emptyText: {
    color: "#5A7FB5",

    fontWeight: "600" as const,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.75)",

    padding: 18,

    borderRadius: 22,

    marginBottom: 15,

    shadowColor: "#1C4A99",

    shadowOpacity: 0.05,

    shadowRadius: 5,

    elevation: 2,
  },

  date: {
    color: "#1C4A99",

    fontWeight: "600" as const,
  },

  amount: {
    marginTop: 8,

    fontSize: 18,

    color: "#1C4A99",

    fontWeight: "700" as const,
  },

  status: {
    marginTop: 5,

    fontWeight: "600" as const,
  },
};
