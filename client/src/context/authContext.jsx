import { useState } from "react";
import AuthContext from "./authContextStore.js";

const TOKEN_STORAGE_KEY = "token";

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() =>
    window.localStorage.getItem(TOKEN_STORAGE_KEY),
  );

  function setToken(nextToken) {
    if (nextToken) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      setTokenState(nextToken);
      return;
    }

    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setTokenState(null);
  }

  function clearToken() {
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated: Boolean(token), setToken, clearToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}
