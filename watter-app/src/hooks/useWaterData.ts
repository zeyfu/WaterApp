import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { app } from "../services/firebaseConfig";
import { calculateGoal, getWeather } from "../services/weather";

const db = getFirestore(app);

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
        acc[log.date] = (acc[log.date] || 0) + log.amount;
        return acc;
      }, {});

      const historyArray = Object.keys(grouped)
        .map((date) => ({ date, total: grouped[date] }))
        .sort((a, b) => b.date.localeCompare(a.date));

      setHistory(historyArray);

      // 5. Água de Hoje
      const today = new Date().toISOString().split("T")[0];
      setWater(grouped[today] || 0);

      // 6. Cálculo de Streak (Sequência Atual)
      let s = 0;
      let d = new Date();

      // Se não bateu a meta hoje, verificamos se a sequência está viva por ontem
      if ((grouped[today] || 0) < finalGoal) {
        d.setDate(d.getDate() - 1);
      }

      while (true) {
        const ds = d.toISOString().split("T")[0];
        if (grouped[ds] >= finalGoal) {
          s++;
          d.setDate(d.getDate() - 1);
        } else break;
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
