import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface AddWaterModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (amount: number) => void;
  customAmount: string;
  setCustomAmount: (value: string) => void;
  onAddCustom: () => void;
}

export function AddWaterModal({
  visible,
  onClose,
  onAdd,
  customAmount,
  setCustomAmount,
  onAddCustom,
}: AddWaterModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          {[200, 250, 500].map((amt) => (
            <TouchableOpacity
              key={amt}
              style={styles.button}
              onPress={() => onAdd(amt)}
            >
              <Text style={styles.buttonText}>+{amt} ml</Text>
            </TouchableOpacity>
          ))}

          <TextInput
            placeholder="Quantidade personalizada"
            value={customAmount}
            onChangeText={setCustomAmount}
            keyboardType="numeric"
            style={styles.input}
          />

          <TouchableOpacity style={styles.button} onPress={onAddCustom}>
            <Text style={styles.buttonText}>Adicionar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#EEF6FF",
    padding: 20,
    borderRadius: 25,
  },
  button: {
    backgroundColor: "#1C4A99",
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
  input: {
    backgroundColor: "rgba(240,248,255,0.9)",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  cancelText: {
    textAlign: "center",
    color: "#1C4A99",
    fontWeight: "600",
    marginTop: 5,
  },
});
