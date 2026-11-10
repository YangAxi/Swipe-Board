import {
  active,
  available,
  canSell,
  listingError,
  localInstant,
  profileError,
  type Listing,
  type State,
} from "./domain";
import { seed } from "./seed";
export const STORAGE_KEY = "swipe-board-demo";
type StoragePort = Pick<Storage, "getItem" | "setItem">;
export function validateState(value: unknown): asserts value is State {
  const s = value as State;
  if (
    !s ||
    s.schemaVersion !== 1 ||
    !Array.isArray(s.users) ||
    !Array.isArray(s.listings) ||
    !Array.isArray(s.transactions) ||
    !(s.currentUserId === null || s.users.some((u) => u.id === s.currentUserId))
  )
    throw Error(
      "Unsupported or damaged demo data. Your saved data was not overwritten.",
    );
  const unique = (ids: string[]) =>
    ids.every((id) => typeof id === "string" && !!id) &&
    new Set(ids).size === ids.length;
  if (!unique(s.users.map((u) => u.id)) || !unique(s.listings.map((l) => l.id)))
    throw Error(
      "Duplicate or missing data IDs. Saved data was not overwritten.",
    );
  for (const u of s.users)
    if (
      typeof u.nickname !== "string" ||
      typeof u.major !== "string" ||
      typeof u.year !== "string" ||
      typeof u.privateEmail !== "string" ||
      typeof u.campusEmailVerified !== "boolean" ||
      u.verificationState !== "simulated" ||
      profileError(u)
    )
      throw Error("Damaged demo account data.");
  for (const l of s.listings) {
    if (
      !s.users.some((u) => u.id === l.ownerId) ||
      !["open", "paused", "closed"].includes(l.status) ||
      typeof l.notes !== "string" ||
      typeof l.diningHall !== "string" ||
      ![l.reservedQuantity, l.completedQuantity].every(
        (n) => Number.isSafeInteger(n) && n >= 0,
      ) ||
      !Number.isFinite(l.createdAt) ||
      !Number.isFinite(l.updatedAt) ||
      l.expiresAt !== localInstant(l.dateLocal, l.endTimeLocal) ||
      listingError(l, -Infinity)
    )
      throw Error("Damaged demo listing data. Saved data was not overwritten.");
  }
  // Phase 1 has no transaction writer. Reject unrecognized transaction payloads safely.
  for (const t of s.transactions)
    if (
      !t ||
      typeof t.id !== "string" ||
      !s.listings.some((l) => l.id === t.listingId) ||
      !s.users.some((u) => u.id === t.buyerId) ||
      !s.users.some((u) => u.id === t.sellerId) ||
      !Number.isSafeInteger(t.quantity) ||
      t.quantity < 1 ||
      !Number.isSafeInteger(t.unitPriceCents) ||
      t.unitPriceCents < 0 ||
      ![
        "proposed",
        "reserved",
        "completed",
        "cancelled",
        "expired",
        "disputed",
      ].includes(t.status)
    )
      throw Error("Damaged transaction data.");
}
export function decode(raw: string): State {
  const parsed = JSON.parse(raw);
  // Supported legacy v0 uses the same fields, before transactions were introduced.
  if (parsed?.schemaVersion === 0) {
    const migrated = {
      ...parsed,
      schemaVersion: 1,
      transactions: parsed.transactions ?? [],
    };
    validateState(migrated);
    return migrated;
  }
  validateState(parsed);
  return parsed;
}
export function load(storage: StoragePort): {
  state: State | null;
  error: string;
} {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const state = decode(raw);
      if (JSON.parse(raw).schemaVersion === 0)
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
      return { state, error: "" };
    }
    const state = seed();
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { state, error: "" };
  } catch (e) {
    return {
      state: null,
      error: `Unable to load local demo: ${e instanceof Error ? e.message : "Storage is unavailable."} Use Reset Demo Data only if you want to replace it.`,
    };
  }
}
export function persist(storage: StoragePort, state: State) {
  validateState(state);
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    throw Error(
      "Not saved: browser storage is unavailable or full. Your inputs are still here.",
    );
  }
  return state;
}
export type Action =
  | { kind: "session"; userId: string | null }
  | { kind: "save"; listing: Listing }
  | { kind: "status"; id: string; status: Listing["status"] }
  | { kind: "profile"; nickname: string; major: string; year: string };
