export type NotificationType =
  "NEW_MESSAGE" | "BOOKING" | "PROPERTY_COMMUNICATION" | "ROOMMATE_MATCH" | "SYSTEM";

export type Notification = {
  id: string;
  type: NotificationType;
  recipientId: string;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
  entityId?: string;
  entityType?: string;
  route?: string;
};

export type NotificationFilter = "all" | "unread";
