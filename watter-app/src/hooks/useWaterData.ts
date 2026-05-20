import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../services/firebaseConfig";
import { calculateGoal, getWeather } from "../services/weather";

interface FirebaseUser {
  uid: string;
}

interface WaterLog {
  userId: string;
  date: string;
  amount: number;
  currentGoal?: number;
}

interface HistoryItem {
  date: string;
  total: number;
  goal: number;
}

interface GroupedLogs {
  [date: string]: {
    total: number;
    goal: number;
  };
}

/**
 * Hook customizado para gerenciamento, cálculo estatístico e sincronização
 * dos registros de ingestão de água do usuário com o Firestore.
 */
export function useWaterData(user: FirebaseUser | null) {
  const [water, setWater] = useState<number>(0);
  const [goal, setGoal] = useState<number>(2000);
  const [goalAdjusted, setGoalAdjusted] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [temperature, setTemperature] = useState<number | null>(null);

  /**
   * Consolida os dados operacionais da Home buscando informações biométricas,
   * logs históricos e fatores meteorológicos locais.
   */
  const fetchData = async () => {
    if (!user) return;

    try {
      // 1. Recuperação de Metas Básicas e Recordes do Usuário
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      let userGoal = 2000;
      let recordInDb = 0;

      if (docSnap.exists()) {
        const userData = docSnap.data();
        userGoal = userData.goal || 2000;
        recordInDb = userData.bestStreak || 0;
      }
      setGoal(userGoal);
      setBestStreak(recordInDb);

      // 2. Análise Climatológica e Ajuste Dinâmico de Meta
      const temp = await getWeather();
      setTemperature(temp);
      const finalGoal = calculateGoal(userGoal, temp);
      setGoalAdjusted(finalGoal);

      // 3. Captura dos Registros de Ingestão Diários
      const q = query(
        collection(db, "waterLogs"),
        where("userId", "==", user.uid),
      );
      const querySnapshot = await getDocs(q);
      const logs: WaterLog[] = [];
      querySnapshot.forEach((d) => logs.push(d.data() as WaterLog));

      // 4. Agrupamento de Métricas por Chave de Data
      const grouped = logs.reduce((acc: GroupedLogs, log: WaterLog) => {
        if (!acc[log.date]) {
          acc[log.date] = { total: 0, goal: log.currentGoal || finalGoal };
        }
        acc[log.date].total += log.amount;
        return acc;
      }, {});

      // Convertendo o mapa agrupado em array ordenado de forma decrescente
      const historyArray: HistoryItem[] = Object.keys(grouped)
        .map((date) => ({
          date,
          total: grouped[date].total,
          goal: grouped[date].goal,
        }))
        .sort((a, b) => b.date.localeCompare(a.date));

      setHistory(historyArray);

      // 5. Ajuste ISO de Fuso Horário para captura da Data Local Fluida
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const todayStr = new Date(now.getTime() - offset)
        .toISOString()
        .split("T")[0];

      setWater(grouped[todayStr]?.total || 0);

      // 6. Algorítmo de Varredura Regressiva para Cálculo da Sequência (Streak)
      let currentStreak = 0;
      const dayTracker = new Date();

      // Caso a meta de hoje ainda não tenha sido atingida, a contagem avalia a partir de ontem
      if ((grouped[todayStr]?.total || 0) < finalGoal) {
        dayTracker.setDate(dayTracker.getDate() - 1);
      }

      while (true) {
        const dateKey = dayTracker.toISOString().split("T")[0];
        const targetGoal = grouped[dateKey]?.goal || finalGoal;

        if (grouped[dateKey]?.total >= targetGoal) {
          currentStreak++;
          dayTracker.setDate(dayTracker.getDate() - 1);
        } else {
          break;
        }
      }
      setStreak(currentStreak);

      // 7. Atualização Assíncrona de Recorde Histórico de Consistência
      if (currentStreak > recordInDb) {
        await updateDoc(userRef, { bestStreak: currentStreak });
        setBestStreak(currentStreak);
      }
    } catch (error) {
      console.error("Erro na execução do serviço useWaterData:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return {
    water,
    currentGoal: goalAdjusted || goal,
    history,
    streak,
    bestStreak,
    temperature,
    refresh: fetchData,
    setWater,
  };
}
