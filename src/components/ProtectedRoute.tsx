import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import Login from "@/pages/Login";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Login />;
  return <>{children}</>;
}
