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
        glass rounded-[var(--radius-card)] shadow-[var(--shadow-card)]
        ${paddingStyles[padding]}
        ${hover ? 'transition-all duration-300 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 hover:border-white/10' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
