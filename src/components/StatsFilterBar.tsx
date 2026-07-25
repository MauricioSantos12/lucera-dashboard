import type { ReactNode } from "react";
import { Box, Button, Flex, Input, Select, Text } from "@chakra-ui/react";
import { Search } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import type { InsuranceRef, GuardianApi } from "@/lib/apiTypes";

interface StatsFilterBarProps {
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  insurance: string;
  setInsurance: (v: string) => void;
  guardianFilter: string;
  setGuardianFilter: (v: string) => void;
  countryOptions: string[];
  insuranceOptions: InsuranceRef[];
  guardianOptions: GuardianApi[];
  onSearch: () => void;
  // Contenido opcional (p. ej. un ExportButton) mostrado junto a "Buscar".
  rightSlot?: ReactNode;
}

// Barra de filtros compartida por Estadísticas y Desempeño: fecha, país,
// seguro y acudiente + botón Buscar. Garantiza filtros idénticos en ambas.
export function StatsFilterBar({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  country,
  setCountry,
  insurance,
  setInsurance,
  guardianFilter,
  setGuardianFilter,
  countryOptions,
  insuranceOptions,
  guardianOptions,
  onSearch,
  rightSlot,
}: StatsFilterBarProps) {
  return (
    <StatCard mb={2}>
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={3}
        align={{ md: "end" }}
        wrap="wrap"
      >
        <Box>
          <Text fontSize="xs" fontWeight={600} mb={1}>
            Fecha inicio
          </Text>
          <Input
            type="date"
            size="sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Box>
        <Box>
          <Text fontSize="xs" fontWeight={600} mb={1}>
            Fecha fin
          </Text>
          <Input
            type="date"
            size="sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Box>
        <Box>
          <Text fontSize="xs" fontWeight={600} mb={1}>
            País
          </Text>
          <Select
            size="sm"
            placeholder="Seleccionar opción"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="todos">Todos</option>
            {countryOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </Box>
        <Box>
          <Text fontSize="xs" fontWeight={600} mb={1}>
            Seguro médico
          </Text>
          <Select
            size="sm"
            placeholder="Seleccionar opción"
            value={insurance}
            onChange={(e) => setInsurance(e.target.value)}
          >
            <option value="todos">Todos</option>
            {insuranceOptions.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </Select>
        </Box>
        <Box>
          <Text fontSize="xs" fontWeight={600} mb={1}>
            Acudiente
          </Text>
          <Select
            size="sm"
            placeholder="Seleccionar opción"
            value={guardianFilter}
            onChange={(e) => setGuardianFilter(e.target.value)}
          >
            <option value="todos">Todos</option>
            {guardianOptions.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </Box>
      </Flex>

      <Flex gap={3} mt={4} justify="flex-end" wrap="wrap">
        <Button
          colorScheme="vino"
          size="sm"
          leftIcon={<Search size={14} />}
          onClick={onSearch}
          isDisabled={
            !startDate && !endDate && !country && !insurance && !guardianFilter
          }
        >
          Buscar
        </Button>
        {rightSlot}
      </Flex>
    </StatCard>
  );
}
