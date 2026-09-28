import { Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/footer.jsx";
import Logo from "./components/logo.jsx";
import ProtectedRoute from "./components/protectedRoute.jsx";
import PublicRoute from "./components/publicRoute.jsx";
import { useAuth } from "./context/useAuth.js";
import LoginPage from "./pages/users/login.jsx";
import ProfilePage from "./pages/users/profile.jsx";
import SignupPage from "./pages/users/signup.jsx";
import StartChat from "./pages/startChat.jsx";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Logo>
      <Routes>
        {/* Protected routes - load conversation list & chat interface on home page after login */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <StartChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <StartChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:conversationId"
          element={
            <ProtectedRoute>
              <StartChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Public auth routes (redirect to home if already logged in) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />

        {/* Any unauthorized or unmatched URL -> navigate to /login if not logged in, or / if logged in */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
        />
      </Routes>
      <Footer />
    </Logo>
  );
}

export default App;
