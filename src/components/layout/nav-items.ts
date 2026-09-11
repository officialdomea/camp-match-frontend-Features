import {
  Bookmark,
  CalendarCheck,
  Compass,
  Home,
  MessageSquare,
  User,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  mobile: boolean;
};

export const navItems: NavItem[] = [
  { label: "Home", to: "/", icon: Home, mobile: true },
  { label: "Discover", to: "/discover", icon: Compass, mobile: true },
  { label: "Saved", to: "/saved", icon: Bookmark, mobile: true },
  { label: "Messages", to: "/messages", icon: MessageSquare, mobile: true },
  { label: "Bookings", to: "/bookings", icon: CalendarCheck, mobile: false },
  { label: "Profile", to: "/profile", icon: User, mobile: true },
];
