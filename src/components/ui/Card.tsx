interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={`
        bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-[var(--radius-card)]
        ${paddingStyles[padding]}
        ${hover ? 'transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900/80' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
