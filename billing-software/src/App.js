import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import AddItem from "./AddItem";
import Billing from "./Billing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";

function NavigationBar() {
  const location = useLocation();

  // Conditionally render the navigation bar only if not on login or register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <div className="navbar">
      <Link to="/add-item" className="nav-link">Add Items</Link>
      <Link to="/billing" className="nav-link">Billing</Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-item" element={<AddItem />} />
        <Route path="/billing" element={<Billing />} />
      </Routes>
    </Router>
  );
}

export default App;
