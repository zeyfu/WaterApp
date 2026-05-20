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
// Importe o db pronto aqui:
import { db } from "../services/firebaseConfig";
import { calculateGoal, getWeather } from "../services/weather";

export function useWaterData(user: any) {
  const [water, setWater] = useState(0);
  const [goal, setGoal] = useState(2000);
  const [goalAdjusted, setGoalAdjusted] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0); // Estado para o Recorde
  const [temperature, setTemperature] = useState<number | null>(null);

  const fetchData = async () => {
    if (!user) return;

    try {
      // 1. Dados do Usuário (Meta e Recorde)
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      let userGoal = 2000;
      let recordInDb = 0;

      if (docSnap.exists()) {
        const userData = docSnap.data();
        userGoal = userData.goal || 2000;
        recordInDb = userData.bestStreak || 0; // Busca o recorde salvo
      }
      setGoal(userGoal);
      setBestStreak(recordInDb);

      // 2. Clima
      const temp = await getWeather();
      setTemperature(temp);
      const finalGoal = calculateGoal(userGoal, temp);
      setGoalAdjusted(finalGoal);

      // 3. Logs do Firebase
      const q = query(
        collection(db, "waterLogs"),
        where("userId", "==", user.uid),
      );
      const querySnapshot = await getDocs(q);
      const logs: any[] = [];
      querySnapshot.forEach((d) => logs.push(d.data()));

      // 4. Agrupamento e Histórico
      const grouped = logs.reduce((acc: any, log: any) => {
        if (!acc[log.date]) {
          acc[log.date] = { total: 0, goal: log.currentGoal || finalGoal };
        }
        acc[log.date].total += log.amount;
        return acc;
      }, {});

      const historyArray = Object.keys(grouped)
        .map((date) => ({
          date,
          total: grouped[date].total,
          goal: grouped[date].goal,
        }))
        .sort((a, b) => b.date.localeCompare(a.date));

      setHistory(historyArray);

      // 5. Água de Hoje
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const localISODate = new Date(now.getTime() - offset)
        .toISOString()
        .split("T")[0];

      const todayStr = localISODate;
      setWater(grouped[todayStr]?.total || 0);

      // 6. Cálculo de Streak (Sequência Atual)
      let s = 0;
      let d = new Date();

      if ((grouped[todayStr]?.total || 0) < finalGoal) {
        d.setDate(d.getDate() - 1);
      }

      while (true) {
        const ds = d.toISOString().split("T")[0];
        const targetGoal = grouped[ds]?.goal || finalGoal; // Usa a meta daquele dia específico

        if (grouped[ds]?.total >= targetGoal) {
          s++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }
      setStreak(s);

      // 7. Atualizar Recorde no Firestore (Se o atual for maior que o salvo)
      if (s > recordInDb) {
        await updateDoc(userRef, { bestStreak: s });
        setBestStreak(s);
      }
    } catch (e) {
      console.error("Erro no useWaterData:", e);
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
    bestStreak, // Retorna o recorde para a Home
    temperature,
    refresh: fetchData,
    setWater,
  };
}
