import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <nav className="flex h-12 bg-orange-400">
            <Link to="/setting" className="flex-1 flex items-center justify-center bg-blue-300">
                設定
            </Link>
            <Link to="/scoreinput" className="flex-1 flex items-center justify-center bg-blue-200">
                スコア入力
            </Link>
            <Link to="/result" className="flex-1 flex items-center justify-center bg-blue-100">
                結果
            </Link>
        </nav>
    );

}

export default Navbar
