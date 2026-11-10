import { available, money, type Listing, type PublicUser } from "../domain";
export function ListingCard({
  listing: l,
  owner,
  onOpen,
  management,
}: {
  listing: Listing;
  owner: PublicUser;
  onOpen: () => void;
  management?: boolean;
}) {
  return (
    <article className="listing-card">
      <div className="card-top">
        <span className={`pill ${l.type}`}>
          {l.type === "sell" ? "OFFERING" : "LOOKING FOR"}
        </span>
        {management && (
          <span className="pill muted">
            {l.expiresAt <= Date.now() ? "expired" : l.status}
          </span>
        )}
        <span className="availability">{available(l)} available</span>
      </div>
      <button className="card-link" onClick={onOpen}>
        <h3>
          {l.diningHall} <span aria-hidden="true">↗</span>
        </h3>
      </button>
      <p className="slot">
        {l.dateLocal}{" "}
        <span>
          · {l.startTimeLocal}–{l.endTimeLocal}
        </span>
      </p>
      <div className="method-row">
        <span>{l.mealMethod}</span>
        <span>{l.handoffMethod}</span>
      </div>
      <p className="card-note">{l.notes || "No additional notes."}</p>
      <div className="card-bottom">
        <div>
          <strong>
            {l.type === "sell"
              ? money(l.priceCents)
              : `${money(l.budgetMinCents)}–${money(l.budgetMaxCents)}`}
          </strong>
          <small> / swipe</small>
        </div>
        <span className="person">
          <span className="avatar">{owner.nickname.slice(0, 1)}</span>
          {owner.nickname}
        </span>
      </div>
    </article>
  );
}
