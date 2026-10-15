import EmptyState from "@/components/EmptyState";
import {CalendarX} from "lucide-react";
import {buttonStyles} from "@/components/Button";
import Link from "next/link";

export default function NotFound(){
  return (
    <>
      <h1 className="sr-only">Event not found</h1>
      <EmptyState
        icon={CalendarX}
        title="We couldn't find that event."
        action={<Link className={buttonStyles()} href={'/events'}>Browse events</Link>}
      />
    </>
  );
}