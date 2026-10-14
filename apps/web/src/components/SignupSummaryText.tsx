import { SignupSummary } from "@/lib/spots";

export default function SignupSummaryText({
  summary,
}: {
  summary: SignupSummary;
}) {
  return (
    <>
      <strong>{summary.strong}</strong> {summary.rest}
    </>
  );
}
