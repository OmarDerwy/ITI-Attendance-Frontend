
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

const PageTitle = ({
  title,
  subtitle,
  icon,
  action,
  className,
}: PageTitleProps) => {
  return (
    <div className={cn("mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="ml-auto flex-shrink-0">{action}</div>}
    </div>
  );
};

export default PageTitle;
