import {
  Bookmark,
  CalendarCheck,
  Compass,
  Home,
  MessageSquare,
  Building2,
  ClipboardList,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types/auth";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  mobile: boolean;
};

const studentNavigation: NavItem[] = [
  { label: "Home", to: "/", icon: Home, mobile: true },
  { label: "Discover", to: "/discover", icon: Compass, mobile: true },
  { label: "Roommates", to: "/roommates", icon: Users, mobile: true },
  { label: "Saved", to: "/saved", icon: Bookmark, mobile: true },
  { label: "Messages", to: "/messages", icon: MessageSquare, mobile: true },
  { label: "Bookings", to: "/bookings", icon: CalendarCheck, mobile: false },
  { label: "Profile", to: "/profile", icon: User, mobile: true },
];

const ownerNavigation: NavItem[] = [
  { label: "Dashboard", to: "/owner", icon: Home, mobile: true },
  { label: "My Properties", to: "/owner/properties", icon: Building2, mobile: true },
  { label: "Booking Requests", to: "/owner/bookings", icon: CalendarCheck, mobile: false },
  { label: "Messages", to: "/messages", icon: MessageSquare, mobile: true },
  { label: "Profile", to: "/profile", icon: User, mobile: true },
];

const scoutNavigation: NavItem[] = [
  { label: "Dashboard", to: "/scout", icon: Home, mobile: true },
  { label: "Managed Properties", to: "/scout/properties", icon: ClipboardList, mobile: true },
  { label: "Booking Activity", to: "/scout/bookings", icon: CalendarCheck, mobile: false },
  { label: "Activity", to: "/scout/activity", icon: CalendarCheck, mobile: false },
  { label: "Messages", to: "/messages", icon: MessageSquare, mobile: true },
  { label: "Profile", to: "/profile", icon: User, mobile: true },
];

const navigationByRole: Record<UserRole, NavItem[]> = {
  student: studentNavigation,
  owner: ownerNavigation,
  scout: scoutNavigation,
};

export function getNavItems(role: UserRole | null | undefined): NavItem[] {
  return role ? navigationByRole[role] : [];
}
