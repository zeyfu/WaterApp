import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { useRouter } from "expo-router";

import { useState } from "react";

import { LinearGradient } from "expo-linear-gradient";

import { registerUser } from "../src/services/auth";

import { saveUserData } from "../src/services/firestore";

export default function Register() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");

  const [password, setPassword] = useState<string>("");

  const [weight, setWeight] = useState<string>("");

  const [age, setAge] = useState<string>("");

  const [gender, setGender] = useState<string>("");

  const handleRegister = async (): Promise<void> => {
    try {
      const userCredential = await registerUser(email, password);

      const user = userCredential.user;

      await saveUserData(user.uid, {
        email: email,

        name: "",

        weight: Number(weight),

        age: Number(age),

        gender: gender,

        goal: Number(weight) * 35,
      });

      alert("Usuário criado com sucesso!");

      router.push("/home" as any);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <LinearGradient
      colors={["#9DB8DB", "#6FA3E8"]}
      style={{
        flex: 1,

        justifyContent: "center",

        paddingHorizontal: 20,
      }}
    >
      {/* CARD */}
      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.8)",

          padding: 20,

          borderRadius: 25,

          shadowColor: "#000",

          shadowOpacity: 0.1,

          shadowRadius: 10,

          elevation: 5,
        }}
      >
        {/* TÍTULO */}
        <Text
          style={{
            fontSize: 22,

            fontWeight: "700",

            color: "#1C4A99",

            textAlign: "center",

            marginBottom: 20,
          }}
        >
          Criar Conta
        </Text>

        {/* INPUTS */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#555"
          onChangeText={setEmail}
          value={email}
          style={inputStyle}
        />

        <TextInput
          placeholder="Senha"
          placeholderTextColor="#555"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
          style={inputStyle}
        />

        <TextInput
          placeholder="Peso (kg)"
          placeholderTextColor="#555"
          onChangeText={setWeight}
          value={weight}
          keyboardType="numeric"
          style={inputStyle}
        />

        <TextInput
          placeholder="Idade"
          placeholderTextColor="#555"
          onChangeText={setAge}
          value={age}
          keyboardType="numeric"
          style={inputStyle}
        />

        <TextInput
          placeholder="Sexo (M/F)"
          placeholderTextColor="#555"
          onChangeText={setGender}
          value={gender}
          style={inputStyle}
        />

        {/* BOTÃO */}
        <TouchableOpacity onPress={handleRegister} style={buttonStyle}>
          <Text style={buttonText}>CADASTRAR</Text>
        </TouchableOpacity>

        {/* VOLTAR */}
        <TouchableOpacity
          onPress={() => router.push("/" as any)}
          style={{ marginTop: 10 }}
        >
          <Text
            style={{
              textAlign: "center",

              color: "#1C4A99",

              fontWeight: "500",
            }}
          >
            Voltar
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

/* estilos */
const inputStyle = {
  backgroundColor: "#fff",

  padding: 14,

  borderRadius: 16,

  marginBottom: 12,
};

const buttonStyle = {
  backgroundColor: "#1C4A99",

  padding: 16,

  borderRadius: 16,

  marginTop: 10,
};

const buttonText = {
  color: "#fff",
  textAlign: "center" as const,
  fontWeight: "700" as const,
};
