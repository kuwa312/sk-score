import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Navbar from './components/Navbar';
import Setting from './components/Setting';
import ScoreInput from './components/ScoreInput';
import Result from './components/Result';


function App() {

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/setting" element={<Setting />} />
        <Route path="/scoreinput" element={<ScoreInput />} />
        <Route path="/result" element={<Result />} />

      </Routes>

    </Router>
  )
}

export default App
