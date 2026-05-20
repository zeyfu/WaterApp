import { useColorScheme } from "@/hooks/use-color-scheme";
import { auth } from "@/src/services/firebaseConfig";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [hasWeight, setHasWeight] = useState<boolean | null>(null);

  /**
   * Monitora o estado de autenticação global e valida a
   * existência dos dados de perfil físico do usuário no Firestore.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));

          if (userDoc.exists() && userDoc.data()?.weight) {
            setHasWeight(true);
          } else {
            setHasWeight(false);
          }
        } catch (error) {
          console.error("Erro ao validar perfil no Firestore:", error);
          setHasWeight(false);
        }
      } else {
        setHasWeight(null);
      }

      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  /**
   * Gerencia as regras de rotas protegidas, fluxos de onboarding
   * e redirecionamentos baseado no estado do usuário.
   */
  useEffect(() => {
    if (initializing || (hasWeight === null && user)) return;

    const publicScreens = [
      "index",
      "register",
      "terms",
      "onboarding",
      undefined,
    ];
    const inAuthGroup = publicScreens.includes(segments[0] as any);

    if (!user && !inAuthGroup) {
      router.replace("/");
    } else if (user) {
      if (!hasWeight && segments[0] !== "onboarding") {
        router.replace("/onboarding" as any);
      } else if (hasWeight && inAuthGroup && segments[0] !== "onboarding") {
        router.replace("/home");
      }
    }
  }, [user, segments, initializing, hasWeight]);

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#EEF6FF",
        }}
      >
        <ActivityIndicator size="large" color="#1C4A99" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1, width: "100%" }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