export function reduce(state: State, action: Action): State {
  if (action.kind === "session") {
    if (
      action.userId !== null &&
      !state.users.some((u) => u.id === action.userId)
    )
      throw Error("Unknown demo account.");
    return { ...state, currentUserId: action.userId };
  }
  const user = state.users.find((u) => u.id === state.currentUserId);
  if (!user)
    throw Error("Choose a demo account first. Guests cannot make changes.");
  if (action.kind === "profile") {
    const updated = {
      ...user,
      nickname: action.nickname.trim(),
      major: action.major,
      year: action.year,
    };
    const error = profileError(updated);
    if (error) throw Error(error);
    return {
      ...state,
      users: state.users.map((u) => (u.id === user.id ? updated : u)),
    };
  }
  if (action.kind === "status") {
    const old = state.listings.find((l) => l.id === action.id);
    if (!old || old.ownerId !== user.id)
      throw Error("You can only manage your own posts.");
    if (
      action.status === "open" &&
      (old.expiresAt <= Date.now() || available(old) <= 0)
    )
      throw Error(
        "This post has expired or has no available swipes. Edit its time or quantity before reopening.",
      );
    if (action.status === "open" && old.type === "sell" && !canSell(user))
      throw Error("Only simulated campus accounts may sell.");
    return {
      ...state,
      listings: state.listings.map((l) =>
        l.id === old.id
          ? { ...l, status: action.status, updatedAt: Date.now() }
          : l,
      ),
    };
  }
  const input = action.listing,
    old = state.listings.find((l) => l.id === input.id);
  if (input.ownerId !== user.id || (old && old.ownerId !== user.id))
    throw Error("You can only edit your own posts.");
  if (input.type === "sell" && !canSell(user))
    throw Error(
      "Only simulated campus accounts may publish Sell Swipes. Ordinary accounts can publish Buy Swipes.",
    );
  const l = {
    ...input,
    reservedQuantity: old?.reservedQuantity ?? 0,
    completedQuantity: old?.completedQuantity ?? 0,
    status: old?.status ?? "open",
    createdAt: old?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
    expiresAt: localInstant(input.dateLocal, input.endTimeLocal),
  };
  const error = listingError(l);
  if (error) throw Error(error);
  if (
    old?.reservedQuantity &&
    (
      [
        "type",
        "dateLocal",
        "startTimeLocal",
        "endTimeLocal",
        "diningHall",
        "mealMethod",
        "handoffMethod",
        "priceCents",
        "budgetMinCents",
        "budgetMaxCents",
      ] as const
    ).some((k) => old[k] !== l[k])
  )
    throw Error(
      "Resolve reserved transactions before changing time, location, methods or price.",
    );
  return {
    ...state,
    listings: old
      ? state.listings.map((x) => (x.id === old.id ? l : x))
      : [l, ...state.listings],
  };
}
export function contactError(state: State, listing: Listing) {
  const user = state.users.find((u) => u.id === state.currentUserId);
  if (!user) return "Choose a demo account to contact this person.";
  if (user.id === listing.ownerId) return "You cannot contact your own post.";
  if (!active(listing))
    return "This post is paused, closed, expired or has no availability. New contact is unavailable.";
  if (listing.type === "buy" && !canSell(user))
    return "Only simulated campus accounts can respond as a seller.";
  return "Messaging and transaction confirmation are planned for phase 2. No message was sent and no swipes were reserved.";
}
