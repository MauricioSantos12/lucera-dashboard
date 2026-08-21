import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { BACKEND_URL } from "@/lib/config";
import { saveSession, loadSession, clearSession } from "@/lib/authStorage";
import { onPasswordChangeRequired } from "@/lib/passwordGate";

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
  name: string;
  role: UserRole;
  phone?: string;
  id: string;
  // Para médicos: id del médico vinculado · para acudientes: id del acudiente
  refId?: string;
  // true → el usuario debe cambiar la contraseña antes de usar el panel.
  mustChangePassword?: boolean;
  // true → sesión de acudiente por el portal (token scope=portal). Las vistas
  // de acudiente deben leer de /portal/* (no /api/*).
  isPortal?: boolean;
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
  // Tras cambiar la contraseña: reemplaza los tokens y baja mustChangePassword.
  applyPasswordChanged: (accessToken: string, refreshToken: string) => void;
  getValidToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Cuentas demo para que el evaluador pueda probar cada rol
export const demoAccounts: Record<UserRole, AuthUser> = {
  Admin: {
    email: "admin@lucera.pa",
    name: "Admin Técnico",
    role: "Admin",
    phone: "+507 6000-0001",
    id: "LUCERA001",
  },
  Médico: {
    email: "esanchez@lucera.pa",
    name: "Dra. Elena Sánchez",
    role: "Médico",
    phone: "+507 6000-0201",
    refId: "M-201",
    id: "LUCERA002",
  },
  Acudiente: {
    email: "maria.mendoza@gmail.com",
    name: "María Mendoza",
    role: "Acudiente",
    phone: "+507 6123-4567",
    refId: "AC-1042",
    id: "LUCERA003",
  },
  Ventas: {
    email: "ventas@lucera.pa",
    name: "Carla Núñez",
    role: "Ventas",
    phone: "+507 6000-0099",
    id: "LUCERA004",
  },
  Invitado: {
    email: "invitado@lucera.pa",
    name: "Usuario Invitado",
    role: "Invitado",
    phone: "+507 6000-0000",
    id: "LUCERA005",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = loadSession();
  const [user, setUser] = useState<AuthUser | null>(initial?.user ?? null);
  const [accessToken, setAccessToken] = useState<string | null>(
    initial?.accessToken ?? null
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    initial?.refreshToken ?? null
  );
  const [expiresAt, setExpiresAt] = useState<number | null>(
    initial?.expiresAt ?? null
  );

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

  // Tras POST /api/users/me/password: la respuesta trae tokens nuevos (sin
  // expires_in) y el flag ya en false. Se reutiliza el expiresAt actual (o 1h)
  // porque getValidToken renovará con el refresh_token nuevo cuando toque.
  const applyPasswordChanged = (
    newAccessToken: string,
    newRefreshToken: string
  ) => {
    const newExpiresAt = expiresAt ?? Date.now() + 3600_000;
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    setExpiresAt(newExpiresAt);
    setUser((u) => {
      const next = u ? { ...u, mustChangePassword: false } : u;
      if (next) {
        saveSession({
          user: next,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresAt: newExpiresAt,
        });
      }
      return next;
    });
  };

  // Red de seguridad: si un request responde 403 "Password change required"
  // (p. ej. una pestaña vieja o un token de antes), se marca el flag y
  // ProtectedRoute muestra la pantalla de cambio.
  useEffect(() => {
    return onPasswordChangeRequired(() => {
      setUser((u) => {
        if (!u || u.mustChangePassword) return u;
        const next = { ...u, mustChangePassword: true };
        if (accessToken && refreshToken && expiresAt) {
          saveSession({ user: next, accessToken, refreshToken, expiresAt });
        }
        return next;
      });
    });
  }, [accessToken, refreshToken, expiresAt]);

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
          const data: { access_token: string; expires_in: number } =
            await res.json();
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
    <AuthContext.Provider
      value={{
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
        applyPasswordChanged,
        getValidToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
