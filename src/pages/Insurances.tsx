import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/hooks/useFetch";
import { toast } from "@/lib/toast";
import { LoadingState } from "@/components/LoadingState";
import { StatCard } from "@/components/StatCard";
import type { InsuranceRef, PaginatedResponse } from "@/lib/apiTypes";
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
import { Search, ShieldCheck } from "lucide-react";

export default function Insurances() {
  const { token } = useAuth();
  const {
    data: insurancesData,
    loading,
    error,
  } = useFetch<PaginatedResponse<InsuranceRef>>(
    token ? "/api/insurances?page=1&page_limit=100" : null
  );
  const insurances = useMemo(
    () => insurancesData?.items ?? [],
    [insurancesData]
  );

  useEffect(() => {
    if (error) {
      toast.error("No se pudieron cargar los seguros médicos", {
        description: error,
      });
    }
  }, [error]);

  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      insurances.filter((i) =>
        `${i.id} ${i.name}`.toLowerCase().includes(q.toLowerCase())
      ),
    [insurances, q]
  );

  return (
    <DashboardLayout
      title="Seguros médicos"
      subtitle="Directorio de aseguradoras soportadas · solo lectura"
    >
      <InputGroup mb={4} maxW={{ md: "360px" }}>
        <InputLeftElement pointerEvents="none">
          <Search size={16} />
        </InputLeftElement>
        <Input
          placeholder="Buscar seguro médico…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          bg="lucera.surface"
        />
      </InputGroup>

      {loading && !insurancesData ? (
        <LoadingState label="Cargando seguros médicos…" />
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={3}>
            {filtered.map((i) => (
              <StatCard key={i.id} p={3}>
                <Flex align="center" gap={3}>
                  <Flex
                    h={9}
                    w={9}
                    flexShrink={0}
                    borderRadius="lg"
                    align="center"
                    justify="center"
                    bg="vino.50"
                    color="vino.500"
                  >
                    <Icon as={ShieldCheck} boxSize={4} />
                  </Flex>
                  <Box minW={0}>
                    <Text fontSize="sm" fontWeight={700} noOfLines={2}>
                      {i.name}
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
            {filtered.length} de {insurances.length} seguros médicos
          </Text>
        </>
      )}
    </DashboardLayout>
  );
}
