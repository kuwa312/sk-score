import React, { useState } from "react";
import { db } from "../firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Users, Layers, Play } from "lucide-react"; // アイコン

const Setting = () => {
    const navigate = useNavigate();
    const [playerCount, setPlayerCount] = useState(1);
    const [playerNames, setPlayerNames] = useState([""]);
    const [roundCount, setRoundCount] = useState(1);

    const handlePlayerCountChange = (e) => {
        const count = Number(e.target.value);
        setPlayerCount(count);
        const newNames = [...playerNames];
        while (newNames.length < count) newNames.push("");
        while (newNames.length > count) newNames.pop();
        setPlayerNames(newNames);
    };

    const handleNameChange = (index, value) => {
        const newNames = [...playerNames];
        newNames[index] = value;
        setPlayerNames(newNames);
    };

    const handleSave = async () => {
        try {
            const gameRef = doc(collection(db, "games"));
            await setDoc(gameRef, {
                gameSettings: {
                    playerCount,
                    playerNames,
                    roundCount,
                },
                createdAt: new Date(),
            });
            navigate("/scoreInput", { state: { gameId: gameRef.id } });
        } catch (error) {
            console.error("保存エラー:", error);
            alert("保存に失敗しました。");
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 space-y-6 rounded-xl ">
            {/* 見出し */}
            <h2 className="flex items-center justify-center text-2xl font-bold text-gray-800">
                <Users className="w-6 h-6 mr-2 text-blue-500" />
                人数とラウンド数を決めてね
            </h2>

            {/* 人数 */}
            <div>
                <label className="block mb-2 font-medium text-gray-700">
                    人数を選択 (1〜10)
                </label>
                <select
                    value={playerCount}
                    onChange={handlePlayerCountChange}
                    className="border p-2 rounded-lg w-full bg-white shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                    {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                            {i + 1} 人
                        </option>
                    ))}
                </select>
            </div>

            {/* プレイヤー名入力 */}
            <div className="space-y-2">
                {playerNames.map((name, index) => (
                    <input
                        key={index}
                        type="text"
                        placeholder={`プレイヤー${index + 1} の名前`}
                        value={name}
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        className="border p-2 rounded-lg w-full shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                ))}
            </div>

            {/* ラウンド数 */}
            <div>
                <label className="block mb-2 font-medium text-gray-700 flex items-center">
                    <Layers className="w-5 h-5 mr-1 text-blue-500" />
                    ラウンド数
                </label>
                <select
                    value={roundCount}
                    onChange={(e) => setRoundCount(Number(e.target.value))}
                    className="border p-2 rounded-lg w-full bg-white shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                    {[...Array(20)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                            {i + 1} ラウンド
                        </option>
                    ))}
                </select>
            </div>

            {/* ボタン */}
            <button
                onClick={handleSave}
                className="flex items-center justify-center gap-2 bg-blue-500 text-white text-lg font-medium px-6 py-3 rounded-xl w-full hover:bg-blue-600 shadow-md transition"
            >
                <Play className="w-5 h-5" />
                はじめる
            </button>
        </div>
    );
};

export default Setting;
