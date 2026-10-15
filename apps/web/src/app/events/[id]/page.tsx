import {getEvent} from "@/lib/api";
import {notFound} from "next/navigation";
import EventDetail from "@/components/EventDetail";
import {getAppTimeZone} from "@/lib/app-config";
import { type Metadata} from "next";
import Link from "next/link";
import {ArrowLeft} from "lucide-react";

export async function generateMetadata({params}: PageProps<'/events/[id]'>): Promise<Metadata> {

  const { id } = await params;
  const event = await getEvent(id);
  if (!event) {
    return { title: 'Event not found' };
  }
  return { title: event.title}
}
export default async function DetailsPage({params}: PageProps<'/events/[id]'>){
  const { id } = await params;

  const event = await getEvent(id);
  if (!event) {
    notFound();
  }
  const timeZone = getAppTimeZone();
  const now = new Date();

  return (
    <>
      <Link href={'/events'} className={'inline-flex items-center gap-2 text-sm mb-6 py-2'}><ArrowLeft size={18} aria-hidden></ArrowLeft> All events</Link>
      <EventDetail event={event} timeZone={timeZone} now={now} />
    </>
    )
}