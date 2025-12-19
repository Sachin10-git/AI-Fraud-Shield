import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-950 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        <h1 className="text-xl font-bold text-white">
          Fraud Shield
        </h1>

        <div className="flex gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-white font-semibold"
                : "text-gray-400 hover:text-white"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/track"
            className={({ isActive }) =>
              isActive
                ? "text-white font-semibold"
                : "text-gray-400 hover:text-white"
            }
          >
            Track
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              isActive
                ? "text-white font-semibold"
                : "text-gray-400 hover:text-white"
            }
          >
            History
          </NavLink>
          <NavLink
  to="/transfer"
  className={({ isActive }) =>
    isActive
      ? "text-white font-semibold"
      : "text-gray-400 hover:text-white"
  }
>
  Transfer
</NavLink>

        </div>
      </div>
    </nav>
  );
}
