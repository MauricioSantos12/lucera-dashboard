import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/hooks/useFetch";
import { toast } from "@/lib/toast";
import { LoadingState } from "@/components/LoadingState";
import { StatCard } from "@/components/StatCard";
import {
  Box,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { Search, Stethoscope } from "lucide-react";

export default function Specialties() {
  const { token } = useAuth();
  const {
    data: specialtiesData,
    loading,
    error,
  } = useFetch<string[]>(token ? "/api/specialties" : null);
  const specialties = useMemo(() => specialtiesData ?? [], [specialtiesData]);

  useEffect(() => {
    if (error) {
      toast.error("No se pudieron cargar las especialidades", {
        description: error,
      });
    }
  }, [error]);

  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => specialties.filter((s) => s.toLowerCase().includes(q.toLowerCase())),
    [specialties, q]
  );

  return (
    <DashboardLayout
      title="Especialidades"
      subtitle="Especialidades médicas soportadas por el triaje · solo lectura"
    >
      <InputGroup mb={4} maxW={{ md: "360px" }}>
        <InputLeftElement pointerEvents="none">
          <Search size={16} />
        </InputLeftElement>
        <Input
          placeholder="Buscar especialidad…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          bg="lucera.surface"
        />
      </InputGroup>

      {loading && !specialtiesData ? (
        <LoadingState label="Cargando especialidades…" />
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={3}>
            {filtered.map((s) => (
              <StatCard key={s} p={3}>
                <Flex align="center" gap={3}>
                  <Flex
                    h={9}
                    w={9}
                    flexShrink={0}
                    borderRadius="lg"
                    align="center"
                    justify="center"
                    bg="naranja.50"
                    color="naranja.500"
                  >
                    <Icon as={Stethoscope} boxSize={4} />
                  </Flex>
                  <Box minW={0}>
                    <Text fontSize="sm" fontWeight={700} noOfLines={2}>
                      {s}
                    </Text>
                  </Box>
                </Flex>
              </StatCard>
            ))}
          </SimpleGrid>
          {filtered.length === 0 && (
            <Text
              mt={6}
              fontSize="sm"
              color="lucera.textMuted"
              textAlign="center"
            >
              No hay resultados.
            </Text>
          )}
          <Text mt={4} fontSize="xs" color="lucera.textMuted">
            {filtered.length} de {specialties.length} especialidades
          </Text>
        </>
      )}
    </DashboardLayout>
  );
}
