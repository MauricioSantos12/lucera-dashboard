import { useState, useRef } from "react";
import {
  Box,
  Flex,
  Input,
  Tag,
  TagCloseButton,
  TagLabel,
  Wrap,
  WrapItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Text,
  useDisclosure,
  useOutsideClick,
} from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";

type Option = { value: string; label: string };

type MultiSelectProps = {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
};

export function MultiSelect({ options, value, onChange, placeholder = "Seleccionar…" }: MultiSelectProps) {
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick({ ref, handler: onClose });

  const filtered = options.filter(
    (o) => !value.includes(o.value) && o.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (val: string) => {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
    setSearch("");
  };

  return (
    <Box ref={ref} position="relative">
      <Popover isOpen={isOpen} onClose={onClose} matchWidth autoFocus={false}>
        <PopoverTrigger>
          <Flex
            borderWidth="1px"
            borderColor="lucera.border"
            borderRadius="md"
            px={3}
            py={2}
            minH="40px"
            align="center"
            cursor="pointer"
            onClick={onOpen}
            _hover={{ borderColor: "naranja.300" }}
            transition="border-color 0.2s"
            gap={2}
            flexWrap="wrap"
          >
            {value.length > 0 ? (
              <Wrap spacing={1} flex={1}>
                {value.map((v) => {
                  const opt = options.find((o) => o.value === v);
                  return (
                    <WrapItem key={v}>
                      <Tag size="sm" colorScheme="vino" borderRadius="md">
                        <TagLabel>{opt?.label ?? v}</TagLabel>
                        <TagCloseButton onClick={(e) => { e.stopPropagation(); toggle(v); }} />
                      </Tag>
                    </WrapItem>
                  );
                })}
              </Wrap>
            ) : (
              <Text flex={1} fontSize="sm" color="lucera.textMuted">{placeholder}</Text>
            )}
            <ChevronDown size={14} color="#6b4a55" />
          </Flex>
        </PopoverTrigger>
        <PopoverContent w="100%" maxH="200px" overflowY="auto" boxShadow="md">
          <PopoverBody p={2}>
            <Input
              size="sm"
              placeholder="Buscar…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              mb={2}
              autoFocus
            />
            {filtered.length === 0 ? (
              <Text fontSize="xs" color="lucera.textMuted" textAlign="center" py={2}>Sin resultados</Text>
            ) : (
              filtered.map((o) => (
                <Box
                  key={o.value}
                  px={3}
                  py={1.5}
                  fontSize="sm"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: "crema.100" }}
                  onClick={() => toggle(o.value)}
                >
                  {o.label}
                </Box>
              ))
            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
}
