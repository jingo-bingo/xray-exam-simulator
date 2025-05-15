
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
};
