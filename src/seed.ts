import {
  addDays,
  today,
  localInstant,
  type State,
  type Listing,
} from "./domain";
export function seed(): State {
  const day = today(),
    now = Date.now();
  return {
    schemaVersion: 1,
    currentUserId: null,
    transactions: [],
    users: [
      {
        id: "alex",
        nickname: "Alex",
        privateEmail: "alex@ucla.edu",
        verificationState: "simulated",
        campusEmailVerified: true,
        year: "Junior",
        major: "Design",
      },
      {
        id: "jordan",
        nickname: "Jordan",
        privateEmail: "jordan@g.ucla.edu",
        verificationState: "simulated",
        campusEmailVerified: true,
        year: "Sophomore",
        major: "Economics",
      },
      {
        id: "sam",
        nickname: "Sam",
        privateEmail: "sam@example.test",
        verificationState: "simulated",
        campusEmailVerified: false,
        year: "",
        major: "Community member",
      },
    ],
    listings: Array.from({ length: 10 }, (_, i): Listing => {
      const date = addDays(day, i === 9 ? -1 : i === 8 ? 3 : i % 2);
      return {
        id: `seed-${i}`,
        ownerId: i % 3 === 0 ? "sam" : i % 2 ? "jordan" : "alex",
        type: i % 3 === 0 ? "buy" : "sell",
        dateLocal: date,
        startTimeLocal: i % 2 ? "17:00" : "11:00",
        endTimeLocal: i % 2 ? "21:00" : "15:00",
        expiresAt: localInstant(date, i % 2 ? "21:00" : "15:00"),
        diningHall: [
          "De Neve",
          "Epicuria",
          "Bruin Plate",
          "Rendezvous",
          "The Study",
        ][i % 5],
        mealMethod: i % 2 ? "Buffet Entry" : "Mobile Order",
        handoffMethod: i % 2 ? "Meet at Entrance" : "In-person Pickup",
        totalQuantity: (i % 4) + 1,
        reservedQuantity: 0,
        completedQuantity: 0,
        priceCents: 700 + i * 50,
        budgetMinCents: 600,
        budgetMaxCents: 1000,
        notes: [
          "Flexible within the listed window. Meet by the main entrance.",
          "Please arrive during the listed time. All details are for this local demo.",
        ][i % 2],
        status: i === 7 ? "paused" : "open",
        createdAt: now - i * 3600000,
        updatedAt: now - i * 3600000,
      };
    }),
  };
}
