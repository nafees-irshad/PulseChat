import { Route, Routes } from "react-router-dom";
import Footer from "./components/footer.jsx";
import HomeCard from "./components/homeCard.jsx";
import Logo from "./components/logo.jsx";
import LoginPage from "./pages/users/login.jsx";
import ProfilePage from "./pages/users/profile.jsx";
import SignupPage from "./pages/users/signup.jsx";
import StartChat from "./pages/startChat.jsx";

function App() {
  return (
    <Logo>
      <Routes>
        <Route path="/" element={<HomeCard />} />
        <Route path="/chat" element={<StartChat />} />
        <Route path="/chat/:conversationId" element={<StartChat />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <Footer />
    </Logo>
  );
}
 
export default App;
