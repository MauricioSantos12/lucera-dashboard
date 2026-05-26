import { Button, HStack, IconButton, Text } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      )
        pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <HStack spacing={1} mt={4} justify="center">
      <IconButton
        aria-label="Anterior"
        size="sm"
        variant="ghost"
        icon={<ChevronLeft size={16} />}
        isDisabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      />
      {getPages().map((p, i) =>
        p === "..." ? (
          <Text
            key={`ellipsis-${i}`}
            fontSize="sm"
            px={2}
            color="lucera.textMuted"
          >
            …
          </Text>
        ) : (
          <Button
            key={p}
            size="sm"
            variant={p === page ? "solid" : "ghost"}
            colorScheme={p === page ? "vino" : undefined}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        )
      )}
      <IconButton
        aria-label="Siguiente"
        size="sm"
        variant="ghost"
        icon={<ChevronRight size={16} />}
        isDisabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </HStack>
  );
}
