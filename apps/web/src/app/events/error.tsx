"use client";

import { CircleAlert } from "lucide-react";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";

// Shown when the events page throws (for example, the API is down). `retry` re-fetches
// and re-renders the page. The error itself is already logged by Next.js on the server;
// `error.digest` matches that log entry.
export default function Error({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <>
      <h1 className="sr-only">Events</h1>
      <EmptyState
        icon={CircleAlert}
        title="We couldn't load events."
        description="Something went wrong on our side. Please try again."
        action={<Button onClick={() => retry()}>Try again</Button>}
      />
    </>
  );
}
