import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from './NavBar';
import AddItem from "./AddItem";
import Billing from "./Billing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadPage from "./UploadPage"; 
import Footer from "./Footer";
import "./App.css";

function App() {
  return (
    <Router>
      <MainContent />
    </Router>
  );
}

function MainContent() {
  const location = useLocation();

  // Define routes where the Navbar should not appear
  const hideNavbarOnRoutes = ["/login", "/register"];

  return (
    <>
      {/* Render Navbar only if the current path is not in the hideNavbarOnRoutes */}
      {!hideNavbarOnRoutes.includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-item" element={<AddItem />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
