import React, { createContext, useState, useEffect ,useContext} from "react";
import axios from "axios";
import config from "../config";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
 // const API_URL = process.env.REACT_APP_API_URL;
 // console.log(API_URL);
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
      const res = await axios.post(`${config.API_URL}/login`, credentials, { withCredentials: true });
      if (res.data.sessionId) {
        setSessionId(res.data.sessionId);  // Store sessionId in state
      //  localStorage.setItem("sessionValid", "true");
      //  console.log("jitu +"+res.data.sessionId);

        setUser({
          username: res.data.username,
          roles: res.data.roles
        });

       // alert(" ses id "+res.data.sessionId);
        localStorage.setItem("sessionId", res.data.sessionId);  // Store sessionId in localStorage
        setUser({ username: credentials.username });  // Optionally, store user data (like username)
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Login failed");
    }
  };

  /************* */
  const [userInfo, setUserInfo] = useState(null);
  useEffect(() => {
    fetch("http://192.168.1.114:8082/adnya/userinfo", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important if your backend uses sessions
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user info");
        return res.json();
      })
      .then((data) => {
        console.log("User Info:", data); // For debug
        setUserInfo(data);
        console.log("2 User Info:", data);
      })
      .catch((err) => {
        console.error("Error fetching user info:", err);
      });
  }, []);
  const instituteId = userInfo?.institute?.id;
  //const instituteId = userInfo.institute?.id;
  /*************/


  
  const logout = async () => {
    try {
      await axios.post(`${config.API_URL}/logout`, {}, { withCredentials: true });
      setUser(null);  // Clear user state
      setSessionId(null);  // Clear sessionId from state
      localStorage.removeItem("sessionId");  // Remove sessionId from localStorage
    //  navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, sessionId, login, logout, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};
// Custom hook to use AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};


