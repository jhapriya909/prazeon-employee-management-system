import {
  FiClipboard,
  FiHome,
  FiLogOut,
  FiPlusCircle,
} from "react-icons/fi";

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

function ClientLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = localStorage.getItem("user");

  let user = {
    name: "Client",
    email: "",
  };

  try {
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error(
      "Unable to read client information:",
      error
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  const getNavStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "13px 16px",
    marginBottom: "8px",
    borderRadius: "10px",
    color: isActive ? "#ffffff" : "#c8ccea",
    background: isActive
      ? "linear-gradient(135deg, #6956e8, #5946d9)"
      : "transparent",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: isActive ? "600" : "500",
    transition: "0.2s ease",
  });

  const sidebarButtonStyle = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "13px 16px",
    marginBottom: "8px",
    color: "#c8ccea",
    background: "transparent",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "left",
  };

 const openNewRequestModal = () => {
  if (location.pathname === "/client/dashboard") {
    window.dispatchEvent(
      new CustomEvent("open-client-request-modal")
    );

    return;
  }

  sessionStorage.setItem(
    "openClientRequestModal",
    "true"
  );

  navigate("/client/dashboard");
};
  const clientInitial =
    user?.name?.charAt(0)?.toUpperCase() || "C";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#f4f6fb",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <aside
        style={{
          width: "222px",
          minHeight: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          padding: "22px 16px",
          boxSizing: "border-box",
          color: "#ffffff",
          background:
            "linear-gradient(180deg, #11173f 0%, #171d52 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "11px",
            padding: "0 7px 24px",
            borderBottom:
              "1px solid rgba(255,255,255,0.09)",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              display: "grid",
              placeItems: "center",
              fontWeight: "800",
              fontSize: "18px",
              background:
                "linear-gradient(135deg, #7562ef, #5541d7)",
              boxShadow:
                "0 8px 20px rgba(88,70,218,0.35)",
            }}
          >
            P
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Prazeon
            </h2>

            <p
              style={{
                margin: "3px 0 0",
                color: "#9ca4d2",
                fontSize: "11px",
              }}
            >
              Client Portal
            </p>
          </div>
        </div>

        <p
          style={{
            margin: "25px 8px 13px",
            color: "#7f88bc",
            fontSize: "10px",
            letterSpacing: "1.3px",
            fontWeight: "700",
          }}
        >
          MAIN MENU
        </p>

        <nav>
          <NavLink
            to="/client/dashboard"
            end
            style={getNavStyle}
          >
            <FiHome size={17} />
            Dashboard
          </NavLink>

          <NavLink
            to="/client/requests"
            style={getNavStyle}
          >
            <FiClipboard size={17} />
            My Requests
          </NavLink>

          <button
            type="button"
            onClick={openNewRequestModal}
            style={sidebarButtonStyle}
          >
            <FiPlusCircle size={17} />
            New Request
          </button>
        </nav>

        <div
          style={{
            marginTop: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px",
              marginBottom: "12px",
              borderRadius: "12px",
              backgroundColor:
                "rgba(255,255,255,0.07)",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                flexShrink: 0,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontWeight: "700",
                backgroundColor: "#6652e7",
              }}
            >
              {clientInitial}
            </div>

            <div
              style={{
                minWidth: 0,
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.name || "Client"}
              </strong>

              <span
                style={{
                  display: "block",
                  marginTop: "3px",
                  color: "#9ca4d2",
                  fontSize: "10px",
                }}
              >
                Client Account
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "9px",
              padding: "11px",
              color: "#d4d8f2",
              background: "transparent",
              border:
                "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </aside>

      <div
        style={{
          width: "calc(100% - 222px)",
          minHeight: "100vh",
          marginLeft: "222px",
        }}
      >
        <header
          style={{
            height: "92px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            boxSizing: "border-box",
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #eceef5",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#171d35",
                fontSize: "19px",
              }}
            >
              Welcome back, {user?.name || "Client"}
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#8a91a7",
                fontSize: "12px",
              }}
            >
              Submit requests and track their progress
              from one place.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: "#ffffff",
                fontWeight: "700",
                backgroundColor: "#604ce2",
              }}
            >
              {clientInitial}
            </div>

            <div>
              <strong
                style={{
                  display: "block",
                  color: "#242a40",
                  fontSize: "12px",
                }}
              >
                {user?.name || "Client"}
              </strong>

              <span
                style={{
                  color: "#9298aa",
                  fontSize: "10px",
                }}
              >
                Client
              </span>
            </div>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ClientLayout;
