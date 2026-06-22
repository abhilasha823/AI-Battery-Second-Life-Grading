import { Activity, BatteryCharging, LayoutDashboard, UploadCloud } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload", icon: UploadCloud },
  { to: "/results", label: "Results", icon: Activity },
];

export default function Navbar() {
  return (
    <header className="site-header">
      <nav className="site-nav">
        <NavLink to="/" className="brand-link">
          <span className="brand-icon">
            <BatteryCharging size={24} />
          </span>
          <span>
            <span className="brand-title">SecondLife EV</span>
            <span className="brand-subtitle">Battery grading intelligence</span>
          </span>
        </NavLink>
        <div className="nav-links">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
