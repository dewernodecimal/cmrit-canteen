interface CollectionCodeProps {
  code: string;
}

export default function CollectionCode({ code }: CollectionCodeProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-text-secondary font-black uppercase tracking-widest">
        Your Pickup Code
      </p>
      <div className="flex gap-3">
        {code.split('').map((digit, i) => (
          <div
            key={i}
            className="
              w-16 h-20 sm:w-20 sm:h-24 rounded-2xl
              bg-surface-800 border-2 border-brand-500/20
              flex items-center justify-center
              text-3xl sm:text-4xl font-black text-text-primary
              shadow-lg shadow-brand-500/5
              animate-pulse-glow
            "
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            {digit}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-text-secondary text-center max-w-xs font-bold uppercase tracking-widest">
        Show this code at the counter to collect your order.
      </p>
    </div>

  );
}
