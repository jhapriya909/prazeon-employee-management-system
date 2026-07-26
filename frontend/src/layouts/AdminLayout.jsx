import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiClock,
  FiCheckSquare,
  FiCalendar,
  FiSettings,
  FiLogOut,
  FiBell,
  FiChevronDown,
} from "react-icons/fi";

import "../styles/adminLayout.css";

function AdminLayout() {
  const navigate = useNavigate();

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch (error) {
    console.error("Unable to read user data:", error);
  }

  const adminName = user.name || "Prazeon Admin";
  const adminRole = user.designation || "Administrator";
  const firstLetter = adminName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: <FiGrid />,
    },
    {
      label: "Employees",
      path: "/admin/employees",
      icon: <FiUsers />,
    },
    {
      label: "Attendance",
      path: "/admin/attendance",
      icon: <FiClock />,
    },
    {
      label: "Tasks",
      path: "/admin/tasks",
      icon: <FiCheckSquare />,
    },
    {
      label: "Leave Management",
      path: "/admin/leaves",
      icon: <FiCalendar />,
    },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: <FiSettings />,
    },
  ];

  return (
    <div className="admin-app-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-brand-logo">P</div>

          <div className="admin-brand-text">
            <h2>Prazeon</h2>
            <p>Admin Portal</p>
          </div>
        </div>

        <div className="admin-sidebar-label">MAIN MENU</div>

        <nav className="admin-sidebar-menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "admin-menu-link admin-menu-link-active"
                  : "admin-menu-link"
              }
            >
              <span className="admin-menu-icon">{item.icon}</span>
              <span className="admin-menu-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-profile">
            <div className="admin-sidebar-avatar">{firstLetter}</div>

            <div className="admin-sidebar-user-info">
              <strong>{adminName}</strong>
              <span>{adminRole}</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="admin-main-area">
        <header className="admin-topbar">
          <div className="admin-topbar-welcome">
            <h1>Welcome back, {adminName}</h1>
            <p>Manage employees and company activities from one place.</p>
          </div>

          <div className="admin-topbar-actions">
            <button
              type="button"
              className="admin-notification-button"
              aria-label="Notifications"
            >
              <FiBell />
              <span className="admin-notification-dot"></span>
            </button>

            <div className="admin-topbar-profile">
              <div className="admin-topbar-avatar">{firstLetter}</div>

              <div className="admin-topbar-user-details">
                <strong>{adminName}</strong>
                <span>{adminRole}</span>
              </div>

              <FiChevronDown className="admin-profile-arrow" />
            </div>
          </div>
        </header>

        <main className="admin-page-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;