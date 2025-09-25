import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Trophy, LineChart as LineChartIcon, ArrowRight } from "lucide-react"; // アイコン

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameId } = location.state;
  const [rounds, setRounds] = useState([]);
  const [totals, setTotals] = useState({});
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchRounds = async () => {
      if (!gameId) return;

      try {
        const roundsRef = collection(db, "games", gameId, "rounds");
        const q = query(roundsRef, orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc) => ({
          roundNumber: doc.id,
          ...doc.data(),
        }));
        setRounds(data);

        // 合計スコア計算
        const totalScores = {};
        data.forEach((round) => {
          Object.entries(round.scores || {}).forEach(([player, score]) => {
            totalScores[player] = (totalScores[player] || 0) + score;
          });
        });
        const sortedTotals = Object.fromEntries(
          Object.entries(totalScores).sort(([, a], [, b]) => b - a)
        );
        setTotals(sortedTotals);

        // グラフ用データ作成
        const chartArray = data.map((round) => {
          return {
            round: round.roundNumber,
            ...round.scores,
          };
        });
        setChartData(chartArray);
      } catch (error) {
        console.error("ラウンド結果取得エラー:", error);
      }
    };

    fetchRounds();
  }, [gameId]);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h2 className="text-3xl font-bold text-center mb-6">結果発表</h2>

      {/* 総合ランキング */}
      {Object.keys(totals).length > 0 && (
        <div className="border rounded-xl p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-md">
          <h3 className="flex items-center justify-center font-bold text-xl mb-4 text-gray-800">
            <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
            総合ランキング
          </h3>
          <ol className="space-y-3">
            {Object.entries(totals)
              .sort((a, b) => b[1] - a[1]) // スコア順にソート
              .map(([player, score], index) => {
                const rank = index + 1;
                const rankColors = {
                  1: "bg-yellow-400 text-white",
                  2: "bg-gray-300 text-white",
                  3: "bg-orange-400 text-white",
                };

                return (
                  <li
                    key={player}
                    className="flex items-center justify-between p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition"
                  >
                    {/* 順位バッジ */}
                    <span
                      className={`w-8 h-8 flex items-center justify-center rounded-full font-bold mr-3 ${rankColors[rank] || "bg-gray-200 text-gray-700"
                        }`}
                    >
                      {rank}
                    </span>

                    {/* 名前 */}
                    <span className="flex-1 font-bold text-gray-800">
                      {player}
                    </span>

                    {/* スコア */}
                    <span className="text-2xl font-semibold text-gray-600">{score}</span>
                    <span className="text-l">　pt</span>

                  </li>
                );
              })}
          </ol>
        </div>
      )}

      {/* グラフ表示 */}
      {chartData.length > 0 && (
        <div className="border rounded-xl p-6 bg-white shadow-md">
          <h3 className="flex items-center justify-center font-bold text-lg mb-4 text-gray-800">
            <LineChartIcon className="w-5 h-5 mr-2 text-blue-500" />
            ラウンドごとのスコア推移
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="round"
                label={{
                  value: "ラウンド",
                  position: "insideBottomRight",
                  offset: -5,
                }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(totals).map((player, idx) => (
                <Line
                  key={player}
                  type="liner"
                  dataKey={player}
                  stroke={`hsl(${(idx * 60) % 360}, 70%, 50%)`}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 次のゲームへ */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center justify-center gap-2 bg-blue-500 text-white text-lg font-medium px-6 py-3 rounded-xl w-full hover:bg-blue-600 shadow-md transition"
      >
        次のゲームへ
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Result;
