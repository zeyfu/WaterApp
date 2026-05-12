import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
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
  const [temperature, setTemperature] = useState<number | null>(null);

  const fetchData = async () => {
    if (!user) return;

    try {
      // 1. Meta Base
      const docSnap = await getDoc(doc(db, "users", user.uid));
      let userGoal = 2000;
      if (docSnap.exists()) userGoal = docSnap.data().goal || 2000;
      setGoal(userGoal);

      // 2. Clima
      const temp = await getWeather();
      setTemperature(temp);
      setGoalAdjusted(calculateGoal(userGoal, temp));

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

      // 5. Hoje e Streak
      const today = new Date().toISOString().split("T")[0];
      setWater(grouped[today] || 0);

      let s = 0;
      let d = new Date();
      while (true) {
        const ds = d.toISOString().split("T")[0];
        if (grouped[ds] >= userGoal) {
          s++;
          d.setDate(d.getDate() - 1);
        } else break;
      }
      setStreak(s);
    } catch (e) {
      console.error(e);
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
    temperature,
    refresh: fetchData,
    setWater,
  };
}
