import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiClock,
  FiCalendar,
  FiCheckSquare,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

import "../../styles/sidebar.css";

function Sidebar() {
  const menuItems = [
    {
      label: "Dashboard",
      path: "/employee/dashboard",
      icon: <FiGrid />,
    },
    {
      label: "Attendance",
      path: "/employee/attendance",
      icon: <FiClock />,
    },
    {
      label: "Leave",
      path: "/employee/leave",
      icon: <FiCalendar />,
    },
    {
      label: "Tasks",
      path: "/employee/tasks",
      icon: <FiCheckSquare />,
    },
    {
      label: "Profile",
      path: "/employee/profile",
      icon: <FiUser />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">P</div>

        <div>
          <h2>Prazeon</h2>
          <p>Employee Portal</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <FiLogOut />
        <span>Logout</span>
      </button>
    </aside>
  );
}

export default Sidebar;
