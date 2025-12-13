import React, { useState } from "react";

export default function JournalForm({ onAdd }) {
  const [mood, setMood] = useState(5);
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");

  function submit(e) {
    e.preventDefault();

    const moodNum = Number(mood);
    if (Number.isNaN(moodNum)) return alert("Provide a valid mood (0–10).");

    onAdd({
      date: date ? new Date(date) : new Date(),
      mood: moodNum,
      note,
    });

    setNote("");
    setDate("");
    setMood(5);
  }

  return (
    <form onSubmit={submit} className="journal-form">
      <div className="journal-field">
        <label className="journal-label">Mood (0–10)</label>
        <input
          className="mood-slider"
          type="range"
          min="0"
          max="10"
          step="1"
          value={mood}
          onChange={(e) => setMood(Number(e.target.value))}
        />
        <div className="mood-value">Selected: {mood}/10</div>
      </div>

      <div className="journal-field">
        <label className="journal-label">Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="journal-textarea"
          rows={3}
          placeholder="What influenced your mood today?"
        />
      </div>

      <div className="journal-field">
        <label className="journal-label">Date (optional)</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="journal-input"
        />
      </div>

      <button className="journal-button" type="submit">
        Add Entry
      </button>
    </form>
  );
}
