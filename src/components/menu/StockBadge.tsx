import Badge from '@/components/ui/Badge';

interface StockBadgeProps {
  currentStock: number;
  dailyStockCap: number;
  isAvailable: boolean;
}

export default function StockBadge({ currentStock, dailyStockCap, isAvailable }: StockBadgeProps) {
  if (!isAvailable || currentStock <= 0) {
    return <Badge variant="danger">Sold Out</Badge>;
  }

  const stockPercent = (currentStock / dailyStockCap) * 100;

  if (stockPercent <= 15) {
    return (
      <Badge variant="warning">
        Only {currentStock} left!
      </Badge>
    );
  }

  if (stockPercent <= 40) {
    return (
      <Badge variant="info">
        {currentStock} left
      </Badge>
    );
  }

  return <Badge variant="success">In Stock</Badge>;
}
