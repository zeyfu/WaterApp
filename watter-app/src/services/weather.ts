import * as Location from "expo-location";

// 🌡️ buscar clima dinâmico
export async function getWeather(): Promise<number | null> {
  try {
    // 📍 permissão
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Permissão negada");

      return null;
    }

    // 📍 localização atual
    const location = await Location.getCurrentPositionAsync({});

    const latitude = location.coords.latitude;

    const longitude = location.coords.longitude;

    // 🌡️ API
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`,
    );

    const data = await response.json();

    return data.current.temperature_2m;
  } catch (error) {
    console.log("Erro clima:", error);

    return null;
  }
}

// 🎯 calcular meta
export function calculateGoal(
  baseGoal: number,
  temperature: number | null,
): number {
  if (!temperature) return baseGoal;

  if (temperature >= 35) return baseGoal + 1000;

  if (temperature >= 30) return baseGoal + 700;

  if (temperature >= 25) return baseGoal + 400;

  return baseGoal;
}
