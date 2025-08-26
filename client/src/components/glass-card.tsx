import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = false, onClick }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-xl",
        hover && "hover-glow cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      data-testid="glass-card"
    >
      {children}
    </div>
  );
}
