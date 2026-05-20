import * as Location from "expo-location";

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
  };
}

/**
 * Captura a localização aproximada do dispositivo e realiza uma requisição
 * à API Open-Meteo para retornar a temperatura atual em tempo real.
 * Possui uma trava de segurança com cancelamento automático (timeout) de 5 segundos.
 */
export async function getWeather(): Promise<number | null> {
  let timeoutId: any = undefined;

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.warn("Permissão de geolocalização recusada pelo usuário.");
      return null;
    }

    // Busca a posição com menor precisão para garantir velocidade extrema e economia de bateria
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Lowest,
    });

    const { latitude, longitude } = location.coords;

    // Mecanismo de AbortController para evitar que requisições presas travem a inicialização da Home
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`,
      { signal: controller.signal },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `Falha na resposta do servidor meteorológico: ${response.status}`,
      );
    }

    const data = (await response.json()) as OpenMeteoResponse;
    return data.current.temperature_2m;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    console.error(
      "Serviço climático operando em modo offline ou com latência de rede elevada.",
      error,
    );
    return null;
  }
}

/**
 * Ajusta dinamicamente a meta diária de hidratação baseando-se na temperatura ambiente.
 * Regras de acréscimo:
 * - Maior ou igual a 35°C: +1000ml
 * - Maior ou igual a 30°C: +700ml
 * - Maior ou igual a 25°C: +400ml
 */
export function calculateGoal(
  baseGoal: number,
  temperature: number | null,
): number {
  if (temperature === null) return baseGoal;

  if (temperature >= 35) return baseGoal + 1000;
  if (temperature >= 30) return baseGoal + 700;
  if (temperature >= 25) return baseGoal + 400;

  return baseGoal;
}
