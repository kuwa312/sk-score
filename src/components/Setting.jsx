import React, { useState } from "react";
import { db } from "../firebase"; // firebase.js で初期化した Firestore をインポート
import { collection, addDoc } from "firebase/firestore";

const Setting = () => {
    const [playerCount, setPlayerCount] = useState(1);
    const [playerNames, setPlayerNames] = useState([""]);

    // プレイヤー人数を変更したとき
    const handlePlayerCountChange = (e) => {
        const count = Number(e.target.value);
        setPlayerCount(count);

        // 入力欄を人数分に調整
        const newNames = [...playerNames];
        while (newNames.length < count) newNames.push("");
        while (newNames.length > count) newNames.pop();
        setPlayerNames(newNames);
    };

    // 名前の入力
    const handleNameChange = (index, value) => {
        const newNames = [...playerNames];
        newNames[index] = value;
        setPlayerNames(newNames);
    };

    // Firestore に保存
    const handleSave = async () => {
        try {
            await addDoc(collection(db, "players"), {
                playerCount,
                playerNames,
                createdAt: new Date(),
            });
            alert("保存しました！");
        } catch (error) {
            console.error("保存エラー:", error);
            alert("保存に失敗しました。");
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 space-y-4">
            <h2 className="text-xl font-bold">プレイヤー設定</h2>

            {/* プレイヤー人数選択 */}
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

            {/* 名前入力欄 */}
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

            {/* 保存ボタン */}
            <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
            >
                保存
            </button>
        </div>
    );
};

export default Setting;
