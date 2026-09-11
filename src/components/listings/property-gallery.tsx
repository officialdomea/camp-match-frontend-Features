import { useState } from "react";
import type { ListingImage } from "@/types/listing";
import { cn } from "@/lib/utils";

export function PropertyGallery({ images, title }: { images: ListingImage[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  if (!active) return null;

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-none bg-muted sm:rounded-2xl">
        <img
          src={active.url}
          alt={`${title} — ${active.alt}`}
          width={1024}
          height={768}
          className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]"
        />
        <span className="absolute bottom-3 right-3 rounded-full bg-foreground/70 px-2.5 py-1 text-xs font-medium text-background">
          {activeIndex + 1} / {images.length}
        </span>
      </div>

      {images.length > 1 ? (
        <div
          className="no-scrollbar flex gap-2 overflow-x-auto px-4 sm:px-0"
          role="tablist"
          aria-label="Property photos"
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={image.alt}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "size-18 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                index === activeIndex
                  ? "border-primary"
                  : "border-transparent opacity-75 hover:opacity-100",
              )}
            >
              <img
                src={image.url}
                alt=""
                width={1024}
                height={768}
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
