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

                // 最新のドキュメント1件を使用（設定は1つだけと想定）
                if (data.length > 0) {
                    const latest = data[data.length - 1];
                    setPlayers(latest.playerNames || []);
                }
            } catch (error) {
                console.error("プレイヤー取得エラー:", error);
            }
        };

        fetchPlayers();
    }, []);

    // スコア入力変更
    const handleScoreChange = (player, value) => {
        setScores((prev) => ({
            ...prev,
            [player]: Number(value),
        }));
    };

    // Firestore にスコア保存
    const handleSave = async () => {
        try {
            await addDoc(collection(db, "scores"), {
                scores,
                createdAt: new Date(),
            });
            alert("スコアを保存しました！");
            setScores({});
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
                <div className="space-y-2">
                    {players.map((player, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <span className="w-24">{player}</span>
                            <input
                                type="number"
                                value={scores[player] || ""}
                                onChange={(e) => handleScoreChange(player, e.target.value)}
                                className="border p-2 rounded w-full"
                                placeholder="スコア"
                            />
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600"
            >
                保存
            </button>
        </div>
    );
};

export default ScoreInput;
