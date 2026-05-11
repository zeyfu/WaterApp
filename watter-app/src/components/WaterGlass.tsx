import React, { useEffect, useRef } from "react";

import { Animated, Text, View } from "react-native";

import Svg, {
    ClipPath,
    Defs,
    Ellipse,
    LinearGradient,
    Path,
    Rect,
    Stop,
} from "react-native-svg";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

type Props = {
  percentage: number;
};

export default function WaterGlass({ percentage }: Props) {
  // 💧 altura da água
  const waterHeight = (percentage / 100) * 165;

  // 🎬 animação do nível
  const animatedHeight = useRef(new Animated.Value(0)).current;

  // 🌊 animação da onda
  const waveAnim = useRef(new Animated.Value(0)).current;

  const bubbleAnim = useRef(new Animated.Value(0)).current;

  // 🚀 animação da água subindo
  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: waterHeight,

      duration: 800,

      useNativeDriver: false,
    }).start();
  }, [waterHeight]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(bubbleAnim, {
        toValue: 1,

        duration: 4000,

        useNativeDriver: false,
      }),
    ).start();
  }, []);

  // 🌊 loop da onda
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,

          duration: 1800,

          useNativeDriver: false,
        }),

        Animated.timing(waveAnim, {
          toValue: 0,

          duration: 1800,

          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  // 🌊 movimento horizontal
  const waveMove = waveAnim.interpolate({
    inputRange: [0, 1],

    outputRange: [-4, 4],
  });

  // 🌊 largura dinâmica
  const waveWidth = waveAnim.interpolate({
    inputRange: [0, 1],

    outputRange: [68, 74],
  });

  const bubbleY = bubbleAnim.interpolate({
    inputRange: [0, 1],

    outputRange: [210, 70],
  });

  const bubbleOpacity = bubbleAnim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],

    outputRange: [0, 0.35, 0.25, 0],
  });

  const waveHeight = waveAnim.interpolate({
    inputRange: [0, 1],

    outputRange: [8, 11],
  });

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 10,
      }}
    >
      <Svg width={280} height={260} viewBox="0 0 280 260">
        <Defs>
          {/* 🥛 formato do copo */}
          <ClipPath id="glassClip">
            <Path
              d="
                M50 40
                Q140 15 230 40
                Q205 150 192 226
                Q140 258 88 226
                Z
              "
            />
          </ClipPath>

          {/* 💧 gradiente água */}
          <LinearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#EAF9FF" />

            <Stop offset="40%" stopColor="#8FD2FF" />

            <Stop offset="100%" stopColor="#2F7FE0" stopOpacity="0.78" />
          </LinearGradient>

          {/* ✨ gradiente vidro */}
          <LinearGradient id="glassGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="rgba(255,255,255,0.22)" />

            <Stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </LinearGradient>
        </Defs>

        {/* 🌑 sombra externa */}
        <Ellipse cx="140" cy="232" rx="58" ry="11" fill="rgba(0,0,0,0.06)" />

        {/* 💧 água animada */}
        <AnimatedRect
          x="20"
          y={Animated.subtract(228, animatedHeight)}
          width="240"
          height={animatedHeight}
          fill="url(#waterGradient)"
          clipPath="url(#glassClip)"
        />

        {/* 🌊 superfície água animada */}
        <AnimatedEllipse
          cx={Animated.add(140, waveMove)}
          cy={Animated.add(Animated.subtract(228, animatedHeight), 2)}
          rx={waveWidth}
          ry={waveHeight}
          fill="rgba(255,255,255,0.35)"
          clipPath="url(#glassClip)"
        />

        {/* 🌊 profundidade da onda */}
        <AnimatedEllipse
          cx={Animated.add(140, Animated.multiply(waveMove, -0.5))}
          cy={Animated.add(Animated.subtract(228, animatedHeight), 4)}
          rx={Animated.add(waveWidth, 2)}
          ry={Animated.divide(waveHeight, 1.5)}
          fill="rgba(255,255,255,0.15)"
          clipPath="url(#glassClip)"
        />

        {/* ✨ brilho água */}
        <Ellipse
          cx="140"
          cy="205"
          rx="50"
          ry="10"
          fill="rgba(255,255,255,0.12)"
        />

        {/* 🫧 bolha 1 */}
        <AnimatedEllipse
          cx="115"
          cy={bubbleY}
          rx="4"
          ry="4"
          fill="white"
          opacity={bubbleOpacity}
          clipPath="url(#glassClip)"
        />

        {/* 🫧 bolha 2 */}
        <AnimatedEllipse
          cx="155"
          cy={Animated.add(bubbleY, -35)}
          rx="6"
          ry="6"
          fill="white"
          opacity={bubbleOpacity}
          clipPath="url(#glassClip)"
        />

        {/* 🫧 bolha 3 */}
        <AnimatedEllipse
          cx="135"
          cy={Animated.add(bubbleY, -70)}
          rx="3"
          ry="3"
          fill="white"
          opacity={bubbleOpacity}
          clipPath="url(#glassClip)"
        />

        {/* 🌑 profundidade lateral */}
        <Path
          d="
            M58 48
            L76 48
            L96 210
            L82 210
            Z
          "
          fill="rgba(0,0,0,0.04)"
        />

        <Path
          d="
            M222 48
            L204 48
            L184 210
            L198 210
            Z
          "
          fill="rgba(0,0,0,0.03)"
        />

        {/* 🥛 vidro externo */}
        <Path
          d="
            M50 40
            Q140 15 230 40
            Q205 150 192 226
            Q140 258 88 226
            Z
          "
          fill="url(#glassGradient)"
          stroke="#1C4A99"
          strokeWidth="4"
        />

        {/* 🥛 vidro interno */}
        <Path
          d="
            M66 48
            Q140 28 214 48
            Q196 145 180 212
            Q140 232 100 212
            Z
          "
          fill="transparent"
          stroke="rgba(255,255,255,0.40)"
          strokeWidth="2"
        />

        {/* ✨ reflexo lateral */}
        <Path
          d="
            M88 55
            Q108 95 102 190
            L84 190
            Q86 105 72 60
            Z
          "
          fill="rgba(255,255,255,0.30)"
        />

        {/* ✨ brilho superior */}
        <Ellipse
          cx="140"
          cy="38"
          rx="82"
          ry="6"
          fill="rgba(255,255,255,0.30)"
        />

        {/* 🥛 aro superior externo */}
        <Ellipse
          cx="140"
          cy="40"
          rx="88"
          ry="10"
          fill="rgba(255,255,255,0.16)"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="2"
        />

        {/* 🥛 aro interno */}
        <Ellipse
          cx="140"
          cy="40"
          rx="74"
          ry="5"
          fill="rgba(255,255,255,0.10)"
        />

        {/* 🥛 fundo interno */}
        <Ellipse
          cx="140"
          cy="214"
          rx="42"
          ry="10"
          fill="rgba(255,255,255,0.12)"
        />

        {/* 🥛 base grossa */}
        <Ellipse
          cx="140"
          cy="226"
          rx="54"
          ry="11"
          fill="rgba(255,255,255,0.22)"
          stroke="#1C4A99"
          strokeWidth="2"
        />
      </Svg>

      {/* 🔢 porcentagem */}
      <Text
        style={{
          position: "absolute",

          color: "#1C4A99",

          fontSize: 24,

          fontWeight: "700" as const,

          textShadowColor: "rgba(255,255,255,0.6)",

          textShadowOffset: {
            width: 1,
            height: 1,
          },

          textShadowRadius: 4,
        }}
      >
        {percentage.toFixed(0)}%
      </Text>
    </View>
  );
}
