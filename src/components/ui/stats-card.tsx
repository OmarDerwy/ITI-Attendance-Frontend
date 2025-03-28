
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

const StatsCard = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
  onClick,
}: StatsCardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md",
        onClick && "cursor-pointer hover:translate-y-[-3px]",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-semibold">{value}</p>
          
          {trend && (
            <div className="mt-1 flex items-center text-xs">
              <span
                className={cn(
                  "flex items-center gap-1 font-medium",
                  trend.isPositive ? "text-green-500" : "text-red-500"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="ml-1 text-muted-foreground">from last period</span>
            </div>
          )}
          
          {description && (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-full bg-primary/10 p-2.5 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
