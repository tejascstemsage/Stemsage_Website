import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/common/Header";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Forum from "./pages/Forum";
import Courses from "./pages/Courses";
import Store from "./pages/Store";
import Gallery from "./pages/Gallery";
import News from "./pages/News";

import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/store" element={<Store />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/news" element={<News />} />
        <Route path="/learning" element={<Navigate to="/gallery" replace />} />

        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>

    </BrowserRouter>
  </AuthProvider>
  );
}

export default App;
