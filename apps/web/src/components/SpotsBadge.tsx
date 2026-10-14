import { Clock, History, Users } from "lucide-react";
import Badge from "@/components/Badge";
import type { Spots } from "@/lib/spots";

// Maps an event's availability (see lib/spots.ts) to its badge text, icon and style.
export default function SpotsBadge({ spots }: { spots: Spots }) {
  switch (spots.kind) {
    case "open":
      return (
        <Badge variant="outline">
          <Users aria-hidden />
          Open to all
        </Badge>
      );
    case "plenty":
      return <Badge>{spots.left} spots left</Badge>;
    case "few":
      return (
        <Badge variant="warning">
          <Clock aria-hidden />
          {spots.left === 1 ? "Last spot" : `Only ${spots.left} left`}
        </Badge>
      );
    case "full":
      return <Badge variant="full">Full</Badge>;
    case "ended":
      return (
        <Badge variant="ended">
          <History aria-hidden />
          Ended
        </Badge>
      );
  }
}
