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
import ErrorBoundary from "./components/common/ErrorBoundary";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

      <Header />

      <Routes>
        <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
        <Route path="/about" element={<ErrorBoundary><About /></ErrorBoundary>} />
        <Route path="/services" element={<ErrorBoundary><Services /></ErrorBoundary>} />
        <Route path="/forum" element={<ErrorBoundary><Forum /></ErrorBoundary>} />
        <Route path="/courses" element={<ErrorBoundary><Courses /></ErrorBoundary>} />
        <Route path="/store" element={<ErrorBoundary><Store /></ErrorBoundary>} />
        <Route path="/gallery" element={<ErrorBoundary><Gallery /></ErrorBoundary>} />
        <Route path="/news" element={<ErrorBoundary><News /></ErrorBoundary>} />
        <Route path="/learning" element={<Navigate to="/gallery" replace />} />

        <Route path="/contact" element={<ErrorBoundary><Contact /></ErrorBoundary>} />
        <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
        <Route path="/signup" element={<ErrorBoundary><Signup /></ErrorBoundary>} />
        <Route path="/profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
      </Routes>

    </BrowserRouter>
  </AuthProvider>
  );
}

export default App;
