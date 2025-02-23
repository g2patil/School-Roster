import React, { createContext, useState, useEffect ,useContext} from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Check if sessionId exists on page reload (from localStorage)
  useEffect(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);  // Load sessionId from localStorage if it exists
      // Optionally, fetch user data with sessionId if required (using the sessionId)
    }
  }, []);

  const login = async (credentials) => {
    try {
      console.log("jitu ++");
      const res = await axios.post("http://192.168.1.114:8082/adnya/login", credentials, { withCredentials: true });
      if (res.data.sessionId) {
        setSessionId(res.data.sessionId);  // Store sessionId in state
      //  localStorage.setItem("sessionValid", "true");
        console.log("jitu +"+res.data.sessionId);

        setUser({
          username: res.data.username,
          roles: res.data.roles
        });

        alert(" ses id "+res.data.sessionId);
        localStorage.setItem("sessionId", res.data.sessionId);  // Store sessionId in localStorage
        setUser({ username: credentials.username });  // Optionally, store user data (like username)
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Login failed");
    }
  };

  const logout = async () => {
    try {
      await axios.post("http://192.168.1.114:8082/api/auth/logout", {}, { withCredentials: true });
      setUser(null);  // Clear user state
      setSessionId(null);  // Clear sessionId from state
      localStorage.removeItem("sessionId");  // Remove sessionId from localStorage
    //  navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, sessionId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
// Custom hook to use AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};


/*import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check if session exists on page reload
  useEffect(() => {
    axios.get("/api/auth/session", { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const login = async (credentials) => {
    const res = await axios.post("http://192.168.1.114:8082/adnya/login", credentials, { withCredentials: true });
    setUser(res.data.user);
  };

  const logout = async () => {
    await axios.post("/api/auth/logout", {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
*/