import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../api/axios";
import type { User, AuthResponse } from "../types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app load, check if we already have a user saved in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const saveAuth = (data: AuthResponse) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/signup", {
      name,
      email,
      password,
    });
    saveAuth(res.data);
  };

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    saveAuth(res.data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};