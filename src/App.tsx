import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Flex, Spinner } from "@chakra-ui/react";
import { AuthProvider, useAuth, UserRole } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ReactNode, lazy, Suspense } from "react";

// Páginas públicas (prerenderizadas): eager, para no mostrar un spinner encima
// del HTML ya renderizado y mantener el LCP inmediato.
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Faq from "./pages/Faq";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import NotFound from "./pages/NotFound";

// Páginas del panel (privadas): lazy — se cargan bajo demanda. Así el bundle
// inicial del visitante público no incluye recharts ni el código del dashboard.
const Home = lazy(() => import("./pages/Home"));
const Terms = lazy(() => import("./pages/Terms"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Statistics = lazy(() => import("./pages/Statistics"));
const Performance = lazy(() => import("./pages/Performance"));
const BotStatus = lazy(() => import("./pages/BotStatus"));
const Guardians = lazy(() => import("./pages/Guardians"));
const Children = lazy(() => import("./pages/Children"));
// const Specialists = lazy(() => import("./pages/Specialists")); // oculto temporalmente
const Centers = lazy(() => import("./pages/Centers"));
const Chats = lazy(() => import("./pages/Chats"));
// const Medications = lazy(() => import("./pages/Medications")); // oculto temporalmente
const Payments = lazy(() => import("./pages/Payments"));
const UsageLLM = lazy(() => import("./pages/UsageLLM"));
const Insurances = lazy(() => import("./pages/Insurances"));
const Specialties = lazy(() => import("./pages/Specialties"));
const Profile = lazy(() => import("./pages/Profile"));
// const Schedule = lazy(() => import("./pages/Schedule")); // oculto temporalmente
const MyChildren = lazy(() => import("./pages/MyChildren"));
// MyAppointments reemplazado por Chats (misma vista que el admin, filtrada al acudiente)
const MySubscription = lazy(() => import("./pages/MySubscription"));
const Uses = lazy(() => import("./pages/Uses"));
const Accounts = lazy(() => import("./pages/Accounts"));

const queryClient = new QueryClient();

// Spinner mientras carga un chunk de página (solo aplica a las rutas lazy).
function RouteFallback() {
  return (
    <Flex minH="100vh" align="center" justify="center" bg="lucera.bg">
      <Spinner thickness="3px" color="brand.500" size="lg" />
    </Flex>
  );
}

function RoleRoute({
  roles,
  children,
}: {
  roles: UserRole[];
  children: ReactNode;
}) {
  const { user } = useAuth();
  if (!user) return null;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lp-past" element={<LandingPage />} />
          <Route path="/terminos" element={<Terms />} />
          <Route path="/register" element={<Register />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogArticle />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/uses"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["Admin", "Ventas", "Invitado"]}>
                  <Uses />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/statistics"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["Admin", "Ventas", "Invitado"]}>
                  <Statistics />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/performance"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["Admin", "Ventas", "Invitado"]}>
                  <Performance />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bot-status"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["Admin"]}>
                  <BotStatus />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["Admin", "Ventas", "Invitado"]}>
                  <Accounts />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/guardians"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["Admin", "Ventas", "Médico", "Invitado"]}>
                  <Guardians />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/children"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["Admin", "Ventas", "Médico", "Invitado"]}>
                  <Children />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          {/* <Route path="/specialists" element={<ProtectedRoute><RoleRoute roles={["Admin","Invitado"]}><Specialists /></RoleRoute></ProtectedRoute>} /> oculto temporalmente */}
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["Admin", "Ventas", "Invitado"]}>
                  <Payments />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/usage"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["Admin", "Ventas", "Invitado"]}>
                  <UsageLLM />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/chats"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["Admin", "Médico", "Acudiente", "Invitado"]}>
                  <Chats />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          {/* <Route path="/medications" element={<ProtectedRoute><RoleRoute roles={["Admin","Invitado"]}><Medications /></RoleRoute></ProtectedRoute>} /> oculto temporalmente */}

          {/* <Route path="/schedule" element={<ProtectedRoute><RoleRoute roles={["Médico"]}><Schedule /></RoleRoute></ProtectedRoute>} /> oculto temporalmente */}

          <Route
            path="/my-children"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["Acudiente"]}>
                  <MyChildren />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          {/* "Mis consultas" ahora es la misma vista de Chats que usa el admin, filtrada al propio acudiente dentro del componente */}
          <Route
            path="/my-appointments"
            element={<Navigate to="/chats" replace />}
          />
          <Route
            path="/my-subscription"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["Acudiente"]}>
                  <MySubscription />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/centers"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["Admin", "Ventas", "Médico", "Invitado"]}>
                  <Centers />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/insurances"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["Admin", "Ventas", "Médico", "Invitado"]}>
                  <Insurances />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specialties"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["Admin", "Ventas", "Médico", "Invitado"]}>
                  <Specialties />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Legacy redirects */}
          <Route
            path="/estadisticas"
            element={<Navigate to="/statistics" replace />}
          />
          <Route
            path="/acudientes"
            element={<Navigate to="/guardians" replace />}
          />
          <Route path="/ninos" element={<Navigate to="/children" replace />} />
          {/* <Route path="/medicos" element={<Navigate to="/specialists" replace />} /> oculto temporalmente */}
          {/* <Route path="/especialistas" element={<Navigate to="/specialists" replace />} /> oculto temporalmente */}
          <Route path="/centros" element={<Navigate to="/centers" replace />} />
          {/* <Route path="/medicamentos" element={<Navigate to="/medications" replace />} /> oculto temporalmente */}
          <Route path="/pagos" element={<Navigate to="/payments" replace />} />
          <Route path="/perfil" element={<Navigate to="/profile" replace />} />
          <Route path="/agenda" element={<Navigate to="/schedule" replace />} />
          <Route
            path="/mis-hijos"
            element={<Navigate to="/my-children" replace />}
          />
          <Route
            path="/mis-consultas"
            element={<Navigate to="/my-appointments" replace />}
          />
          <Route
            path="/mi-suscripcion"
            element={<Navigate to="/my-subscription" replace />}
          />
          <Route
            path="/usuarios"
            element={<Navigate to="/guardians" replace />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
