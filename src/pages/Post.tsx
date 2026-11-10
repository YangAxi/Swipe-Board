import { useState, type FormEvent } from "react";
import {
  addDays,
  canSell,
  halls,
  handoffs,
  meals,
  today,
  type Listing,
  type User,
} from "../domain";
export default function Post({
  user,
  existing,
  save,
  account,
}: {
  user?: User;
  existing?: Listing;
  save: (l: Listing) => void;
  account: () => void;
}) {
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    type: existing?.type ?? "sell",
    dateLocal: existing?.dateLocal ?? addDays(today(), 1),
    startTimeLocal: existing?.startTimeLocal ?? "17:00",
    endTimeLocal: existing?.endTimeLocal ?? "20:00",
    hall: existing
      ? halls.includes(existing.diningHall)
        ? existing.diningHall
        : "Other"
      : "De Neve",
    other:
      existing && !halls.includes(existing.diningHall)
        ? existing.diningHall
        : "",
    mealMethod: existing?.mealMethod ?? meals[0],
    handoffMethod: existing?.handoffMethod ?? handoffs[0],
    quantity: String(existing?.totalQuantity ?? 2),
    price: ((existing?.priceCents ?? 800) / 100).toFixed(2),
    min: ((existing?.budgetMinCents ?? 600) / 100).toFixed(2),
    max: ((existing?.budgetMaxCents ?? 1000) / 100).toFixed(2),
    notes: existing?.notes ?? "",
  });
  const field = (key: keyof typeof form, value: string) =>
    setForm({ ...form, [key]: value });
  function cents(value: string) {
    return /^\d+(\.\d{1,2})?$/.test(value)
      ? Math.round(Number(value) * 100)
      : NaN;
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      save({
        ...existing,
        id: existing?.id ?? crypto.randomUUID(),
        ownerId: user!.id,
        type: form.type,
        dateLocal: form.dateLocal,
        startTimeLocal: form.startTimeLocal,
        endTimeLocal: form.endTimeLocal,
        expiresAt: 0,
        diningHall: form.hall === "Other" ? form.other.trim() : form.hall,
        mealMethod: form.mealMethod,
        handoffMethod: form.handoffMethod,
        totalQuantity: Number(form.quantity),
        reservedQuantity: existing?.reservedQuantity ?? 0,
        completedQuantity: existing?.completedQuantity ?? 0,
        priceCents: form.type === "sell" ? cents(form.price) : 0,
        budgetMinCents: form.type === "buy" ? cents(form.min) : 0,
        budgetMaxCents: form.type === "buy" ? cents(form.max) : 0,
        notes: form.notes,
        status: existing?.status ?? "open",
        createdAt: existing?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    }
  }
  if (!user)
    return (
      <section className="empty">
        <h1>Make room at the table.</h1>
        <p>
          Guests can browse. Choose a demo account to publish an offer or
          request.
        </p>
        <button className="primary" onClick={account}>
          Choose demo account
        </button>
      </section>
    );
  return (
    <section className="narrow">
      <p className="eyebrow">SHARE THE DETAILS</p>
      <h1>{existing ? "Edit your post" : "Put it on the board"}</h1>
      <p>
        Clear plans start with the right details. All fields are required except
        notes.
      </p>
      <form onSubmit={submit} className="panel">
        <label>
          Post type
          <select
            value={form.type}
            onChange={(e) => field("type", e.target.value)}
          >
            <option value="sell">Sell Swipes</option>
            <option value="buy">Buy Swipes</option>
          </select>
        </label>
        {!canSell(user) && (
          <p className="notice">
            Ordinary demo accounts may publish Buy Swipes only. Sell Swipes
            requires a simulated campus account.
          </p>
        )}
        {!!existing?.reservedQuantity && (
          <p className="notice">
            Reserved swipes: {existing.reservedQuantity}. Time, location,
            methods and price cannot change until reservations are resolved.
          </p>
        )}
        <label>
          Los Angeles date
          <input
            required
            type="date"
            value={form.dateLocal}
            onChange={(e) => field("dateLocal", e.target.value)}
          />
        </label>
        <div className="field-pair">
          <label>
            Start time
            <input
              required
              type="time"
              value={form.startTimeLocal}
              onChange={(e) => field("startTimeLocal", e.target.value)}
            />
          </label>
          <label>
            End time
            <input
              required
              type="time"
              value={form.endTimeLocal}
              onChange={(e) => field("endTimeLocal", e.target.value)}
            />
          </label>
        </div>
        <label>
          Dining hall
          <select
            value={form.hall}
            onChange={(e) => field("hall", e.target.value)}
          >
            {halls.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </label>
        {form.hall === "Other" && (
          <label>
            Custom location
            <input
              required
              maxLength={80}
              value={form.other}
              onChange={(e) => field("other", e.target.value)}
            />
          </label>
        )}
        <div className="field-pair">
          <label>
            Meal method
            <select
              value={form.mealMethod}
              onChange={(e) => field("mealMethod", e.target.value)}
            >
              {meals.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label>
            Handoff method
            <select
              value={form.handoffMethod}
              onChange={(e) => field("handoffMethod", e.target.value)}
            >
              {handoffs.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="field-pair">
          <label>
            Swipe quantity
            <input
              required
              type="number"
              min="1"
              step="1"
              value={form.quantity}
              onChange={(e) => field("quantity", e.target.value)}
            />
          </label>
          {form.type === "sell" && (
            <label>
              Unit price · USD / swipe
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => field("price", e.target.value)}
              />
            </label>
          )}
        </div>
        {form.type === "buy" && (
          <div className="field-pair">
            <label>
              Minimum budget · USD / swipe
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.min}
                onChange={(e) => field("min", e.target.value)}
              />
            </label>
            <label>
              Maximum budget · USD / swipe
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.max}
                onChange={(e) => field("max", e.target.value)}
              />
            </label>
          </div>
        )}
        <label>
          Notes · optional
          <textarea
            maxLength={500}
            rows={4}
            value={form.notes}
            onChange={(e) => field("notes", e.target.value)}
            placeholder="Anything helpful to know about meeting up?"
          />
        </label>
        <p className="fine">
          {form.notes.length}/500 characters · Same-day time windows only.
        </p>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <p className="notice">
          Local demo only. No real verification, payment or transaction takes
          place.
        </p>
        <button className="primary" type="submit">
          {existing ? "Save changes" : "Publish demo post"}
        </button>
      </form>
    </section>
  );
}
