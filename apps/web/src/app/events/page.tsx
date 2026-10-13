import type {Metadata} from 'next';
import {apiFetch} from "@/lib/api";
import type {Event} from "@/lib/types"

export const metadata: Metadata = {
    title: "Events",
}
export default async function EventsPage() {

    const events = await apiFetch<Event[]>('/events')

    return (<><h1>Events</h1><p>{events.length} events from the API</p></>)
}