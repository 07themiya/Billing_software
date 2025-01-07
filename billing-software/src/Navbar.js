import React from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import "./NavBar.css";

function Navbar() {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = () => {
    console.log("Logout button clicked"); // Debugging purpose
    signOut(auth)
      .then(() => navigate("/login"))
      .catch((error) => console.error("Logout Error:", error.message));
  };

  return (
    <nav className="navbar">
      {/* Left Section */}
      <div className="nav-left">
        <a href="/add-item">Add Item</a>
        <a href="/upload">Update</a>
        <a href="/billing">Billing</a>
      </div>

      {/* Center Section */}
      <div className="nav-center">
        <h1 className="nav-title">Billing Software</h1>
      </div>

      {/* Right Section */}
      <div className="nav-right">
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
