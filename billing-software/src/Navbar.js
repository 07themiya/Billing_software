import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";
import "./NavBar.css";

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff'
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#001e3c',
    width: 32,
    height: 32,
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff'
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#aab4be',
    borderRadius: 20 / 2,
  },
}));

function Navbar({ toggleTheme, currentTheme }) {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchLowStockItems = async () => {
      try {
        const itemsCollection = collection(db, "items");
        const snapshot = await getDocs(itemsCollection);

        if (snapshot.empty) {
          console.warn("Firestore collection 'items' is empty.");
          setNotifications(["No items found in inventory."]);
          return;
        }

        const lowStockItems = [];

        snapshot.forEach((doc) => {
          const item = doc.data();
          const itemQuantity = parseInt(item.quantity, 10) || 0; // Default to 0 if undefined
          const lowLimit = parseInt(item.lowLimit, 10) || 0; // Default to 0 if undefined

          if (!item.itemName) {
            console.warn("Item missing 'itemName':", item);
            return; // Skip this item
          }

          if (itemQuantity <= lowLimit) {
            lowStockItems.push(`⚠️ Low stock: ${item.itemName} (${itemQuantity} left)`);
          }
        });

        setNotifications(lowStockItems);
      } catch (error) {
        console.error("Error fetching low stock items:", error);
        setNotifications(["⚠️ Error fetching stock data"]);
      }
    };

    fetchLowStockItems();
  }, [db]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => navigate("/login"))
      .catch((error) => console.error("Logout Error:", error.message));
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <nav className="navbar">
      {/* Left Section */}
      <div className="nav-left">
        <Link to="/add-item">Add Item</Link>
        <Link to="/upload">Update</Link>
        <Link to="/credit">Credit</Link>
        <Link to="/billhistory">Bill History</Link>
        <Link to="/billing">Billing</Link>
      </div>

      {/* Center Section */}
      <div className="nav-center">
        <h1 className="nav-title">Billing Software</h1>
      </div>

      {/* Right Section */}
      <div className="nav-right">
        <MaterialUISwitch onChange={toggleTheme} checked={currentTheme === "dark"} />

        {/* Notification Icon */}
        <div className="notification-container">
          <button className="notification-icon" onClick={toggleNotifications} title="Notifications">
            🔔
          </button>
          {showNotifications && (
            <div className="notifications-dropdown">
              {notifications.length > 0 ? (
                <ul>
                  {notifications.map((notification, index) => (
                    <li key={index}>{notification}</li>
                  ))}
                </ul>
              ) : (
                <p>No low stock items</p>
              )}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;