import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Admin {
  email: string;
  displayName: string;
}

interface AuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,
      login: (email, password) => {
        if (email === "admin@cove.app" && password === "admin123") {
          set({ admin: { email, displayName: "管理员" }, isAuthenticated: true });
          localStorage.setItem("admin_token", "mock-admin-token");
          return true;
        }
        return false;
      },
      logout: () => {
        localStorage.removeItem("admin_token");
        set({ admin: null, isAuthenticated: false });
      },
    }),
    { name: "cove-admin-auth", partialize: (s) => ({ admin: s.admin, isAuthenticated: s.isAuthenticated }) }
  )
);
