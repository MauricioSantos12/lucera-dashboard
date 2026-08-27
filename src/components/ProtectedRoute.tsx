import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import Login from "@/pages/Login";
import ChangePassword from "@/pages/ChangePassword";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Login />;
  // Primer ingreso / cambio obligatorio: bloquea todo hasta cambiar la clave.
  // Aplica a operadores (/api/users/me/password) y a acudientes del portal
  // (/portal/password); la propia pantalla elige el endpoint según isPortal.
  if (user.mustChangePassword) {
    return <ChangePassword />;
  }
  return <>{children}</>;
}
