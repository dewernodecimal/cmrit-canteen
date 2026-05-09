interface CollectionCodeProps {
  code: string;
}

export default function CollectionCode({ code }: CollectionCodeProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-zinc-400 font-medium uppercase tracking-wider">
        Your Pickup Code
      </p>
      <div className="flex gap-3">
        {code.split('').map((digit, i) => (
          <div
            key={i}
            className="
              w-16 h-20 sm:w-20 sm:h-24 rounded-2xl
              glass border-2 border-brand-500/30
              flex items-center justify-center
              text-3xl sm:text-4xl font-bold text-white
              animate-pulse-glow
            "
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            {digit}
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-500 text-center max-w-xs">
        Show this code at the counter to collect your order.
        Your order will be prepared shortly.
      </p>
    </div>
  );
}
