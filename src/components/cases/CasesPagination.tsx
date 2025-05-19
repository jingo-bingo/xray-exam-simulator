
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CasesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const CasesPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: CasesPaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }
  
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        
        {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
          <PaginationItem key={page}>
            <PaginationLink 
              isActive={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
