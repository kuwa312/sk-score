import React, { useState } from "react";
import { db } from "../firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

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
            // games コレクション内に新しいドキュメントを自動生成
            const gameRef = doc(collection(db, "games"));

            // ゲーム設定をドキュメントとして保存
            await setDoc(gameRef, {
                gameSettings: {
                    playerCount,
                    playerNames,
                    roundCount,
                },
                createdAt: new Date(),
            });

            // alert("保存しました！");
            navigate("/scoreInput", { state: { gameId: gameRef.id } });
        } catch (error) {
            console.error("保存エラー:", error);
            alert("保存に失敗しました。");
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 space-y-4">
            <h2 className="text-xl font-bold">ゲームの設定</h2>

            <div>
                <label className="block mb-1">人数を選択 (1〜10)</label>
                <select
                    value={playerCount}
                    onChange={handlePlayerCountChange}
                    className="border p-2 rounded w-full"
                >
                    {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                            {i + 1} 人
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                {playerNames.map((name, index) => (
                    <input
                        key={index}
                        type="text"
                        placeholder={`プレイヤー${index + 1} の名前`}
                        value={name}
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                ))}
            </div>

            <div>
                <label className="block mb-1">ラウンド数</label>
                <select
                    value={roundCount}
                    onChange={(e) => setRoundCount(Number(e.target.value))}
                    className="border p-2 rounded w-full"
                >
                    {[...Array(20)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                            {i + 1} ラウンド
                        </option>
                    ))}
                </select>
            </div>


            <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
            >
                はじめる
            </button>
        </div>
    );
};

export default Setting;
