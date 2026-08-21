import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import Login from "@/pages/Login";
import ChangePassword from "@/pages/ChangePassword";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Login />;
  // Primer ingreso / cambio obligatorio: bloquea todo el panel hasta cambiarla.
  // Solo aplica a usuarios del panel (operadores); la clave del acudiente la
  // fija el admin (POST /api/guardians/{gid}/portal-password), no por este flujo.
  if (user.role !== "Acudiente" && user.mustChangePassword) {
    return <ChangePassword />;
  }
  return <>{children}</>;
}
