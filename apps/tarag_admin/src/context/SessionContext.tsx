import { createContext, useContext, useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";

// 🧑‍💻 User type (unchanged)
export type User = {
  id: string;
  fname: string;
  lname?: string;
  username: string;
  email: string;
  bdate: Date;
  gender: string;
  contactNumber?: string;
  profileImage: string;
  status: string;
  type: string;
  createdOn: Date;
};

// 🧠 SessionData
export type SessionData = {
  user?: User;
  accessToken?: string;
  refreshToken?: string;
};

// 💡 Context shape
type SessionContextType = {
  session: SessionData | null;
  updateSession: (newData: Partial<SessionData>) => Promise<void>;
  clearSession: () => Promise<void>;
  loading: boolean;
};

// 🔗 Context init
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// 🔐 Provider
export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const stored = localStorage.getItem("session");
        if (stored) {
          const parsed: SessionData = JSON.parse(stored);

          if (parsed.user) {
            parsed.user.bdate = new Date(parsed.user.bdate);
            parsed.user.createdOn = new Date(parsed.user.createdOn);
          }

          setSession(parsed);
        } else {
          setSession(null);
        }
      } catch (err) {
        console.error("Failed to load session:", err);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const updateSession = async (newData: Partial<SessionData>) => {
    try {
      const updated = { ...session, ...newData };
      setSession(updated);
      localStorage.setItem("session", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to update session:", err);
    }
  };

  const clearSession = async () => {
    try {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      setSession(null);
      localStorage.removeItem("session");
      console.log("🧹 Session cleared");
    } catch (err) {
      console.error("Failed to clear session:", err);
    }
  };

  // Auto-logout banned users
  useEffect(() => {
    if (session?.user?.status === "banned" && !loading) {
      console.log("🚫 User is banned, logging out...");
      clearSession();
    }
  }, [session?.user?.status, loading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, updateSession, clearSession, loading }}>
      {children}
    </SessionContext.Provider>
  );
};

// 🎯 Hook
export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within a SessionProvider");
  return context;
};
