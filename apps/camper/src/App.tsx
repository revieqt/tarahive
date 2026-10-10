import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router";
import Camper from "./pages/Camper";
import Shop from "./pages/Shop";
import Avatar from "./pages/Avatar";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="topbar">
          <NavLink to="/camper" className="brand">
            🐝 TaraHive
          </NavLink>

          <nav className="navigation">
            <NavLink
              to="/camper"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              🚐 Camper
            </NavLink>

            <NavLink
              to="/avatar"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              ✨ Avatar
            </NavLink>

            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              🍯 Shop
            </NavLink>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/camper" replace />} />
          <Route path="/camper" element={<Camper />} />
          <Route path="/avatar" element={<Avatar />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="*" element={<Navigate to="/camper" replace />} />
        </Routes>

        <footer className="footer">
          Made with 🍯 for your next little adventure.
        </footer>
      </div>
    </BrowserRouter>
  );
}