import { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface Props {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageWrapper({ title, subtitle, action, children, className }: Props) {
  return (
    <div className={cn("flex flex-col gap-4 px-4 pb-24 pt-6", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between">
          <div>
            {title && <h1 className="text-2xl font-bold text-slate-100">{title}</h1>}
            {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
