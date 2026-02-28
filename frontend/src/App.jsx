import { Route, Routes } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/routes/ProtectedRoute";

import VideoCall from "./components/video/VideoCall";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

function App() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Home with Navbar */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Home />
            </>
          </ProtectedRoute>
        }
      />

      {/* Protected Profile with Navbar */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Profile />
            </>
          </ProtectedRoute>
        }
      />

      {/* Protected Video Call (No Navbar if you want clean call screen) */}
      <Route
        path="/call/:callId"
        element={
          <ProtectedRoute>
            <VideoCall />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}

    </Routes>
  );
}

export default App;