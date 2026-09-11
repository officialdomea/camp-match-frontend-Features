import type { UserRole } from "@/types/auth";
import { SelectableCard } from "@/components/forms/selectable-card";

export type RoleOption = {
  role: UserRole;
  emoji: string;
  title: string;
  description: string;
};

export const roleOptions: RoleOption[] = [
  {
    role: "student",
    emoji: "🎓",
    title: "Student",
    description: "Find verified accommodation near your campus.",
  },
  {
    role: "owner",
    emoji: "🏠",
    title: "Property Owner",
    description: "List and manage properties you own.",
  },
  {
    role: "scout",
    emoji: "🔎",
    title: "House Scout",
    description: "Help students discover and manage access to verified properties.",
  },
];

export function RoleCard({
  option,
  selected,
  onSelect,
}: {
  option: RoleOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <SelectableCard
      selected={selected}
      onSelect={onSelect}
      title={option.title}
      description={option.description}
      visual={option.emoji}
      className="p-5"
    />
  );
}
