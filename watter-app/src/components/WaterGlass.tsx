import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import Svg, {
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

type Props = {
  percentage: number;
};

export default function WaterGlass({ percentage }: Props) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const bubbleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 1200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  useEffect(() => {
    // Loop das Ondas (Movimento lateral suave)
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 3500,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: false,
      }),
    ).start();

    // Loop das Bolhas
    Animated.loop(
      Animated.timing(bubbleAnim, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ).start();
  }, []);

  // Lógica de expansão: O copo começa estreito na base e abre no topo
  const waterPath = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [
      "M100 220 L180 220 L180 220 L100 220 Z", // Vazio
      "M55 50 L225 50 L192 226 L88 226 Z", // Cheio seguindo o desenho do copo
    ],
  });

  const waveMove = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-3, 3, -3],
  });

  // Calcula a altura da superfície para a elipse (subida vertical)
  const surfaceY = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [220, 50],
  });

  // Calcula a largura da superfície (aumenta conforme o copo abre)
  const surfaceWidth = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [42, 85],
  });

  const bubbleOpacity = bubbleAnim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 0.3, 0.2, 0],
  });

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={280} height={260} viewBox="0 0 280 260">
        <Defs>
          <LinearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#AEE2FF" />
            <Stop offset="100%" stopColor="#2F7FE0" />
          </LinearGradient>
          <LinearGradient id="glassReflex" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <Stop offset="50%" stopColor="white" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="white" stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Sombra base no chão */}
        <Ellipse cx="140" cy="235" rx="55" ry="10" fill="rgba(0,0,0,0.05)" />

        {/* CORPO DA ÁGUA (Preenchimento que expande lateralmente) */}
        <AnimatedPath d={waterPath} fill="url(#waterGradient)" />

        {/* ELEMENTOS INTERNOS */}
        <G>
          {/* Superfície da Água (Elipse que sobe e expande) */}
          <AnimatedEllipse
            cx={Animated.add(140, waveMove)}
            cy={surfaceY}
            rx={surfaceWidth}
            ry="5"
            fill="#D0EEFF"
          />

          {/* Bolhas Animadas */}
          <AnimatedEllipse
            cx="115"
            cy={bubbleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [210, 60],
            })}
            rx="2"
            ry="2"
            fill="white"
            opacity={bubbleOpacity}
          />
          <AnimatedEllipse
            cx="160"
            cy={bubbleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [190, 80],
            })}
            rx="3"
            ry="3"
            fill="white"
            opacity={bubbleOpacity}
          />
        </G>

        {/* O VIDRO (Traçado e preenchimento leve por cima da água) */}
        <Path
          d="M50 40 Q140 15 230 40 Q205 150 192 226 Q140 258 88 226 Z"
          fill="rgba(255, 255, 255, 0.08)"
          stroke="#1C4A99"
          strokeWidth="2.5"
        />

        {/* Reflexo Lateral do Vidro */}
        <Path
          d="M65 50 Q75 140 85 210 L98 210 Q88 140 78 50 Z"
          fill="url(#glassReflex)"
        />

        {/* Detalhes de Brilho Superior (Aro do Copo) */}
        <Ellipse
          cx="140"
          cy="40"
          rx="90"
          ry="12"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Brilho no Fundo do Copo */}
        <Ellipse
          cx="140"
          cy="222"
          rx="45"
          ry="8"
          stroke="white"
          strokeOpacity="0.15"
          strokeWidth="1.5"
          fill="none"
        />
      </Svg>

      {/* Texto da Porcentagem centralizado */}
      <Text
        style={{
          position: "absolute",
          color: "#1C4A99",
          fontSize: 32,
          fontWeight: "bold",
        }}
      >
        {percentage.toFixed(0)}%
      </Text>
    </View>
  );
}
