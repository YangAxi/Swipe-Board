export const ZONE = "America/Los_Angeles";
export const halls = [
  "De Neve",
  "Epicuria",
  "Bruin Plate",
  "Rendezvous",
  "The Study",
  "Other",
];
export const meals = ["Buffet Entry", "Mobile Order"];
export const handoffs = ["Meet at Entrance", "In-person Pickup"];
export interface User {
  id: string;
  nickname: string;
  privateEmail: string;
  verificationState: "simulated";
  campusEmailVerified: boolean;
  year: string;
  major: string;
}
export interface Listing {
  id: string;
  ownerId: string;
  type: "sell" | "buy";
  dateLocal: string;
  startTimeLocal: string;
  endTimeLocal: string;
  expiresAt: number;
  diningHall: string;
  mealMethod: string;
  handoffMethod: string;
  totalQuantity: number;
  reservedQuantity: number;
  completedQuantity: number;
  priceCents: number;
  budgetMinCents: number;
  budgetMaxCents: number;
  notes: string;
  status: "open" | "paused" | "closed";
  createdAt: number;
  updatedAt: number;
}
export interface Transaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  unitPriceCents: number;
  agreedTerms: string;
  termsVersion: number;
  confirmationIds: string[];
  completionConfirmationIds: string[];
  cancellationRequest: string | null;
  status:
    | "proposed"
    | "reserved"
    | "completed"
    | "cancelled"
    | "expired"
    | "disputed";
}
export interface State {
  schemaVersion: 1;
  users: User[];
  listings: Listing[];
  transactions: Transaction[];
  currentUserId: string | null;
}
export function campus(email: string) {
  const parts = email.trim().toLowerCase().split("@");
  return (
    parts.length === 2 &&
    !!parts[0] &&
    ["ucla.edu", "g.ucla.edu"].includes(parts[1])
  );
}
export function canSell(user?: User) {
  return !!user && user.campusEmailVerified && campus(user.privateEmail);
}
export function publicUser(user: User) {
  return {
    id: user.id,
    nickname: user.nickname,
    year: user.year,
    major: user.major,
    campus: canSell(user),
  };
}
export type PublicUser = ReturnType<typeof publicUser>;
export function today(now = Date.now()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function addDays(date: string, days: number) {
  const d = new Date(date + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
// Solve the LA wall clock offset, then round-trip to reject nonexistent DST times.
export function localInstant(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time))
    return NaN;
  const target = Date.parse(`${date}T${time}:00Z`);
  if (!Number.isFinite(target)) return NaN;
  let guess = target;
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const wall = (n: number) => {
    const p = Object.fromEntries(
      fmt.formatToParts(n).map((p) => [p.type, p.value]),
    );
    return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:00Z`;
  };
  for (let i = 0; i < 3; i++) guess += target - Date.parse(wall(guess));
  return wall(guess) === `${date}T${time}:00Z` ? guess : NaN;
}
export const available = (l: Listing) =>
  l.totalQuantity - l.reservedQuantity - l.completedQuantity;
export const active = (l: Listing, now = Date.now()) =>
  l.status === "open" && l.expiresAt > now && available(l) > 0;
export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n / 100,
  );
export function profileError(u: User) {
  return !u.nickname.trim() || u.nickname.length > 40 || u.major.length > 100
    ? "Nickname must be 1–40 characters; major at most 100."
    : "";
}
export function listingError(l: Listing, now = Date.now()) {
  if (!["sell", "buy"].includes(l.type)) return "Choose a listing type.";
  if (!Number.isSafeInteger(l.totalQuantity) || l.totalQuantity < 1)
    return "Quantity must be a positive integer.";
  if (
    ![l.priceCents, l.budgetMinCents, l.budgetMaxCents].every(
      (n) => Number.isSafeInteger(n) && n >= 0,
    )
  )
    return "Prices must be nonnegative USD amounts with at most two decimals.";
  if (l.type === "buy" && l.budgetMinCents > l.budgetMaxCents)
    return "Minimum budget must not exceed maximum budget.";
  const start = localInstant(l.dateLocal, l.startTimeLocal),
    end = localInstant(l.dateLocal, l.endTimeLocal);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end)
    return "Use valid times on the same day, with end after start.";
  if (end <= now) return "This time slot has already ended in Los Angeles.";
  if (!l.diningHall.trim() || l.diningHall.length > 80)
    return "Dining hall must be 1–80 characters.";
  if (!meals.includes(l.mealMethod) || !handoffs.includes(l.handoffMethod))
    return "Choose a meal and handoff method.";
  if (l.notes.length > 500) return "Notes must be at most 500 characters.";
  if (l.totalQuantity < l.reservedQuantity + l.completedQuantity)
    return "Quantity cannot be below reserved and completed swipes.";
  return "";
}
export interface Filters {
  date: string;
  start: string;
  end: string;
  hall: string;
  meal: string;
  handoff: string;
  min: string;
  max: string;
  sort: string;
}
export const defaultFilters = (): Filters => ({
  date: "near",
  start: "",
  end: "",
  hall: "",
  meal: "",
  handoff: "",
  min: "",
  max: "",
  sort: "newest",
});
export function filterListings(
  list: Listing[],
  type: Listing["type"],
  f: Filters,
  now = Date.now(),
) {
  const day = today(now),
    tomorrow = addDays(day, 1);
  return list
    .filter(
      (l) =>
        active(l, now) &&
        l.type === type &&
        (f.date === "all" ||
          (f.date === "near"
            ? [day, tomorrow].includes(l.dateLocal)
            : l.dateLocal === f.date)) &&
        (!f.start || l.endTimeLocal > f.start) &&
        (!f.end || l.startTimeLocal < f.end) &&
        (!f.hall || l.diningHall === f.hall) &&
        (!f.meal || l.mealMethod === f.meal) &&
        (!f.handoff || l.handoffMethod === f.handoff) &&
        (!f.min ||
          (type === "sell" ? l.priceCents : l.budgetMaxCents) >=
            Number(f.min) * 100) &&
        (!f.max ||
          (type === "sell" ? l.priceCents : l.budgetMinCents) <=
            Number(f.max) * 100),
    )
    .sort((a, b) =>
      f.sort === "price"
        ? a.priceCents - b.priceCents
        : f.sort === "budget"
          ? b.budgetMaxCents - a.budgetMaxCents
          : b.createdAt - a.createdAt,
    );
}
