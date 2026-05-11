const LAT = -11.4343;
const LON = -61.4562;

export async function getWeather(): Promise<number | null> {
  try {
    console.log("Buscando clima...");

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m`,
    );

    const data = await response.json();

    console.log("Resposta API:", data);

    return data.current.temperature_2m;
  } catch (error) {
    console.log("Erro clima:", error);
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
