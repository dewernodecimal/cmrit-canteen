interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-white/10 text-zinc-300',
  success: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  warning: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  danger: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
  info: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
};

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 text-xs font-medium
        rounded-full border border-transparent
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
