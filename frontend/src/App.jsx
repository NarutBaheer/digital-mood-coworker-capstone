import { GoogleLogin } from "@react-oauth/google";
import React, { useState, useEffect } from "react";
import axios from "axios";
import JournalForm from "./components/JournalForm";
import MoodChart from "./components/MoodChart";
import { useMoodState, useMoodDispatch } from "./context/MoodContext";

const API = import.meta.env.VITE_API_URL || "/api";

// Local-only encouragement (no external fetch)
const LOCAL_QUOTES = [
  { text: "Keep going. Small steps still move you forward.", author: "Digital Mood Co-Worker" },
  { text: "Progress, not perfection.", author: "Digital Mood Co-Worker" },
  { text: "You showed up today. That matters.", author: "Digital Mood Co-Worker" },
  { text: "Even quiet days count as progress.", author: "Digital Mood Co-Worker" },
  { text: "Be patient with yourself.", author: "Digital Mood Co-Worker" },
];

function setLocalQuote(dispatch) {
  const q = LOCAL_QUOTES[Math.floor(Math.random() * LOCAL_QUOTES.length)];
  dispatch({ type: "SET_QUOTE", payload: q });
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Global mood state from Context + useReducer
  const moodState = useMoodState();
  const dispatch = useMoodDispatch();

  // Make sure entries is always a safe array
  const entries = Array.isArray(moodState?.entries) ? moodState.entries : [];
  const { loading, error, quote } = moodState || {};

  // Co-worker stats
  const avgMood = entries.length
    ? (entries.reduce((sum, e) => sum + (e.mood || 0), 0) / entries.length).toFixed(1)
    : null;

  const latest = entries.length ? entries[entries.length - 1] : null;

  // Helper to load entries from backend
  async function fetchEntries(currentToken) {
    if (!currentToken) return;
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const res = await axios.get(API + "/entries", {
        headers: { Authorization: "Bearer " + currentToken },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      dispatch({ type: "SET_ENTRIES", payload: data });
    } catch (err) {
      console.error("Fetch entries error:", err.response?.data || err.message);
      dispatch({
        type: "SET_ERROR",
        payload: err.message || "Failed to fetch entries",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }

  // On login/token change → load entries + set local quote
  useEffect(() => {
    if (!token) return;
    fetchEntries(token);
    setLocalQuote(dispatch);
  }, [token, dispatch]);

  async function handleLogin(email, password) {
    try {
      const res = await axios.post(API + "/auth/login", { email, password });
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert("Login failed");
    }
  }

  async function handleSignup(name, email, password) {
    try {
      const res = await axios.post(API + "/auth/signup", { name, email, password });
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      alert("Signup failed");
    }
  }

  // ✅ Google login handler
  async function handleGoogle(credentialResponse) {
    try {
      const res = await axios.post(API + "/auth/google", {
        credential: credentialResponse.credential,
      });
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      console.error("Google login error:", err.response?.data || err.message);
      alert("Google login failed");
    }
  }

  async function addEntry(data) {
    if (!token) return;
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await axios.post(API + "/entries", data, {
        headers: { Authorization: "Bearer " + token },
      });

      // Reload entries and refresh local quote
      await fetchEntries(token);
      setLocalQuote(dispatch);
    } catch (err) {
      console.error("Add entry error:", err.response?.data || err.message);
      dispatch({
        type: "SET_ERROR",
        payload: err.message || "Failed to add entry",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }

  return (
    <div className="app-shell">
      <div className="app-card">
        {/* Header */}
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-lg">
                🙂
              </span>
              Digital Mood Co-Worker
            </h1>
            <p className="mt-2 text-sm md:text-base text-slate-600 max-w-xl">
              Your AI-powered mood partner that helps you track emotional trends, notice patterns,
              and reflect on your day.
            </p>
          </div>

          {token && (
            <div className="stats-row">
              <div className="stat-pill">
                <span className="stat-label">Entries</span>
                <span className="stat-value">{entries.length}</span>
              </div>

              <div className="stat-pill">
                <span className="stat-label">Average mood</span>
                <span className="stat-value">{avgMood ? `${avgMood}/10` : "--"}</span>
              </div>
            </div>
          )}
        </header>

        {/* Content */}
        {!token ? (
          <section className="grid md:grid-cols-2 gap-8 items-start">
            <div className="hidden md:block">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Welcome back</h2>
              <p className="text-sm text-slate-600 mb-3">
                Log how you feel in just a few seconds a day. Your Digital Mood Co-Worker turns
                those entries into gentle insights about your energy, stress, and overall well-being.
              </p>
              <ul className="mt-2 text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li>Track mood on a simple 0–10 scale</li>
                <li>Spot trends over weeks, not just days</li>
                <li>Get a small motivational nudge every time you log</li>
              </ul>
            </div>

            <div className="section-card">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                Login or create an account
              </h2>

              {/* ✅ pass onGoogle */}
              <AuthForms onLogin={handleLogin} onSignup={handleSignup} onGoogle={handleGoogle} />
            </div>
          </section>
        ) : (
          <section className="space-y-6">
            {loading && <p className="text-sm text-slate-500">Loading your entries…</p>}
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            {/* Journal + insights */}
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="section-card">
                <h2 className="text-base font-semibold text-slate-900 mb-3">
                  Log today&apos;s mood
                </h2>
                <JournalForm onAdd={addEntry} />
              </div>

              <div className="space-y-4">
                {entries.length > 0 && (
                  <div className="section-card">
                    <h2 className="font-semibold text-slate-900 mb-1 text-sm">Quick snapshot</h2>
                    <p className="text-sm text-slate-700">
                      You’ve logged <span className="font-semibold">{entries.length}</span> mood
                      entries so far. Your average mood is{" "}
                      <span className="font-semibold">{avgMood ? `${avgMood}/10` : "--"}</span>
                      {latest && (
                        <>
                          , and your latest entry on{" "}
                          <span className="font-semibold">
                            {new Date(latest.date).toLocaleDateString()}
                          </span>{" "}
                          was <span className="font-semibold">{latest.mood}/10</span>.
                        </>
                      )}
                    </p>
                  </div>
                )}

                {/* Motivational quote */}
                <section className="quote-panel">
                  <h2 className="font-semibold mb-2 text-slate-900 text-sm">AI Encouragement</h2>
                  {quote ? (
                    <blockquote className="quote-text text-slate-800">
                      “{quote.text}”
                      <footer className="quote-author text-slate-600">— {quote.author}</footer>
                    </blockquote>
                  ) : (
                    <p className="quote-loading text-sm text-slate-500">Loading encouragement…</p>
                  )}
                </section>
              </div>
            </div>

            {/* Chart */}
            <div className="chart-card">
              <h2 className="text-base font-semibold text-slate-900 mb-3">Mood over time</h2>
              <MoodChart entries={entries} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function AuthForms({ onLogin, onSignup, onGoogle }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({});

  return (
    <div className="space-y-4">
      {/* ✅ Google button */}
      <div className="pt-2">
        <GoogleLogin
          onSuccess={onGoogle}
          onError={() => alert("Google login failed")}
          useOneTap={false}
        />
      </div>

      <div className="relative py-2">
        <div className="h-px bg-slate-200" />
        <span className="absolute left-1/2 -translate-x-1/2 -top-1.5 bg-white px-2 text-xs text-slate-500">
          or
        </span>
      </div>

      <div className="inline-flex rounded-full bg-slate-200 p-1 mb-1">
        <button
          type="button"
          className={`px-4 py-1 text-sm rounded-full transition ${
            !isSignup ? "bg-white shadow-sm text-slate-900" : "text-slate-600"
          }`}
          onClick={() => setIsSignup(false)}
        >
          Login
        </button>
        <button
          type="button"
          className={`px-4 py-1 text-sm rounded-full transition ${
            isSignup ? "bg-white shadow-sm text-slate-900" : "text-slate-600"
          }`}
          onClick={() => setIsSignup(true)}
        >
          Signup
        </button>
      </div>

      {isSignup && (
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
          <input
            placeholder="Your name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-slate-300 rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
        <input
          placeholder="you@example.com"
          type="email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border border-slate-300 rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
        <input
          placeholder="••••••••"
          type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border border-slate-300 rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <button
        type="button"
        className="w-full mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-indigo-700 active:bg-indigo-800 transition"
        onClick={() =>
          isSignup
            ? onSignup(form.name, form.email, form.password)
            : onLogin(form.email, form.password)
        }
      >
        {isSignup ? "Create account" : "Log in"}
      </button>
    </div>
  );
}

export default App;
