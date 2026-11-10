import { useState } from "react";
import {
  addDays,
  publicUser,
  defaultFilters,
  filterListings,
  halls,
  meals,
  handoffs,
  today,
  type State,
  type Listing,
} from "../domain";
import { ListingCard } from "../components/ListingCard";
export default function Browse({
  state,
  open,
  post,
}: {
  state: State;
  open: (id: string) => void;
  post: () => void;
}) {
  const [type, setType] = useState<Listing["type"]>("sell"),
    [f, setF] = useState(defaultFilters),
    [custom, setCustom] = useState(false);
  const change = (key: keyof typeof f, value: string) =>
    setF({ ...f, [key]: value });
  const invalid =
    (f.start && f.end && f.start >= f.end) ||
    (f.min && f.max && Number(f.min) > Number(f.max));
  const list = invalid ? [] : filterListings(state.listings, type, f);
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">THE CAMPUS MEAL BOARD</p>
          <h1>
            A little less searching.
            <br />
            <span>A little more dining.</span>
          </h1>
          <p>Find a swipe that fits your day, or put yours on the board.</p>
        </div>
        <div className="hero-aside">
          <span className="sun">✳</span>
          <p>
            Good meals.
            <br />
            Clear details.
            <br />
            <strong>One shared board.</strong>
          </p>
        </div>
      </section>
      <div className="board-heading">
        <div className="tabs" aria-label="Listing type">
          <button
            aria-pressed={type === "sell"}
            onClick={() => {
              setType("sell");
              change("sort", "newest");
            }}
          >
            Sell Swipes
          </button>
          <button
            aria-pressed={type === "buy"}
            onClick={() => {
              setType("buy");
              change("sort", "newest");
            }}
          >
            Buy Swipes
          </button>
        </div>
        <span className="timezone">All times · Los Angeles</span>
      </div>
      <div className="browse-layout">
        <aside className="filters">
          <div className="section-top">
            <h2>Find your fit</h2>
            <button
              className="text-button"
              onClick={() => {
                setF(defaultFilters());
                setCustom(false);
              }}
            >
              Clear filters
            </button>
          </div>
          <label>
            Date range
            <select
              value={custom ? "custom" : f.date}
              onChange={(e) => {
                setCustom(e.target.value === "custom");
                change(
                  "date",
                  e.target.value === "custom" ? today() : e.target.value,
                );
              }}
            >
              <option value="near">Today & tomorrow</option>
              <option value="all">All future dates</option>
              <option value="custom">Specific date</option>
            </select>
          </label>
          {custom && (
            <label>
              Exact date
              <input
                type="date"
                value={f.date}
                onChange={(e) => change("date", e.target.value)}
              />
            </label>
          )}
          <div className="field-pair">
            <label>
              From
              <input
                type="time"
                value={f.start}
                onChange={(e) => change("start", e.target.value)}
              />
            </label>
            <label>
              Until
              <input
                type="time"
                value={f.end}
                onChange={(e) => change("end", e.target.value)}
              />
            </label>
          </div>
          <label>
            Dining hall
            <select
              value={f.hall}
              onChange={(e) => change("hall", e.target.value)}
            >
              <option value="">All locations</option>
              {Array.from(
                new Set([
                  ...halls.filter((h) => h !== "Other"),
                  ...state.listings.map((l) => l.diningHall),
                ]),
              ).map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </label>
          <label>
            Meal method
            <select
              value={f.meal}
              onChange={(e) => change("meal", e.target.value)}
            >
              <option value="">Any meal method</option>
              {meals.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label>
            Handoff method
            <select
              value={f.handoff}
              onChange={(e) => change("handoff", e.target.value)}
            >
              <option value="">Any handoff</option>
              {handoffs.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <div className="field-pair">
            <label>
              Min USD / swipe
              <input
                type="number"
                min="0"
                step="0.01"
                value={f.min}
                onChange={(e) => change("min", e.target.value)}
                placeholder="0.00"
              />
            </label>
            <label>
              Max USD / swipe
              <input
                type="number"
                min="0"
                step="0.01"
                value={f.max}
                onChange={(e) => change("max", e.target.value)}
                placeholder="Any"
              />
            </label>
          </div>
          {invalid && (
            <p role="alert" className="error">
              Use an ordered time and price range.
            </p>
          )}
          <p className="fine">
            Filters combine. Times overlap; buy budgets overlap your price
            range.
          </p>
        </aside>
        <section className="results">
          <div className="section-top">
            <div>
              <h2>
                {list.length} {type === "sell" ? "offers" : "requests"} on the
                board
              </h2>
              <p className="fine">
                {f.date === "near"
                  ? `${today()} – ${addDays(today(), 1)}`
                  : f.date === "all"
                    ? "All future dates"
                    : f.date}
              </p>
            </div>
            <label className="sort">
              Sort by
              <select
                value={f.sort}
                onChange={(e) => change("sort", e.target.value)}
              >
                <option value="newest">Newest first</option>
                {type === "sell" ? (
                  <option value="price">Lowest price</option>
                ) : (
                  <option value="budget">Highest budget</option>
                )}
              </select>
            </label>
          </div>
          {list.length ? (
            <div className="cards">
              {list.map((l) => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  owner={publicUser(
                    state.users.find((u) => u.id === l.ownerId)!,
                  )}
                  onOpen={() => open(l.id)}
                />
              ))}
            </div>
          ) : (
            <div className="empty">
              <span aria-hidden="true">⌕</span>
              <h3>No swipes in this window</h3>
              <p>Try a wider date range, or share what you’re looking for.</p>
              <button
                onClick={() => {
                  setF(defaultFilters());
                  setCustom(false);
                }}
              >
                Clear filters
              </button>{" "}
              <button className="primary" onClick={post}>
                Create a post
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
