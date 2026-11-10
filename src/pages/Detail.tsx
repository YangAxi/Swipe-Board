import { useState } from "react";
import {
  available,
  money,
  publicUser,
  type Listing,
  type State,
} from "../domain";
import { contactError } from "../store";
export default function Detail({
  state,
  listing: l,
  account,
  edit,
}: {
  state: State;
  listing: Listing;
  account: () => void;
  edit: () => void;
}) {
  const [message, setMessage] = useState("");
  const owner = publicUser(state.users.find((u) => u.id === l.ownerId)!);
  return (
    <section className="narrow">
      <p className="eyebrow">
        {l.type === "sell" ? "SELL SWIPES" : "BUY SWIPES"} · POST DETAILS
      </p>
      <h1>{l.diningHall}</h1>
      <div className="panel">
        <div className="detail-price">
          {l.type === "sell"
            ? money(l.priceCents)
            : `${money(l.budgetMinCents)}–${money(l.budgetMaxCents)}`}
          <small> / swipe</small>
        </div>
        <dl>
          <dt>Date · Los Angeles</dt>
          <dd>{l.dateLocal}</dd>
          <dt>Time window</dt>
          <dd>
            {l.startTimeLocal}–{l.endTimeLocal}
          </dd>
          <dt>Dining hall</dt>
          <dd>{l.diningHall}</dd>
          <dt>Meal method</dt>
          <dd>{l.mealMethod}</dd>
          <dt>Handoff method</dt>
          <dd>{l.handoffMethod}</dd>
          <dt>Quantity</dt>
          <dd>
            {available(l)} available / {l.totalQuantity} total ·{" "}
            {l.reservedQuantity} reserved · {l.completedQuantity} completed
          </dd>
          <dt>Status</dt>
          <dd>
            {l.status}
            {l.expiresAt <= Date.now() ? " · Expired" : ""}
          </dd>
          <dt>Notes</dt>
          <dd className="preserve">{l.notes || "No additional notes."}</dd>
          <dt>Posted</dt>
          <dd>
            {new Date(l.createdAt).toLocaleString("en-US", {
              timeZone: "America/Los_Angeles",
            })}{" "}
            · Los Angeles
          </dd>
        </dl>
        <div className="owner-profile">
          <span className="avatar">{owner.nickname[0]}</span>
          <div>
            <strong>{owner.nickname}</strong>
            <p>{[owner.year, owner.major].filter(Boolean).join(" · ")}</p>
            <small>
              {owner.campus
                ? "Simulated campus account"
                : "Simulated ordinary account"}{" "}
              · No real verification
            </small>
          </div>
        </div>
        <div className="actions">
          <button
            className="primary"
            onClick={() => setMessage(contactError(state, l))}
          >
            {l.type === "sell" ? "Contact Seller" : "Contact Buyer"}
          </button>
          {!state.currentUserId && (
            <button onClick={account}>Choose demo account</button>
          )}
          {state.currentUserId === l.ownerId && (
            <button onClick={edit}>Edit post</button>
          )}
        </div>
        {message && (
          <p role="status" className="notice">
            {message}
          </p>
        )}
        <p className="fine">
          Messaging, reservations and feedback are scheduled for the next phase.
        </p>
      </div>
    </section>
  );
}
