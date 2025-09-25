import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

const ScoreInput = () => {
    const [players, setPlayers] = useState([]);
    const [scores, setScores] = useState({});

    // Firestore からプレイヤー一覧を取得
    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "players"));
                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // 最新の設定を使う
                if (data.length > 0) {
                    const latest = data[data.length - 1];
                    setPlayers(latest.playerNames || []);

                    // 初期スコアを 0 に設定
                    const initScores = {};
                    (latest.playerNames || []).forEach((p) => {
                        initScores[p] = 0;
                    });
                    setScores(initScores);
                }
            } catch (error) {
                console.error("プレイヤー取得エラー:", error);
            }
        };

        fetchPlayers();
    }, []);

    // スコア増減
    const handleScoreChange = (player, delta) => {
        setScores((prev) => ({
            ...prev,
            [player]: (prev[player] || 0) + delta,
        }));
    };

    // Firestore に保存
    const handleSave = async () => {
        try {
            await addDoc(collection(db, "scores"), {
                scores,
                createdAt: new Date(),
            });
            alert("スコアを保存しました！");
        } catch (error) {
            console.error("スコア保存エラー:", error);
            alert("保存に失敗しました。");
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 space-y-4">
            <h2 className="text-xl font-bold">スコア入力</h2>

            {players.length === 0 ? (
                <p className="text-gray-500">プレイヤーが設定されていません。</p>
            ) : (
                <div className="space-y-3">
                    {players.map((player, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between bg-white shadow rounded-lg p-3"
                        >
                            <span className="font-medium">{player}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleScoreChange(player, -10)}
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    -10
                                </button>
                                <span className="w-12 text-center text-lg font-bold">
                                    {scores[player]}
                                </span>
                                <button
                                    onClick={() => handleScoreChange(player, +10)}
                                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    +10
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
            >
                保存
            </button>
        </div>
    );
};

export default ScoreInput;
