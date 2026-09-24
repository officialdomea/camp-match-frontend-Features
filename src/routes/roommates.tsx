import { createFileRoute } from "@tanstack/react-router";
import { RoommatePage } from "@/features/roommates/components/roommate-page";

export const Route = createFileRoute("/roommates")({
  head: () => ({
    meta: [
      { title: "Roommates — Camp Match" },
      {
        name: "description",
        content: "Check your roommate eligibility and discover compatible students.",
      },
    ],
  }),
  component: RoommatePage,
});
