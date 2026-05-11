import React from "react";

import { Text, View } from "react-native";

type Props = {
  streak: number;
};

export default function StreakBadge({ streak }: Props) {
  // 🔥 badge dinâmica
  const getStreakBadge = () => {
    if (streak >= 100) {
      return "🏆";
    }

    if (streak >= 30) {
      return "👑";
    }

    if (streak >= 7) {
      return "⚡";
    }

    if (streak >= 3) {
      return "🔥";
    }

    return "💧";
  };

  // 🎨 cor dinâmica
  const getBadgeColor = () => {
    if (streak >= 100) {
      return "#F59E0B";
    }

    if (streak >= 30) {
      return "#A855F7";
    }

    if (streak >= 7) {
      return "#2563EB";
    }

    if (streak >= 3) {
      return "#EA580C";
    }

    return "#0EA5E9";
  };

  return (
    <View
      style={[
        styles.container,

        {
          borderColor: getBadgeColor(),
        },
      ]}
    >
      {/* emoji */}
      <Text style={styles.emoji}>{getStreakBadge()}</Text>

      {/* número */}
      <Text
        style={[
          styles.number,

          {
            color: getBadgeColor(),
          },
        ]}
      >
        {streak}
      </Text>

      {/* label */}
      <Text style={styles.label}>dias seguidos</Text>
    </View>
  );
}

const styles = {
  container: {
    backgroundColor: "rgba(255,255,255,0.72)",

    width: 150,

    alignSelf: "center" as const,

    alignItems: "center" as const,

    paddingVertical: 20,

    borderRadius: 30,

    marginBottom: 25,

    borderWidth: 2,

    shadowColor: "#000",

    shadowOpacity: 0.08,

    shadowRadius: 8,

    elevation: 4,
  },

  emoji: {
    fontSize: 36,
  },

  number: {
    fontSize: 34,

    fontWeight: "700" as const,

    marginTop: 5,
  },

  label: {
    color: "#5A7FB5",

    marginTop: 2,

    fontWeight: "600" as const,
  },
};
