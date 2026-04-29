interface Props {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = "🍽️", title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="text-5xl">{icon}</span>
      <p className="text-lg font-semibold text-slate-200">{title}</p>
      {description && <p className="text-sm text-slate-500 max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
