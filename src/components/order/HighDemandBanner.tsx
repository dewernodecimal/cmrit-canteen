import { AlertTriangle } from 'lucide-react';

interface HighDemandBannerProps {
  itemName: string;
}

export default function HighDemandBanner({ itemName }: HighDemandBannerProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-400/10 border border-amber-400/20 animate-fade-in">
      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-amber-400">
          High Demand Alert
        </p>
        <p className="text-xs text-amber-400/70 mt-1">
          Many students have ordered <strong>{itemName}</strong>.
          Expect a longer wait than usual.
        </p>
      </div>
    </div>
  );
}
