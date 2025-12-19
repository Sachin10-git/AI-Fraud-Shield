import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Track from "./pages/Track";
import History from "./pages/History";
import Transfer from "./pages/Transfer";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />

        <main className="max-w-6xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/track" element={<Track />} />
            <Route path="/history" element={<History />} />
            <Route path="/transfer" element={<Transfer />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
