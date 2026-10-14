// Hidden for events without a capacity limit. Gold fill, dark fill once full.
export default function CapacityBar({
  taken,
  capacity,
}: {
  taken: number;
  capacity: number | null;
}) {
  if (capacity === null || capacity <= 0) return null;

  const percentage = Math.min(100, Math.round((taken / capacity) * 100));
  const full = taken >= capacity;

  return (
    <div
      role="img"
      aria-label={`${taken} of ${capacity} spots taken`}
      className="h-1.5 w-full overflow-hidden rounded-full bg-background"
    >
      <div
        className={`h-full rounded-full ${full ? "bg-foreground" : "bg-yellow-400"}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
