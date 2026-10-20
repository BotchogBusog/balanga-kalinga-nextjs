"use client";
// TimeSlotFields — the date and time inputs of a counseling booking form.
// When the student picks today's date, the time input's minimum is the current
// time, so a past slot is rejected by the browser before the form is sent.
// The server action checks the same rule again (the browser check is only a shortcut).
import { useState } from "react";                       // remember the chosen date

// hhmm — format a Date as "HH:MM", the value format a time input expects.
function hhmm(date) {
  const hours = String(date.getHours()).padStart(2, "0");   // 0-23, zero-padded
  const minutes = String(date.getMinutes()).padStart(2, "0"); // 0-59, zero-padded
  return `${hours}:${minutes}`;                             // e.g. "13:45"
}

// Props: today — the current Philippine date ("YYYY-MM-DD"), used as the earliest date.
export default function TimeSlotFields({ today }) {
  const [date, setDate] = useState("");                 // the date the student has picked
  // Only today needs a minimum time; any future date is fine at any time.
  const minTime = date === today ? hhmm(new Date()) : undefined;
  return (
    <div className="form-row">
      <div className="form-group">
        <label>Date</label>
        {/* No past dates allowed. */}
        <input
          type="date"
          name="requested_date"
          required
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Time</label>
        {/* For today, only times from now onward are accepted. */}
        <input type="time" name="requested_time" required min={minTime} />
      </div>
    </div>
  );
}
