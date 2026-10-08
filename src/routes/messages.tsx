import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BellRing, Loader2, MessageSquare, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { canAccessNotificationDestination } from "@/features/notifications/domain/notification-access";
import { messagingService } from "@/features/messages/services/messaging.service";
import { notificationService } from "@/features/notifications/services/notification.service";
import { ReportDialog } from "@/features/reporting/components/report-dialog";
import type { Conversation } from "@/types/messages";

export const Route = createFileRoute("/messages")({
  validateSearch: z.object({ conversation: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Messages — Camp Match" },
      {
        name: "description",
        content:
          "Chat with verified Camp Match House Scouts and relevant peers about accommodation and roommate discovery.",
      },
      { property: "og:title", content: "Messages — Camp Match" },
      {
        property: "og:description",
        content: "Relevant Camp Match communication and notifications.",
      },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const search = Route.useSearch();
  const userId = user?.id ?? "";
  const actor = { id: userId, role: user?.role ?? null };
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [view, setView] = useState<"messages" | "notifications">("messages");
  const [actionError, setActionError] = useState<string | null>(null);

  const conversationsQuery = useQuery({
    queryKey: ["messages", "conversations", userId, actor.role],
    enabled: Boolean(userId && actor.role),
    queryFn: () => messagingService.getConversations(),
  });

  const notificationsQuery = useQuery({
    queryKey: ["notifications", userId],
    enabled: Boolean(userId),
    queryFn: () => notificationService.getNotifications(),
  });

  const unreadCount = useQuery({
    queryKey: ["notifications", "unread", userId],
    enabled: Boolean(userId),
    queryFn: () => notificationService.getUnreadCount(),
  });

  useEffect(() => {
    const requestedConversation = search.conversation;
    if (requestedConversation) {
      const accessible = conversationsQuery.data?.some(
        (conversation) => conversation.id === requestedConversation,
      );

      if (accessible) {
        setSelectedConversationId(requestedConversation);
        return;
      }

      if (!conversationsQuery.isLoading && !accessible) {
        setSelectedConversationId(null);
      }
      return;
    }

    const firstConversation = conversationsQuery.data?.[0];
    if (!selectedConversationId && firstConversation) {
      setSelectedConversationId(firstConversation.id);
    }
  }, [
    conversationsQuery.data,
    conversationsQuery.isLoading,
    search.conversation,
    selectedConversationId,
  ]);

  const selectedConversation = useMemo<Conversation | null>(() => {
    if (!conversationsQuery.data) return null;
    if (search.conversation) {
      return conversationsQuery.data.find((item) => item.id === search.conversation) ?? null;
    }
    if (!selectedConversationId) return conversationsQuery.data[0] ?? null;
    return conversationsQuery.data.find((item) => item.id === selectedConversationId) ?? null;
  }, [conversationsQuery.data, search.conversation, selectedConversationId]);

  const messagesQuery = useQuery({
    queryKey: ["messages", "detail", selectedConversation?.id, userId],
    enabled: Boolean(selectedConversation?.id && userId && actor.role),
    queryFn: () => messagingService.getMessages(selectedConversation!.id),
  });

  const markAsRead = async (conversationId: string) => {
    if (!userId || !actor.role) return;
    await messagingService.markConversationAsRead(conversationId);
    await queryClient.invalidateQueries({ queryKey: ["messages", "conversations", userId] });
  };

  const handleSendMessage = async () => {
    if (!userId || !actor.role || !selectedConversation || !draftMessage.trim()) return;

    setActionError(null);
    try {
      await messagingService.sendMessage({
        conversationId: selectedConversation.id,
        body: draftMessage.trim(),
      });
      setDraftMessage("");
      await queryClient.invalidateQueries({ queryKey: ["messages"] });
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {
      setActionError("Your message could not be sent to this conversation.");
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (!userId) return;
    setActionError(null);
    try {
      await notificationService.markAsRead(notificationId);
      await queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      await queryClient.invalidateQueries({ queryKey: ["notifications", "unread", userId] });
    } catch {
      setActionError("This notification could not be marked as read.");
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!userId) return;
    setActionError(null);
    try {
      await notificationService.markAllAsRead();
      await queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      await queryClient.invalidateQueries({ queryKey: ["notifications", "unread", userId] });
    } catch {
      setActionError("Notifications could not be updated.");
    }
  };

  const conversations = conversationsQuery.data ?? [];
  const notifications = notificationsQuery.data ?? [];

  const directConversationBlocked = Boolean(
    search.conversation &&
    (!actor.role ||
      (!conversationsQuery.isPending &&
        !conversations.some((conversation) => conversation.id === search.conversation))),
  );

  if (search.conversation && conversationsQuery.isError) {
    return (
      <AppShell>
        <div className="px-4 py-6 sm:px-6">
          <ErrorState
            title="We couldn't verify this conversation"
            description="Please try again before opening the thread."
            onRetry={() => void conversationsQuery.refetch()}
          />
        </div>
      </AppShell>
    );
  }

  if (search.conversation && conversationsQuery.isPending) {
    return (
      <AppShell>
        <div className="px-4 py-6 sm:px-6">
          <LoadingState label="Checking conversation access" />
        </div>
      </AppShell>
    );
  }

  if (directConversationBlocked) {
    return (
      <AppShell>
        <div className="px-4 py-6 sm:px-6">
          <ErrorState
            title="This conversation is not available"
            description="You do not have permission to view or message this thread."
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Messages</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Relationship-aware communication for listings, owners, scouts and roommates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={view === "messages" ? "default" : "secondary"}
              onClick={() => setView("messages")}
            >
              Messages
            </Button>
            <Button
              variant={view === "notifications" ? "default" : "secondary"}
              onClick={() => setView("notifications")}
            >
              <BellRing className="mr-2 size-4" aria-hidden="true" />
              Notifications
              {unreadCount.data ? (
                <span className="ml-2 rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-foreground">
                  {unreadCount.data}
                </span>
              ) : null}
            </Button>
          </div>
        </div>

        {view === "messages" ? (
          <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border/80 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="size-4" aria-hidden="true" />
                  Conversations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {conversationsQuery.isPending ? (
                  <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Loading conversations
                  </div>
                ) : conversationsQuery.isError ? (
                  <ErrorState
                    title="We couldn't load conversations"
                    onRetry={() => void conversationsQuery.refetch()}
                  />
                ) : conversations.length === 0 ? (
                  <EmptyState title="No conversations yet" />
                ) : (
                  <div className="divide-y divide-border/80">
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => {
                          setSelectedConversationId(conversation.id);
                          void markAsRead(conversation.id);
                        }}
                        className={[
                          "flex w-full flex-col gap-2 p-4 text-left transition-colors hover:bg-muted/50",
                          selectedConversation?.id === conversation.id
                            ? "bg-muted/60"
                            : "bg-transparent",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground">
                            {conversation.contextLabel ?? conversation.title ?? conversation.type}
                          </span>
                          {conversation.unreadCount > 0 ? (
                            <span className="rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                              {conversation.unreadCount}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                          {conversation.type.replace("_", " ")}
                        </p>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {conversation.lastMessage ?? "Start the conversation."}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/80 pb-4">
                <CardTitle className="min-w-0 truncate">
                  {selectedConversation?.contextLabel ?? "Select a conversation"}
                </CardTitle>
                {selectedConversation ? (
                  <ReportDialog
                    targetType="conversation"
                    targetId={selectedConversation.id}
                    targetLabel="this conversation"
                    className="shrink-0"
                  />
                ) : null}
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                {selectedConversation ? (
                  <>
                    <div className="space-y-3">
                      {messagesQuery.isPending ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                          Loading conversation
                        </div>
                      ) : messagesQuery.isError ? (
                        <ErrorState
                          title="We couldn't load this conversation"
                          onRetry={() => void messagesQuery.refetch()}
                        />
                      ) : messagesQuery.data && messagesQuery.data.length > 0 ? (
                        messagesQuery.data.map((message) => (
                          <div
                            key={message.id}
                            className={[
                              "max-w-[85%] rounded-2xl border p-3 text-sm",
                              message.senderId === userId
                                ? "ml-auto border-primary/30 bg-primary-soft text-primary"
                                : "border-border bg-background",
                            ].join(" ")}
                          >
                            <p>{message.body}</p>
                            <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                              {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                          No messages yet. Start the conversation with a relevant owner, scout or
                          roommate.
                        </div>
                      )}
                    </div>

                    {actionError ? (
                      <p className="text-sm text-destructive" role="alert">
                        {actionError}
                      </p>
                    ) : null}
                    <div className="flex items-center gap-2 border-t border-border pt-4">
                      <Input
                        value={draftMessage}
                        onChange={(event) => setDraftMessage(event.target.value)}
                        placeholder="Write a message..."
                        aria-label="Message draft"
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            void handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={() => void handleSendMessage()}
                        disabled={!draftMessage.trim() || !actor.role || messagesQuery.isError}
                      >
                        <Send className="mr-2 size-4" aria-hidden="true" />
                        Send
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                    Choose a conversation to continue the thread.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>Notifications</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void markAllNotificationsAsRead()}
                disabled={!unreadCount.data}
              >
                Mark all read
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {actionError ? (
                <p className="text-sm text-destructive" role="alert">
                  {actionError}
                </p>
              ) : null}
              {notificationsQuery.isPending ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Loading notifications
                </div>
              ) : notificationsQuery.isError ? (
                <ErrorState
                  title="We couldn't load notifications"
                  onRetry={() => void notificationsQuery.refetch()}
                />
              ) : notifications.length === 0 ? (
                <EmptyState title="No notifications yet" />
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-foreground">{notification.title}</p>
                      {!notification.readAt ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void markNotificationAsRead(notification.id)}
                        >
                          Mark read
                        </Button>
                      ) : (
                        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-medium text-primary">
                          Read
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{notification.body}</p>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                      {notification.route ? (
                        canAccessNotificationDestination({
                          currentUserId: userId,
                          currentUserRole: user?.role ?? null,
                          notification,
                          accessibleConversationIds: conversations.map(
                            (conversation) => conversation.id,
                          ),
                        }) ? (
                          <a
                            href={notification.route}
                            onClick={() => {
                              if (!notification.readAt) {
                                void markNotificationAsRead(notification.id);
                              }
                            }}
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            Open
                          </a>
                        ) : null
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
