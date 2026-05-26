import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  MessageSquare,
  CreditCard,
  Building2,
  Pill,
  Baby,
  CalendarDays,
  UserCog,
  Heart,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import {
  Box,
  Flex,
  HStack,
  Image,
  Text,
  VStack,
  Icon,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import logoSymbol from "@/assets/lucera-symbol.jpg";
import { useAuth, UserRole } from "@/lib/auth";
import { createContext, useContext, ReactNode } from "react";

type Item = { title: string; url: string; icon: LucideIcon; roles: UserRole[] };

const allItems: Item[] = [
  {
    title: "Resumen",
    url: "/",
    icon: LayoutDashboard,
    roles: ["Admin", "Médico", "Acudiente", "Finanzas"],
  },
  {
    title: "Estadísticas",
    url: "/statistics",
    icon: BarChart3,
    roles: ["Admin", "Médico", "Acudiente"],
  },
  { title: "Acudientes", url: "/guardians", icon: Users, roles: ["Admin"] },
  { title: "Niños", url: "/children", icon: Baby, roles: ["Admin"] },
  {
    title: "Médicos",
    url: "/specialists",
    icon: Stethoscope,
    roles: ["Admin"],
  },
  {
    title: "Centros de atención",
    url: "/centers",
    icon: Building2,
    roles: ["Admin", "Médico"],
  },
  {
    title: "Sesiones (Chats)",
    url: "/chats",
    icon: MessageSquare,
    roles: ["Admin", "Médico"],
  },
  { title: "Medicamentos", url: "/medications", icon: Pill, roles: ["Admin"] },
  {
    title: "Pagos",
    url: "/payments",
    icon: CreditCard,
    roles: ["Admin", "Finanzas"],
  },
  {
    title: "Mi agenda",
    url: "/schedule",
    icon: CalendarDays,
    roles: ["Médico"],
  },
  {
    title: "Mis hijos",
    url: "/my-children",
    icon: Heart,
    roles: ["Acudiente"],
  },
  {
    title: "Mis consultas",
    url: "/my-appointments",
    icon: MessageSquare,
    roles: ["Acudiente"],
  },
  {
    title: "Mi suscripción",
    url: "/my-subscription",
    icon: CreditCard,
    roles: ["Acudiente"],
  },
];

// --- Sidebar context (mobile drawer) ---
type Ctx = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  isMobile: boolean;
};
const SidebarCtx = createContext<Ctx | null>(null);
export function SidebarProvider({ children }: { children: ReactNode }) {
  const isMobile = useBreakpointValue({ base: true, lg: false }) ?? false;
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <SidebarCtx.Provider value={{ isOpen, onOpen, onClose, isMobile }}>
      {children}
    </SidebarCtx.Provider>
  );
}
export function useSidebarCtx() {
  const c = useContext(SidebarCtx);
  if (!c) throw new Error("useSidebarCtx outside provider");
  return c;
}

function SidebarLink({
  item,
  active,
  onNav,
}: {
  item: Item;
  active: boolean;
  onNav?: () => void;
}) {
  return (
    <RouterNavLink
      to={item.url}
      end={item.url === "/"}
      onClick={onNav}
      style={{ textDecoration: "none" }}
    >
      <HStack
        spacing={3}
        px={3}
        py={2.5}
        mx={2}
        borderRadius="md"
        color={active ? "white" : "lucera.sidebarFg"}
        bg={active ? "vino.900" : "transparent"}
        _hover={{ bg: "naranja.500", color: "white" }}
        transition="background 120ms"
        fontWeight={active ? 700 : 500}
        fontSize="sm"
      >
        <Icon as={item.icon} boxSize={4} />
        <Text>{item.title}</Text>
      </HStack>
    </RouterNavLink>
  );
}

function SidebarBody({ onNav }: { onNav?: () => void }) {
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.rol ?? "Admin";
  const items = allItems.filter((i) => i.roles.includes(role));
  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <Flex
      direction="column"
      h="100%"
      w="100%"
      bg="lucera.sidebar"
      color="lucera.sidebarFg"
    >
      <HStack p={4} borderBottomWidth="1px" borderColor="vino.600" spacing={3}>
        <Box
          h={10}
          w={10}
          borderRadius="lg"
          bg="white"
          overflow="hidden"
          display="grid"
          placeItems="center"
        >
          <Image
            src={logoSymbol}
            alt="Lucera"
            boxSize="36px"
            objectFit="contain"
          />
        </Box>
        <Box>
          <Text
            fontFamily="heading"
            fontSize="xl"
            fontWeight={700}
            color="amarillo.300"
            lineHeight={1}
          >
            Lucera
          </Text>
          <Text
            fontSize="10px"
            letterSpacing="widest"
            textTransform="uppercase"
            opacity={0.7}
          >
            Pediatría · Panamá
          </Text>
        </Box>
      </HStack>

      <Box py={3} flex={1} overflowY="auto">
        <Text
          px={5}
          py={2}
          fontSize="10px"
          letterSpacing="widest"
          textTransform="uppercase"
          opacity={0.5}
        >
          {role === "Admin"
            ? "Operación"
            : role === "Médico"
            ? "Clínica"
            : role === "Finanzas"
            ? "Finanzas"
            : "Mi cuenta"}
        </Text>
        <VStack align="stretch" spacing={0.5}>
          {items.map((item) => (
            <SidebarLink
              key={item.url}
              item={item}
              active={isActive(item.url)}
              onNav={onNav}
            />
          ))}
        </VStack>

        <Text
          px={5}
          py={2}
          mt={4}
          fontSize="10px"
          letterSpacing="widest"
          textTransform="uppercase"
          opacity={0.5}
        >
          Cuenta
        </Text>
        <SidebarLink
          item={{
            title: "Mi perfil",
            url: "/profile",
            icon: UserCog,
            roles: ["Admin", "Médico", "Acudiente", "Finanzas"],
          }}
          active={isActive("/profile")}
          onNav={onNav}
        />
      </Box>

      <Box
        px={4}
        py={3}
        borderTopWidth="1px"
        borderColor="vino.600"
        fontSize="10px"
        opacity={0.6}
      >
        Cumple con la{" "}
        <Text as="span" fontWeight={600}>
          Ley 81
        </Text>{" "}
        de Protección de Datos · Panamá
      </Box>
    </Flex>
  );
}

export function AppSidebar() {
  const { isMobile, isOpen, onClose } = useSidebarCtx();
  if (isMobile) {
    return (
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent bg="lucera.sidebar">
          <DrawerBody p={0}>
            <SidebarBody onNav={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Box w="260px" minH="100vh" position="sticky" top={0} flexShrink={0}>
      <SidebarBody />
    </Box>
  );
}
