import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, UserRole } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ReactNode } from "react";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Statistics from "./pages/Statistics";
import Guardians from "./pages/Guardians";
import Children from "./pages/Children";
// import Specialists from "./pages/Specialists"; // oculto temporalmente
import Centers from "./pages/Centers";
import Chats from "./pages/Chats";
// import Medications from "./pages/Medications"; // oculto temporalmente
import Payments from "./pages/Payments";
import UsageLLM from "./pages/UsageLLM";
import Insurances from "./pages/Insurances";
import Specialties from "./pages/Specialties";
import Profile from "./pages/Profile";
// import Schedule from "./pages/Schedule"; // oculto temporalmente
import MyChildren from "./pages/MyChildren";
// import MyAppointments from "./pages/MyAppointments"; // reemplazado por Chats (misma vista que el admin, filtrada al propio acudiente)
import MySubscription from "./pages/MySubscription";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RoleRoute({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return null;
  if (!roles.includes(user.rol)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/statistics" element={<ProtectedRoute><RoleRoute roles={["Admin","Ventas","Invitado"]}><Statistics /></RoleRoute></ProtectedRoute>} />

          <Route path="/guardians" element={<ProtectedRoute><RoleRoute roles={["Admin","Ventas","Médico","Invitado"]}><Guardians /></RoleRoute></ProtectedRoute>} />
          <Route path="/children" element={<ProtectedRoute><RoleRoute roles={["Admin","Ventas","Médico","Invitado"]}><Children /></RoleRoute></ProtectedRoute>} />
          {/* <Route path="/specialists" element={<ProtectedRoute><RoleRoute roles={["Admin","Invitado"]}><Specialists /></RoleRoute></ProtectedRoute>} /> oculto temporalmente */}
          <Route path="/payments" element={<ProtectedRoute><RoleRoute roles={["Admin","Ventas","Invitado"]}><Payments /></RoleRoute></ProtectedRoute>} />
          <Route path="/usage" element={<ProtectedRoute><RoleRoute roles={["Admin","Ventas","Invitado"]}><UsageLLM /></RoleRoute></ProtectedRoute>} />

          <Route path="/chats" element={<ProtectedRoute><RoleRoute roles={["Admin","Ventas","Médico","Acudiente","Invitado"]}><Chats /></RoleRoute></ProtectedRoute>} />
          {/* <Route path="/medications" element={<ProtectedRoute><RoleRoute roles={["Admin","Invitado"]}><Medications /></RoleRoute></ProtectedRoute>} /> oculto temporalmente */}

          {/* <Route path="/schedule" element={<ProtectedRoute><RoleRoute roles={["Médico"]}><Schedule /></RoleRoute></ProtectedRoute>} /> oculto temporalmente */}

          <Route path="/my-children" element={<ProtectedRoute><RoleRoute roles={["Acudiente"]}><MyChildren /></RoleRoute></ProtectedRoute>} />
          {/* "Mis consultas" ahora es la misma vista de Chats que usa el admin, filtrada al propio acudiente dentro del componente */}
          <Route path="/my-appointments" element={<Navigate to="/chats" replace />} />
          <Route path="/my-subscription" element={<ProtectedRoute><RoleRoute roles={["Acudiente"]}><MySubscription /></RoleRoute></ProtectedRoute>} />

          <Route path="/centers" element={<ProtectedRoute><RoleRoute roles={["Admin","Ventas","Médico","Invitado"]}><Centers /></RoleRoute></ProtectedRoute>} />
          <Route path="/insurances" element={<ProtectedRoute><RoleRoute roles={["Admin","Ventas","Médico","Invitado"]}><Insurances /></RoleRoute></ProtectedRoute>} />
          <Route path="/specialties" element={<ProtectedRoute><RoleRoute roles={["Admin","Ventas","Médico","Invitado"]}><Specialties /></RoleRoute></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Legacy redirects */}
          <Route path="/estadisticas" element={<Navigate to="/statistics" replace />} />
          <Route path="/acudientes" element={<Navigate to="/guardians" replace />} />
          <Route path="/ninos" element={<Navigate to="/children" replace />} />
          {/* <Route path="/medicos" element={<Navigate to="/specialists" replace />} /> oculto temporalmente */}
          {/* <Route path="/especialistas" element={<Navigate to="/specialists" replace />} /> oculto temporalmente */}
          <Route path="/centros" element={<Navigate to="/centers" replace />} />
          {/* <Route path="/medicamentos" element={<Navigate to="/medications" replace />} /> oculto temporalmente */}
          <Route path="/pagos" element={<Navigate to="/payments" replace />} />
          <Route path="/perfil" element={<Navigate to="/profile" replace />} />
          <Route path="/agenda" element={<Navigate to="/schedule" replace />} />
          <Route path="/mis-hijos" element={<Navigate to="/my-children" replace />} />
          <Route path="/mis-consultas" element={<Navigate to="/my-appointments" replace />} />
          <Route path="/mi-suscripcion" element={<Navigate to="/my-subscription" replace />} />
          <Route path="/usuarios" element={<Navigate to="/guardians" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
