import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addDays,
  campus,
  canSell,
  defaultFilters,
  filterListings,
  listingError,
  localInstant,
  publicUser,
  today,
} from "../src/domain";
import { seed } from "../src/seed";
import {
  contactError,
  decode,
  load,
  persist,
  reduce,
  STORAGE_KEY,
} from "../src/store";
function fixture() {
  const s = seed();
  s.currentUserId = "alex";
  const l = {
    ...s.listings[2],
    id: "test",
    ownerId: "alex",
    type: "sell" as const,
    dateLocal: addDays(today(), 1),
    startTimeLocal: "17:00",
    endTimeLocal: "20:00",
    expiresAt: localInstant(addDays(today(), 1), "20:00"),
    priceCents: 800,
  };
  s.listings = [l];
  return { s, l };
}
test("exact domain permissions and private public projection", () => {
  for (const e of ["a@ucla.edu", "a@g.ucla.edu", "A@UCLA.EDU"])
    assert.equal(campus(e), true);
  for (const e of [
    "a@notucla.edu",
    "a@ucla.edu.evil.test",
    "a@sub.ucla.edu",
    "@ucla.edu",
    "a@x@ucla.edu",
  ])
    assert.equal(campus(e), false);
  const s = seed();
  assert.equal(canSell(s.users[2]), false);
  assert.equal("privateEmail" in publicUser(s.users[0]), false);
});
test("LA dates, DST and calendar validation", () => {
  assert.equal(today(Date.parse("2026-11-10T04:00Z")), "2026-11-09");
  assert.equal(
    new Date(localInstant("2026-07-01", "12:00")).toISOString(),
    "2026-07-01T19:00:00.000Z",
  );
  assert.equal(
    new Date(localInstant("2026-12-01", "12:00")).toISOString(),
    "2026-12-01T20:00:00.000Z",
  );
  assert.ok(Number.isNaN(localInstant("2026-03-08", "02:30")));
  assert.ok(Number.isNaN(localInstant("2026-02-30", "12:00")));
  assert.ok(Number.isFinite(localInstant("2026-11-01", "01:30")));
});
test("listing constraints, cents, quantities, end time, profile bounds", () => {
  const { s, l } = fixture();
  assert.equal(listingError(l), "");
  for (const patch of [
    { totalQuantity: 1.5 },
    { priceCents: -1 },
    { priceCents: 1.1 },
    { startTimeLocal: "22:00" },
    { notes: "a".repeat(501) },
    { totalQuantity: 1, reservedQuantity: 2 },
    { type: "buy" as const, budgetMinCents: 1001, budgetMaxCents: 500 },
  ])
    assert.notEqual(listingError({ ...l, ...patch }), "");
  assert.throws(() =>
    reduce(s, { kind: "profile", nickname: " ", major: "", year: "" }),
  );
  assert.throws(() =>
    reduce(s, {
      kind: "profile",
      nickname: "Alex",
      major: "x".repeat(101),
      year: "",
    }),
  );
});
test("combines overlap filters; hides non-open, expired and sold out; sorts", () => {
  const { l } = fixture();
  const ls = [
    l,
    { ...l, id: "price", priceCents: 900 },
    { ...l, id: "paused", status: "paused" as const },
    { ...l, id: "closed", status: "closed" as const },
    { ...l, id: "expired", expiresAt: 0 },
    { ...l, id: "full", totalQuantity: 1, reservedQuantity: 1 },
  ];
  const f = {
    ...defaultFilters(),
    date: "all",
    start: "19:00",
    end: "21:00",
    hall: l.diningHall,
    meal: l.mealMethod,
    handoff: l.handoffMethod,
    max: "8",
    sort: "price",
  };
  assert.deepEqual(
    filterListings(ls, "sell", f).map((l) => l.id),
    ["test"],
  );
  assert.equal(filterListings(ls, "sell", { ...f, start: "20:00" }).length, 0);
  const buy = {
    ...l,
    type: "buy" as const,
    budgetMinCents: 600,
    budgetMaxCents: 1000,
  };
  assert.equal(
    filterListings([buy], "buy", { ...defaultFilters(), min: "9", max: "11" })
      .length,
    1,
  );
  assert.equal(
    filterListings([buy], "buy", { ...defaultFilters(), min: "11" }).length,
    0,
  );
});
test("write permissions, ownership, reservation restrictions and lifecycle", () => {
  const { s, l } = fixture();
  assert.throws(
    () => reduce({ ...s, currentUserId: null }, { kind: "save", listing: l }),
    /Guests/,
  );
  assert.throws(
    () =>
      reduce(
        { ...s, currentUserId: "sam" },
        { kind: "save", listing: { ...l, id: "new", ownerId: "sam" } },
      ),
    /campus/,
  );
  assert.throws(
    () =>
      reduce({ ...s, currentUserId: "jordan" }, { kind: "save", listing: l }),
    /own/,
  );
  assert.throws(
    () =>
      reduce(
        { ...s, currentUserId: "jordan" },
        { kind: "status", id: l.id, status: "closed" },
      ),
    /own/,
  );
  const paused = reduce(s, { kind: "status", id: l.id, status: "paused" });
  assert.equal(
    filterListings(paused.listings, "sell", defaultFilters()).length,
    0,
  );
  const reopened = reduce(paused, { kind: "status", id: l.id, status: "open" });
  assert.equal(reopened.listings[0].status, "open");
  const reserved = { ...s, listings: [{ ...l, reservedQuantity: 1 }] };
  assert.throws(
    () =>
      reduce(reserved, { kind: "save", listing: { ...l, priceCents: 900 } }),
    /reserved/,
  );
  assert.equal(
    reduce(reserved, { kind: "status", id: l.id, status: "closed" }).listings[0]
      .reservedQuantity,
    1,
  );
  assert.equal(
    reduce(reserved, { kind: "save", listing: { ...l, notes: "Updated" } })
      .listings[0].notes,
    "Updated",
  );
});
test("persistence seeds once, round-trips, migrates v0 and never replaces damaged/future data", () => {
  let value: string | null = null;
  const port = {
    getItem: () => value,
    setItem: (_k: string, v: string) => {
      value = v;
    },
  };
  const first = load(port);
  assert.ok(first.state);
  const state = first.state!;
  state.listings[0].notes = "Kept";
  persist(port, state);
  assert.equal(load(port).state!.listings[0].notes, "Kept");
  const old = { ...state, schemaVersion: 0 };
  delete (old as { transactions?: unknown }).transactions;
  value = JSON.stringify(old);
  assert.equal(load(port).state?.schemaVersion, 1);
  assert.equal(JSON.parse(value).schemaVersion, 1);
  for (const raw of [
    "broken",
    JSON.stringify({ ...state, schemaVersion: 99 }),
    JSON.stringify({ ...state, listings: [{ id: "bad" }] }),
  ]) {
    value = raw;
    assert.equal(load(port).state, null);
    assert.equal(value, raw);
  }
  assert.throws(() => decode("null"));
  assert.ok(
    load({
      getItem: () => {
        throw Error("Denied");
      },
      setItem: () => {},
    }).error,
  );
  assert.throws(
    () =>
      persist(
        {
          getItem: () => null,
          setItem: () => {
            throw Error("Quota");
          },
        },
        state,
      ),
    /Not saved/,
  );
  assert.equal(STORAGE_KEY, "swipe-board-demo");
});
test("contact entry refuses guests, self, ordinary sellers and unavailable posts", () => {
  const { s, l } = fixture();
  assert.match(contactError({ ...s, currentUserId: null }, l), /Choose/);
  assert.match(contactError(s, l), /own/);
  assert.match(
    contactError({ ...s, currentUserId: "sam" }, { ...l, type: "buy" }),
    /campus/,
  );
  assert.match(
    contactError({ ...s, currentUserId: "jordan" }, { ...l, expiresAt: 0 }),
    /expired/,
  );
  assert.match(contactError({ ...s, currentUserId: "jordan" }, l), /phase 2/);
});
