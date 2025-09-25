import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";

const ScoreInput = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { gameId } = location.state; // Setting から渡された gameId
    const [players, setPlayers] = useState([]);
    const [scores, setScores] = useState({});
    const [roundNumber, setRoundNumber] = useState(1);
    const [totalRounds, setTotalRounds] = useState(1); // 総ラウンド数

    // Firestore からゲーム設定を取得
    useEffect(() => {
        const fetchGameSettings = async () => {
            if (!gameId) return;

            try {
                const gameRef = doc(db, "games", gameId);
                const gameSnap = await getDoc(gameRef);

                if (gameSnap.exists()) {
                    const { gameSettings } = gameSnap.data();
                    setPlayers(gameSettings.playerNames || []);
                    setTotalRounds(gameSettings.roundCount || 1);

                    // 初期スコアは 0
                    const initScores = {};
                    (gameSettings.playerNames || []).forEach((p) => {
                        initScores[p] = 0;
                    });
                    setScores(initScores);
                }
            } catch (error) {
                console.error("ゲーム取得エラー:", error);
            }
        };

        fetchGameSettings();
    }, [gameId]);

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
            const roundRef = doc(db, "games", gameId, "rounds", String(roundNumber));
            await setDoc(roundRef, {
                scores,
                createdAt: new Date(),
            });

            if (roundNumber >= totalRounds) {
                // 最終ラウンドなら結果画面に遷移
                navigate("/result", { state: { gameId } });
            } else {
                // 次のラウンドに進む
                setRoundNumber((prev) => prev + 1);
                const resetScores = {};
                players.forEach((p) => (resetScores[p] = 0));
                setScores(resetScores);
            }
        } catch (error) {
            console.error("スコア保存エラー:", error);
            alert("保存に失敗しました。");
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 space-y-4">
            <h2 className="font-bold text-xl">
                ラウンド <span className="text-3xl text-blue-600">{roundNumber}</span> スコア入力
            </h2>

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
                                    {scores[player] > 0 ? `+${scores[player]}` : scores[player]}
                                </span>
                                <button
                                    onClick={() => handleScoreChange(player, 10)}
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
                {roundNumber >= totalRounds ? "結果へ" : "次のラウンドへ"}
            </button>
        </div>
    );
};

export default ScoreInput;
