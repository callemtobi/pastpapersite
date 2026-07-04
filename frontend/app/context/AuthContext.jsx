"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/lib/toastConfig";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
        { withCredentials: true },
      );
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = async () => {
    // await axios.post(
    //   `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
    //   {},
    //   { withCredentials: true },
    // );
    // setUser(null);
    // router.push("/login");

    try {
      await axios.post(
        "http://localhost:8000/api/auth/logout",
        {},
        { withCredentials: true },
      );
      showSuccessToast("You have been logged out.");
    } catch (err) {
      console.error("Logout error:", err);
      showErrorToast("Logout error");
      router.push("/login");
    } finally {
      setUser(null);
      router.push("/home");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, logout, refetchUser: fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
