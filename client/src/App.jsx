import { Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/footer.jsx";
import Logo from "./components/logo.jsx";
import ProtectedRoute from "./components/protectedRoute.jsx";
import PublicRoute from "./components/publicRoute.jsx";
import LoginPage from "./pages/users/login.jsx";
import ForgotPasswordPage from "./pages/users/forgotPassword.jsx";
import ProfilePage from "./pages/users/profile.jsx";
import SignupPage from "./pages/users/signup.jsx";
import AppearancePage from "./pages/users/appearance.jsx";
import StartChat from "./pages/startChat.jsx";

function App() {
  return (
    <Logo>
      <Routes>
        {/* Home is available without an account; conversation history remains private. */}
        <Route
          path="/"
          element={<StartChat />}
        />
        <Route
          path="/chat"
          element={<StartChat />}
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
        <Route
          path="/profile/appearance"
          element={
            <ProtectedRoute>
              <AppearancePage />
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
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
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

        {/* Unknown URLs return to the public home page. */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
      <Footer />
    </Logo>
  );
}

export default App;
