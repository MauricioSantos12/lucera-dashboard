import { ReactNode } from "react";
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Heading,
  Text,
  Avatar,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { Bell, LogOut, Search, Menu as MenuIcon } from "lucide-react";
import { AppSidebar, SidebarProvider, useSidebarCtx } from "./AppSidebar";
import { useAuth } from "@/lib/auth";
import { useLocation } from "react-router-dom";
import { MotionPage } from "@/components/MotionPage";

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user, logout } = useAuth();
  const { onOpen, isMobile } = useSidebarCtx();
  const initials =
    user?.nombre
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("") ?? "AD";

  return (
    <Flex
      as="header"
      h="64px"
      px={4}
      borderBottomWidth="1px"
      borderColor="lucera.border"
      bg="whiteAlpha.900"
      backdropFilter="blur(8px)"
      align="center"
      justify="space-between"
      position="sticky"
      top={0}
      zIndex={20}
    >
      <HStack spacing={3} minW={0}>
        {isMobile && (
          <IconButton
            aria-label="Abrir menú"
            size="sm"
            variant="ghost"
            icon={<MenuIcon size={18} />}
            onClick={onOpen}
          />
        )}
        <Box minW={0} display={{ base: "none", md: "block" }}>
          <Heading as="h1" size="sm" noOfLines={1}>
            {title}
          </Heading>
          {subtitle && (
            <Text fontSize="xs" color="lucera.textMuted" noOfLines={1}>
              {subtitle}
            </Text>
          )}
        </Box>
      </HStack>

      <HStack spacing={2}>
        <Menu>
          <MenuButton
            as="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: 4,
              borderRadius: 8,
            }}
          >
            <Avatar size="xs" name={initials} bg="vino.500" color="white" />
            <Box
              px={3}
              py={1.5}
              fontSize="xs"
              color="lucera.textMuted"
              cursor="pointer"
              transition="color 0.2s ease-in-out"
              _hover={{ color: "lucera.text" }}
            >
              {user?.nombre}
            </Box>
          </MenuButton>
          <MenuList>
            <Box
              px={3}
              py={1.5}
              fontSize="xs"
              color="lucera.textMuted"
              cursor="pointer"
              transition="color 0.2s ease-in-out"
              _hover={{ color: "lucera.text" }}
            >
              {user?.email}
            </Box>
            <MenuDivider />
            <MenuItem
              icon={<LogOut size={14} />}
              onClick={logout}
              cursor="pointer"
              transition="background 0.2s ease-in-out, color 0.2s ease-in-out"
              _hover={{ bg: "peligro.50", color: "peligro.500" }}
            >
              Cerrar sesión
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
}

function Inner({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <Flex minH="100vh" w="100%" bg="lucera.bg">
      <AppSidebar />
      <Flex direction="column" flex={1} minW={0}>
        <Header title={title} subtitle={subtitle} />
        <Box
          as="main"
          flex={1}
          px={{ base: 4, md: 6 }}
          py={{ base: 4, md: 6 }}
          maxW="100%"
          overflowX="hidden"
        >
          <Box display={{ base: "block", md: "none" }} mb={4}>
            <Heading size="md">{title}</Heading>
            {subtitle && (
              <Text fontSize="xs" color="lucera.textMuted">
                {subtitle}
              </Text>
            )}
          </Box>
          <MotionPage key={title}>{children}</MotionPage>
        </Box>
        <Flex
          as="footer"
          px={{ base: 4, md: 6 }}
          py={3}
          borderTopWidth="1px"
          borderColor="lucera.border"
          bg="white"
          fontSize="11px"
          color="lucera.textMuted"
          direction={{ base: "column", md: "row" }}
          gap={1}
          justify="space-between"
        >
          <Text>© 2025 Lucera · Sistema de Triaje Pediátrico</Text>
          <Text>
            Cumplimos con la{" "}
            <Text as="strong" color="lucera.text">
              Ley 81 de 2019
            </Text>{" "}
            de Protección de Datos · Panamá
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}

export function DashboardLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <SidebarProvider>
      <Inner title={title} subtitle={subtitle}>
        {children}
      </Inner>
    </SidebarProvider>
  );
}
