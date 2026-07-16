import { createContext, useContext, useRef, useState, ReactNode } from "react";
import { BACKEND_URL } from "@/lib/config";
import { saveSession, loadSession, clearSession } from "@/lib/authStorage";

export type UserRole = "Admin" | "Médico" | "Acudiente" | "Ventas" | "Invitado";

// El backend (operadores del tablero) envía el rol en inglés:
// "Admin" | "Sales" | "Doctor". El frontend usa etiquetas en español —
// este mapa homologa ambos lados. Rol desconocido → "Invitado" (más acotado).
export function roleFromApi(role: string): UserRole {
  switch (role) {
    case "Admin":
      return "Admin";
    case "Sales":
      return "Ventas";
    case "Doctor":
      return "Médico";
    case "Guardian":
    case "Acudiente":
      return "Acudiente";
    default:
      return "Invitado";
  }
}

export type AuthUser = {
  email: string;
  nombre: string;
  rol: UserRole;
  telefono?: string;
  // Para médicos: id del médico vinculado · para acudientes: id del acudiente
  refId?: string;
};

// Refresca el access_token con un poco de margen antes de que expire de verdad.
const EXPIRY_BUFFER_MS = 30_000;

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  login: (
    user: AuthUser,
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ) => void;
  logout: () => void;
  updateProfile: (patch: Partial<AuthUser>) => void;
  getValidToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Cuentas demo para que el evaluador pueda probar cada rol
export const demoAccounts: Record<UserRole, AuthUser> = {
  Admin: { email: "admin@lucera.pa", nombre: "Admin Técnico", rol: "Admin", telefono: "+507 6000-0001" },
  Médico: { email: "esanchez@lucera.pa", nombre: "Dra. Elena Sánchez", rol: "Médico", telefono: "+507 6000-0201", refId: "M-201" },
  Acudiente: { email: "maria.mendoza@gmail.com", nombre: "María Mendoza", rol: "Acudiente", telefono: "+507 6123-4567", refId: "AC-1042" },
  Ventas: { email: "ventas@lucera.pa", nombre: "Carla Núñez", rol: "Ventas", telefono: "+507 6000-0099" },
  Invitado: { email: "invitado@lucera.pa", nombre: "Usuario Invitado", rol: "Invitado", telefono: "+507 6000-0000" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = loadSession();
  const [user, setUser] = useState<AuthUser | null>(initial?.user ?? null);
  const [accessToken, setAccessToken] = useState<string | null>(initial?.accessToken ?? null);
  const [refreshToken, setRefreshToken] = useState<string | null>(initial?.refreshToken ?? null);
  const [expiresAt, setExpiresAt] = useState<number | null>(initial?.expiresAt ?? null);

  // Evita disparar varios /auth/refresh en paralelo si varias requests
  // detectan el token vencido casi al mismo tiempo.
  const refreshingRef = useRef<Promise<string | null> | null>(null);

  const login = (
    u: AuthUser,
    newAccessToken: string,
    newRefreshToken: string,
    expiresIn: number
  ) => {
    const newExpiresAt = Date.now() + expiresIn * 1000;
    setUser(u);
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    setExpiresAt(newExpiresAt);
    saveSession({
      user: u,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: newExpiresAt,
    });
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setExpiresAt(null);
    clearSession();
  };

  const getValidToken = async (): Promise<string | null> => {
    if (!accessToken || !refreshToken || !expiresAt) return null;
    if (Date.now() < expiresAt - EXPIRY_BUFFER_MS) return accessToken;

    if (!refreshingRef.current) {
      refreshingRef.current = (async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
          if (!res.ok) throw new Error("No se pudo renovar la sesión");
          const data: { access_token: string; expires_in: number } = await res.json();
          const newExpiresAt = Date.now() + data.expires_in * 1000;
          setAccessToken(data.access_token);
          setExpiresAt(newExpiresAt);
          if (user) {
            saveSession({
              user,
              accessToken: data.access_token,
              refreshToken,
              expiresAt: newExpiresAt,
            });
          }
          return data.access_token;
        } catch {
          logout();
          return null;
        } finally {
          refreshingRef.current = null;
        }
      })();
    }
    return refreshingRef.current;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token: accessToken,
      login,
      logout,
      updateProfile: (patch) => {
        setUser((u) => {
          if (!u) return u;
          const next = { ...u, ...patch };
          if (accessToken && refreshToken && expiresAt) {
            saveSession({ user: next, accessToken, refreshToken, expiresAt });
          }
          return next;
        });
      },
      getValidToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
