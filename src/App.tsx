import { useEffect, useState } from "react";
import { load, persist, reduce, type Action } from "./store";
import { seed } from "./seed";
import { type State } from "./domain";
import Browse from "./pages/Browse";
import Post from "./pages/Post";
import Detail from "./pages/Detail";
import Account from "./pages/Account";
type Route = { page: string; id?: string };
function route(): Route {
  const [page, id] = location.hash.slice(1).split("/");
  return { page: page || "browse", id };
}
export default function App() {
  const [initial] = useState(() => {
    try {
      return load(window.localStorage);
    } catch {
      return {
        state: null,
        error:
          "Browser storage cannot be accessed. Enable local storage, then reload.",
      };
    }
  });
  const [state, setState] = useState<State | null>(initial.state),
    [error, setError] = useState(initial.error),
    [r, setRoute] = useState(route),
    [toast, setToast] = useState("");
  useEffect(() => {
    const change = () => {
      setRoute(route());
      setToast("");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "swipe-board-demo") {
        setError(
          "Demo data changed in another tab. Reload this page before making further changes.",
        );
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  // Re-evaluate expiry while the app remains open, not only after a refresh.
  const [, tick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => tick((x) => x + 1), 15000);
    return () => clearInterval(timer);
  }, []);
  const go = (page: string, id?: string) => {
    location.hash = page + (id ? "/" + id : "");
  };
  function dispatch(a: Action) {
    if (!state || error) throw Error(error || "Demo data is not available.");
    const next = reduce(state, a);
    persist(window.localStorage, next);
    setState(next);
  }
  function reset() {
    const next = seed();
    persist(window.localStorage, next);
    setState(next);
    setError("");
    go("account");
  }
  const user = state?.users.find((u) => u.id === state.currentUserId),
    listing = state?.listings.find((l) => l.id === r.id);
  return (
    <>
      <div className="demo-bar">
        <strong>DEMO</strong> Local, fictional data · Simulated identities · No
        real transactions
      </div>
      <header>
        <a className="brand" href="#browse">
          <span className="brand-icon" aria-hidden="true">
            s.
          </span>
          swipe board<span className="brand-dot">●</span>
        </a>
        <nav aria-label="Main navigation">
          {[
            ["browse", "Browse"],
            ["post", "Post"],
            ["account", "My Account"],
          ].map(([page, label]) => (
            <a
              key={page}
              className={r.page === page ? "selected" : ""}
              href={"#" + page}
            >
              {page === "post" ? "+ " : ""}
              {label}
            </a>
          ))}
        </nav>
        <a href="#account" className="identity">
          <span className="avatar">{user ? user.nickname[0] : "G"}</span>
          <span>
            {user?.nickname ?? "Guest"}
            <small>{user ? "Simulated account" : "Explore the board"}</small>
          </span>
        </a>
      </header>
      <main>
        {error ? (
          <section className="panel">
            <h1>Local data needs attention</h1>
            <p role="alert" className="error">
              {error}
            </p>
            <p>
              Saved data will not be automatically overwritten. Reload to retry,
              or intentionally replace it.
            </p>
            <button onClick={() => location.reload()}>Reload</button>{" "}
            <button
              className="danger"
              onClick={() => {
                if (
                  window.confirm(
                    "Replace all saved demo data? This cannot be undone.",
                  )
                ) {
                  try {
                    reset();
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }
              }}
            >
              Reset Demo Data
            </button>
          </section>
        ) : (
          state && (
            <>
              {toast && (
                <p role="status" className="success">
                  {toast}
                </p>
              )}
              {r.page === "browse" ? (
                <Browse
                  state={state}
                  open={(id) => go("detail", id)}
                  post={() => go("post")}
                />
              ) : r.page === "post" || r.page === "edit" ? (
                r.page === "edit" &&
                (!listing || listing.ownerId !== user?.id) ? (
                  <section className="empty">
                    <h1>Post unavailable</h1>
                    <p>You can only edit your own posts.</p>
                  </section>
                ) : (
                  <Post
                    key={`${r.page}-${r.id}-${user?.id}`}
                    user={user}
                    existing={r.page === "edit" ? listing : undefined}
                    account={() => go("account")}
                    save={(l) => {
                      dispatch({ kind: "save", listing: l });
                      go("detail", l.id);
                      setTimeout(() => setToast("Post saved locally."), 0);
                    }}
                  />
                )
              ) : r.page === "detail" ? (
                listing ? (
                  <Detail
                    key={`${listing.id}-${user?.id}`}
                    state={state}
                    listing={listing}
                    account={() => go("account")}
                    edit={() => go("edit", listing.id)}
                  />
                ) : (
                  <section className="empty">
                    <h1>Post not found</h1>
                    <a href="#browse">Back to Browse</a>
                  </section>
                )
              ) : r.page === "account" ? (
                <Account
                  key={user?.id ?? "guest"}
                  state={state}
                  dispatch={dispatch}
                  open={(id) => go("detail", id)}
                  edit={(id) => go("edit", id)}
                  reset={reset}
                />
              ) : (
                <section className="empty">
                  <h1>Page not found</h1>
                  <a href="#browse">Back to Browse</a>
                </section>
              )}
            </>
          )
        )}
      </main>
      <footer>
        <a className="brand" href="#browse">
          swipe board<span className="brand-dot">●</span>
        </a>
        <p>A local prototype for clearer meal plans.</p>
        <p>
          Not affiliated with or endorsed by UCLA. The project baseline records
          a prohibition on selling or exchanging meals; this demo does not
          establish permission.
        </p>
      </footer>
    </>
  );
}
