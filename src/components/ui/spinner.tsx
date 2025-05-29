import { cn } from "@/lib/utils";

export function Spinner({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("inline-block animate-spin rounded-full border-4 border-solid border-primary border-t-transparent h-8 w-8", className)} {...props} />
  );
}
