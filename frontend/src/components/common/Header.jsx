import { FiBell, FiChevronDown } from "react-icons/fi";
import "../../styles/layout.css";

function Header() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <header className="top-header">
      <div>
        <h1>Welcome back, {user?.name || "Employee"}</h1>
        <p>Here is your work overview for today.</p>
      </div>

      <div className="header-actions">
        <button className="notification-button" type="button">
          <FiBell />
          <span className="notification-dot" />
        </button>

        <div className="header-profile">
          <div className="profile-avatar">
            {(user?.name || "E").charAt(0).toUpperCase()}
          </div>

          <div className="profile-details">
            <strong>{user?.name || "Employee"}</strong>
            <span>{user?.designation || "Employee"}</span>
          </div>

          <FiChevronDown className="profile-arrow" />
        </div>
      </div>
    </header>
  );
}

export default Header;