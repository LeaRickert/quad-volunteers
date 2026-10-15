import DetailSkeleton from "@/components/skeleton/DetailSkeleton";

export default function Loading() {
  return (
    <div role="status">
      <span className="sr-only">Loading event…</span>
      <DetailSkeleton />
    </div>
  );
}
