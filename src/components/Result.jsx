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
            <h2 className="text-xl font-bold">結果</h2>

            {/* 総合ランキング */}
            {Object.keys(totals).length > 0 && (
                <div className="mt-6 border rounded p-4 bg-yellow-50 shadow-sm">
                    <h3 className="font-bold text-lg mb-2">総合ランキング</h3>
                    <ol className="list-decimal list-inside space-y-1">
                        {Object.entries(totals).map(([player, score]) => (
                            <li key={player} className="flex justify-between">
                                <span>{player}</span>
                                <span>{score}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            {/* グラフ表示 */}
            {chartData.length > 0 && (
                <div className="border rounded p-4 bg-white shadow-sm">
                    <h3 className="font-bold text-lg mb-2">ラウンドごとのスコア推移</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="round" label={{ value: "ラウンド", position: "insideBottomRight", offset: -5 }} />
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
            <button
                onClick={() => navigate("/")}
                className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 mt-4"
            >
                次のゲームへ
            </button>
        </div>
    );
};

export default Result;
