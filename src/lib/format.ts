import type { PricePeriod } from "@/types/listing";

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function formatNaira(amount: number) {
  return nairaFormatter.format(amount);
}

const periodLabels: Record<PricePeriod, string> = {
  year: "year",
  semester: "semester",
  month: "month",
};

export function formatPricePeriod(period: PricePeriod) {
  return periodLabels[period];
}

export function formatPrice(amount: number, period: PricePeriod) {
  return `${formatNaira(amount)} / ${periodLabels[period]}`;
}

export function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m from campus` : `${km} km from campus`;
}

export function greetingForNow(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
