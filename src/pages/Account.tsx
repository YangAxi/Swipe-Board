import { useState } from "react";
import { canSell, publicUser, type Listing, type State } from "../domain";
import { type Action } from "../store";
import { ListingCard } from "../components/ListingCard";
export default function Account({
  state,
  dispatch,
  open,
  edit,
  reset,
}: {
  state: State;
  dispatch: (a: Action) => void;
  open: (id: string) => void;
  edit: (id: string) => void;
  reset: () => void;
}) {
  const [error, setError] = useState(""),
    [confirm, setConfirm] = useState(false),
    [ok, setOk] = useState("");
  const user = state.users.find((u) => u.id === state.currentUserId);
  const mine = state.listings.filter((l) => l.ownerId === user?.id);
  const [profile, setProfile] = useState({
    nickname: user?.nickname ?? "",
    major: user?.major ?? "",
    year: user?.year ?? "",
  });
  const run = (a: Action) => {
    setError("");
    setOk("");
    try {
      dispatch(a);
      setOk("Saved locally.");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <>
      <p className="eyebrow">YOUR CORNER OF THE BOARD</p>
      <h1>My Account</h1>
      <div className="account-grid">
        <section className="panel">
          <h2>Choose a demo identity</h2>
          <p>
            No email is sent. These fictional accounts simulate permissions on
            this browser only.
          </p>
          <div className="identities">
            <button
              aria-pressed={!user}
              onClick={() => run({ kind: "session", userId: null })}
            >
              Guest <small>Browse only</small>
            </button>
            {state.users.map((u) => (
              <button
                key={u.id}
                aria-pressed={user?.id === u.id}
                onClick={() => run({ kind: "session", userId: u.id })}
              >
                {u.nickname}
                <small>
                  {canSell(u)
                    ? "Simulated campus · buy & sell"
                    : "Simulated ordinary · buy only"}
                </small>
              </button>
            ))}
          </div>
          {user && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                run({ kind: "profile", ...profile });
              }}
            >
              <h3>Your local profile</h3>
              <label>
                Nickname
                <input
                  required
                  maxLength={40}
                  value={profile.nickname}
                  onChange={(e) =>
                    setProfile({ ...profile, nickname: e.target.value })
                  }
                />
              </label>
              <label>
                Year · optional
                <input
                  maxLength={40}
                  value={profile.year}
                  onChange={(e) =>
                    setProfile({ ...profile, year: e.target.value })
                  }
                />
              </label>
              <label>
                Major · optional
                <input
                  maxLength={100}
                  value={profile.major}
                  onChange={(e) =>
                    setProfile({ ...profile, major: e.target.value })
                  }
                />
              </label>
              <button type="submit">Save profile</button>
            </form>
          )}
        </section>
        <section className="panel demo-panel">
          <span className="pill">LOCAL DEMO</span>
          <h2>A small, shared simulation.</h2>
          <p>
            Account switching is not authentication. Data lives in this browser;
            there is no cross-device sync or real transaction service.
          </p>
          <p>Emails are private and never shown on public profiles.</p>
          <button className="danger" onClick={() => setConfirm(true)}>
            Reset Demo Data
          </button>
          {confirm && (
            <div className="notice">
              <p>
                Replace all local demo posts and profile changes with fresh
                examples?
              </p>
              <div className="actions">
                <button
                  className="danger"
                  onClick={() => {
                    try {
                      reset();
                      setConfirm(false);
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  Confirm reset
                </button>
                <button onClick={() => setConfirm(false)}>Keep my data</button>
              </div>
            </div>
          )}
        </section>
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {ok && (
        <p role="status" className="notice">
          {ok}
        </p>
      )}
      <section className="my-posts">
        <div className="section-top">
          <h2>
            My posts <span className="count">{mine.length}</span>
          </h2>
          <p className="fine">Paused, closed and expired posts stay here.</p>
        </div>
        {mine.length ? (
          <div className="cards">
            {mine.map((l) => (
              <div key={l.id}>
                <ListingCard
                  listing={l}
                  owner={publicUser(user!)}
                  management
                  onOpen={() => open(l.id)}
                />
                <div className="manage-actions">
                  <button onClick={() => edit(l.id)}>Edit</button>
                  {l.status !== "paused" && (
                    <button
                      onClick={() =>
                        run({ kind: "status", id: l.id, status: "paused" })
                      }
                    >
                      Pause
                    </button>
                  )}
                  {l.status !== "open" && (
                    <button
                      onClick={() =>
                        run({ kind: "status", id: l.id, status: "open" })
                      }
                    >
                      Reopen
                    </button>
                  )}
                  {l.status !== "closed" && (
                    <button
                      onClick={() =>
                        run({ kind: "status", id: l.id, status: "closed" })
                      }
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>
              {user
                ? "Your first post belongs here."
                : "Choose an account to manage its posts."}
            </h3>
          </div>
        )}
      </section>
    </>
  );
}
