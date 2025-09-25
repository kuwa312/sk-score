import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";

const ScoreInput = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { gameId } = location.state;
    const [players, setPlayers] = useState([]);
    const [scores, setScores] = useState({});
    const [roundNumber, setRoundNumber] = useState(1);
    const [totalRounds, setTotalRounds] = useState(1);

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

    const handleScoreChange = (player, delta) => {
        setScores((prev) => ({
            ...prev,
            [player]: (prev[player] || 0) + delta,
        }));
    };

    const handleSave = async () => {
        try {
            const roundRef = doc(db, "games", gameId, "rounds", String(roundNumber));
            await setDoc(roundRef, {
                scores,
                createdAt: new Date(),
            });

            if (roundNumber >= totalRounds) {
                navigate("/result", { state: { gameId } });
            } else {
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

    // 前のラウンドへ
    const handlePrevRound = () => {
        if (roundNumber > 1) {
            setRoundNumber((prev) => prev - 1);
            // Firestore から過去のラウンドスコアを取ってきたい場合はここで getDoc すればOK
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 space-y-6 rounded-xl">
            {/* ラウンド見出し */}
            <h2 className="flex items-center justify-center font-bold text-2xl text-gray-800">
                ラウンド <span className="ml-2 text-4xl text-blue-600">{roundNumber}</span>
            </h2>

            {players.length === 0 ? (
                <p className="text-gray-500 text-center">プレイヤーが設定されていません。</p>
            ) : (
                <div className="space-y-4">
                    {players.map((player, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between bg-white shadow-sm rounded-lg p-4 hover:shadow-md transition"
                        >
                            <div className="text-xl flex-1 text-center font-medium text-gray-800">
                                {player}
                            </div>
                            <div className="flex items-center gap-3 flex-1 justify-center">
                                <button
                                    onClick={() => handleScoreChange(player, -10)}
                                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                >
                                    -10
                                </button>
                                <span className="w-16 text-center text-lg font-bold text-gray-700">
                                    {scores[player] > 0 ? `+${scores[player]}` : scores[player]}
                                </span>
                                <button
                                    onClick={() => handleScoreChange(player, 10)}
                                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                >
                                    +10
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 前へ / 次へ */}
            <div className="flex gap-4">
                <button
                    onClick={handlePrevRound}
                    disabled={roundNumber <= 1}
                    className={`flex-1 px-6 py-3 rounded-xl shadow-md transition font-medium ${roundNumber <= 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gray-500 text-white hover:bg-gray-600"
                        }`}
                >
                    前のラウンドへ
                </button>
                <button
                    onClick={handleSave}
                    className="flex-1 bg-blue-500 text-white text-lg font-medium px-6 py-3 rounded-xl hover:bg-blue-600 shadow-md transition"
                >
                    {roundNumber >= totalRounds ? "結果へ" : "次のラウンドへ"}
                </button>
            </div>
        </div>
    );
};

export default ScoreInput;
