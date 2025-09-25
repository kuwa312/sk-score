import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useLocation } from "react-router-dom";

const Result = () => {
    const location = useLocation();
    const { gameId } = location.state;
    const [rounds, setRounds] = useState([]);
    const [totals, setTotals] = useState({});

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

                // 合計スコア順にソートしてオブジェクトを作り直す
                const sortedTotals = Object.fromEntries(
                    Object.entries(totalScores).sort(([, a], [, b]) => b - a)
                );

                setTotals(sortedTotals);
            } catch (error) {
                console.error("ラウンド結果取得エラー:", error);
            }
        };

        fetchRounds();
    }, [gameId]);

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-6">
            <h2 className="text-xl font-bold">ゲーム結果</h2>


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

            {/* ラウンドごとのスコア */}
            {rounds.length === 0 ? (
                <p className="text-gray-500">まだスコアが記録されていません。</p>
            ) : (
                <div className="space-y-4">
                    {rounds.map((round) => (
                        <div
                            key={round.roundNumber}
                            className="border rounded p-4 bg-white shadow-sm"
                        >
                            <p className="text-sm text-gray-500 mb-2">
                                ラウンド {round.roundNumber}
                            </p>
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border px-2 py-1 text-left">プレイヤー</th>
                                        <th className="border px-2 py-1 text-right">スコア</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(round.scores || {}).map(([player, score]) => (
                                        <tr key={player}>
                                            <td className="border px-2 py-1">{player}</td>
                                            <td className="border px-2 py-1 text-right">{score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default Result;
