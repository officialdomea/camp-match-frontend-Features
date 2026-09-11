import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/common/states";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Camp Match" },
      {
        name: "description",
        content:
          "Chat with verified Camp Match House Scouts about the student homes you are considering.",
      },
      { property: "og:title", content: "Messages — Camp Match" },
      {
        property: "og:description",
        content: "Chat with verified Camp Match House Scouts.",
      },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <AppShell>
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Messages</h1>
        <EmptyState
          icon={<MessageSquare className="size-5" aria-hidden="true" />}
          title="Messaging is coming soon"
          description="Scout conversations arrive in a later build phase."
        />
      </div>
    </AppShell>
  );
}
