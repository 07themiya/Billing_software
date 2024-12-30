import React from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

function Navbar() {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Logout successful, navigate to login page
        navigate("/login");
      })
      .catch((error) => {
        console.error("Logout Error:", error.message);
      });
  };

  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li>
          <a href="/add-item">Add Item</a>
        </li>
        <li>
          <a href="/billing">Billing</a>
        </li>
        <li>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
