import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";
import "../styles/layout.css";

function EmployeeLayout() {
  return (
    <div className="app-layout">
      <Sidebar role="employee" />

      <div className="app-main">
        <Header />

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default EmployeeLayout;
