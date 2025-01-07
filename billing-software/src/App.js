import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from './NavBar';
import AddItem from "./AddItem";
import Billing from "./Billing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadPage from "./UploadPage"; // Import the UploadPage component
import "./App.css";

function NavigationBar() {
  const location = useLocation();

  // Conditionally render the navigation bar only if not on login or register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return <Navbar />;
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
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </Router>
  );
}

export default App;
