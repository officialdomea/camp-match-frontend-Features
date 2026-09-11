import { BadgeCheck, MessageCircle, Star, Timer } from "lucide-react";
import type { Scout } from "@/types/listing";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export function ScoutCard({ scout, onContact }: { scout: Scout; onContact?: () => void }) {
  return (
    <section
      className="rounded-2xl border border-border bg-surface p-5"
      aria-labelledby="scout-heading"
    >
      <h2 id="scout-heading" className="text-base font-semibold">
        Your House Scout
      </h2>
      <div className="mt-4 flex items-start gap-3">
        <Avatar className="size-12">
          {scout.avatarUrl ? <AvatarImage src={scout.avatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-primary-soft text-primary">
            {initials(scout.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            {scout.name}
            {scout.verified ? (
              <BadgeCheck className="size-4 text-primary" aria-label="Verified Scout" />
            ) : null}
          </p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-accent text-accent" aria-hidden="true" />
              {scout.rating.toFixed(1)} ({scout.reviewCount} reviews)
            </span>
            <span className="flex items-center gap-1">
              <Timer className="size-3.5" aria-hidden="true" />
              Replies in ~{scout.responseTimeMinutes} min
            </span>
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{scout.bio}</p>
      <Button variant="outline" className="mt-4 w-full" onClick={onContact}>
        <MessageCircle className="size-4" aria-hidden="true" />
        Message {scout.name.split(" ")[0]}
      </Button>
    </section>
  );
}
