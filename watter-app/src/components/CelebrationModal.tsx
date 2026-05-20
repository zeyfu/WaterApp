import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CelebrationModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CelebrationModal({ visible, onClose }: CelebrationModalProps) {
  const animationRef = useRef<LottieView>(null);

  /**
   * Dispara o gatilho da animação do Lottie assim que
   * o estado do modal for alterado para visível.
   */
  useEffect(() => {
    if (visible) {
      animationRef.current?.play();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Camada isolada da animação de confetes */}
        <View style={styles.lottieContainer} pointerEvents="none">
          <LottieView
            ref={animationRef}
            source={require("@/assets/animations/confetti.json")}
            autoPlay={false}
            loop={false}
            style={styles.lottie}
          />
        </View>

        {/* Card de informações do feedback de meta atingida */}
        <View style={styles.card}>
          <Text style={styles.emoji}>🎯</Text>
          <Text style={styles.title}>Meta Atingida!</Text>
          <Text style={styles.message}>
            Lembretes pausados. Bom descanso e parabéns pelo foco de hoje! 💧
          </Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Que demais!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: Platform.OS === "web" ? "fixed" : "relative",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(28, 74, 153, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#EEF6FF",
    width: "90%",
    maxWidth: 400,
    borderRadius: 28,
    padding: 30,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    zIndex: 5,
  },
  emoji: {
    fontSize: 44,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1C4A99",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    fontWeight: "600",
    color: "#5A7FB5",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 25,
  },
  button: {
    backgroundColor: "#1C4A99",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  lottieContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  lottie: {
    width: "100%",
    height: "100%",
  },
});
