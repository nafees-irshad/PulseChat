import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/authContext.jsx";
import { ConversationProvider } from "./context/conversationContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <ConversationProvider>
          <App />
        </ConversationProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
