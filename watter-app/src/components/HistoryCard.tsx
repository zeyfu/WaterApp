import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

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
    <View style={styles.container}>
      {history.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nenhum registro ainda 💧</Text>
        </View>
      )}

      <View style={styles.grid}>
        {history.map((item) => {
          const isGoalReached = item.total >= currentGoal;

          return (
            <View
              key={item.date}
              style={[
                styles.squareCard,
                { backgroundColor: isGoalReached ? "#DCFCE7" : "#FEE2E2" },
              ]}
            >
              <Text style={styles.dateText}>
                {item.date.split("-").slice(1).reverse().join("/")}
              </Text>

              <Ionicons
                name={isGoalReached ? "checkmark-circle" : "water"}
                size={20}
                color={isGoalReached ? "#166534" : "#991B1B"}
                style={styles.icon}
              />

              <Text
                style={[
                  styles.amountText,
                  { color: isGoalReached ? "#166534" : "#991B1B" },
                ]}
              >
                {item.total}
              </Text>
              <Text
                style={[
                  styles.unitText,
                  { color: isGoalReached ? "#166534" : "#991B1B" },
                ]}
              >
                ml
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1C4A99",
    marginBottom: 15,
    marginLeft: 5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  squareCard: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 4,
  },
  icon: {
    marginBottom: 2,
  },
  amountText: {
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 18,
  },
  unitText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  emptyCard: {
    backgroundColor: "rgba(255,255,255,0.6)",
    padding: 20,
    borderRadius: 22,
    alignItems: "center",
  },
  emptyText: {
    color: "#5A7FB5",
    fontWeight: "600",
  },
});
