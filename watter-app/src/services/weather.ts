import * as Location from "expo-location";

export async function getWeather(): Promise<number | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permissão de localização negada");
      return null;
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Lowest,
    });

    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`,
      { signal: controller.signal },
    );

    clearTimeout(timeoutId);

    const data = await response.json();
    return data.current.temperature_2m;
  } catch (error) {
    console.log(
      "App operando offline ou sinal fraco. Usando meta padrão.",
      error,
    );
    return null;
  }
}

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
