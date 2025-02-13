import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Navbar from './NavBar';
import AddItem from "./AddItem";
import Billing from "./Billing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadPage from "./UploadPage";
import BillHistory from "./BillHistory";
import Footer from "./Footer";
import "./App.css";

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Router>
      <MainContent
        toggleTheme={toggleTheme}
        currentTheme={theme}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />
    </Router>
  );
}

function MainContent({ toggleTheme, currentTheme, isLoggedIn, setIsLoggedIn }) {
  const location = useLocation();

  // Define routes where the Navbar should not appear
  const hideNavbarOnRoutes = ["/login", "/register"];

  return (
    <>
      {/* Render Navbar only if the current path is not in the hideNavbarOnRoutes */}
      {!hideNavbarOnRoutes.includes(location.pathname) && (
        <Navbar toggleTheme={toggleTheme} currentTheme={currentTheme} />
      )}

      <Routes>
        {/* Default Route: Redirect to Login if not logged in, otherwise to Billing */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/billing" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* Register Page */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Protected Routes (Only accessible after login) */}
        {isLoggedIn && (
          <>
            <Route path="/add-item" element={<AddItem />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/billhistory" element={<BillHistory />} />
          </>
        )}

        {/* Fallback Route: Redirect to Login if not logged in */}
        <Route
          path="*"
          element={
            isLoggedIn ? (
              <Navigate to="/billing" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>

      {/* Render Footer only if the current path is not in the hideNavbarOnRoutes */}
      {!hideNavbarOnRoutes.includes(location.pathname) && <Footer />}
    </>
  );
}

export default App;