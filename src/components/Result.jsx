import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const Result = () => {
    const [results, setResults] = useState([]);

    // Firestore からスコアを取得
    useEffect(() => {
        const fetchResults = async () => {
            try {
                const q = query(
                    collection(db, "scores"),
                    orderBy("createdAt", "desc") // 新しい順に取得
                );
                const querySnapshot = await getDocs(q);

                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setResults(data);
            } catch (error) {
                console.error("結果の取得エラー:", error);
            }
        };

        fetchResults();
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            <h2 className="text-xl font-bold">結果一覧</h2>

            {results.length === 0 ? (
                <p className="text-gray-500">まだスコアが記録されていません。</p>
            ) : (
                <div className="space-y-4">
                    {results.map((result) => (
                        <div
                            key={result.id}
                            className="border rounded p-4 bg-white shadow-sm"
                        >
                            <p className="text-sm text-gray-500 mb-2">
                                記録日時:{" "}
                                {result.createdAt?.toDate
                                    ? result.createdAt.toDate().toLocaleString()
                                    : "日時不明"}
                            </p>

                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border px-2 py-1 text-left">プレイヤー</th>
                                        <th className="border px-2 py-1 text-right">スコア</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(result.scores || {}).map(([player, score]) => (
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
