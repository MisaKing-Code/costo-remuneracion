import ExecutiveDashboard from "./pages/ExecutiveDashboard.jsx";
import Login from "./components/Login.jsx";
import { useState } from "react";

const AUTH_STORAGE_KEY = "psl-dashboard-authenticated";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
  });

  const handleLogin = () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <ExecutiveDashboard onLogout={handleLogout} />;
}
