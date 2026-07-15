import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "Admin" | "Médico" | "Acudiente" | "Ventas" | "Invitado";

export type AuthUser = {
  email: string;
  nombre: string;
  rol: UserRole;
  telefono?: string;
  // Para médicos: id del médico vinculado · para acudientes: id del acudiente
  refId?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateProfile: (patch: Partial<AuthUser>) => void;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  return (
    <AuthContext.Provider value={{
      user,
      token,
      login: (u, t) => {
        setUser(u);
        setToken(t);
      },
      logout: () => {
        setUser(null);
        setToken(null);
      },
      updateProfile: (patch) => setUser(u => u ? { ...u, ...patch } : u),
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
