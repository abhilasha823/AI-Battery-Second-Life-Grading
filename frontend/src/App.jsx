import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Results from "./pages/Results.jsx";
import Upload from "./pages/Upload.jsx";
import Passport from "./pages/Passport";

export default function App() {
  return (
    <div className="app-shell">
      <div className="app-ambient" />
      <div className="app-content">
        <Navbar />
        <main className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/results" element={<Results />} />
            <Route path="/passport/:batteryId"element={<Passport />}/>
          </Routes>
        </main>
      </div>
    </div>
  );
}

