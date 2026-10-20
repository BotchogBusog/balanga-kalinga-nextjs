// Counseling page: students browse available counselors and request appointments.
import { redirect } from "next/navigation";      // server-side redirect helper
import { revalidatePath } from "next/cache";     // refresh cached page data
import { query } from "../../lib/db";            // database helper
import { requireStudent } from "../../lib/auth"; // students only
import TimeSlotFields from "./TimeSlotFields";    // date/time inputs that also block past slots

// manilaNow — the current date and time in the Philippines as "YYYY-MM-DDTHH:mm".
// Appointment dates/times are stored as Philippine local time, so the "is this
// in the past?" check must use the Philippine clock, not the server's (Vercel runs on UTC).
function manilaNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {   // en-CA formats the date as YYYY-MM-DD
    timeZone: "Asia/Manila",                         // Philippine Standard Time (no daylight saving)
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false, // 24-hour clock, e.g. "13:45"
  }).formatToParts(new Date());                      // split into labelled parts
  const get = (type) => parts.find((p) => p.type === type)?.value || "00"; // one part's value
  const hour = get("hour") === "24" ? "00" : get("hour");  // some ICU builds report midnight as 24
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`; // sortable stamp
}

// statusBadge — badge colour for an appointment status.
function statusBadge(status) {
  if (status === "approved") return "badge-green";
  if (status === "pending") return "badge-yellow";
  if (["cancelled", "declined"].includes(status)) return "badge-red";
  if (status === "completed") return "badge-blue";
  return "badge-blue";   // default
}

// Server component: renders counselors, the booking forms, and the history.
export default async function CounselingPage({ searchParams }) {
  const user = await requireStudent();   // logged-in student

  // Server Action: create an appointment request.
  async function bookAction(formData) {
    "use server";
    const { query: q } = await import("../../lib/db");
    const { getSessionUserId } = await import("../../lib/auth");
    const { redirect: red } = await import("next/navigation");
    const uid = getSessionUserId();               // current user id
    if (!uid) red("/login");                      // must be signed in
    const counselor_id = Number(formData.get("counselor_id"));   // chosen counselor
    const date = (formData.get("requested_date") || "").toString();
    const time = (formData.get("requested_time") || "").toString();
    const method = (formData.get("method") || "In-person").toString();
    const notes = (formData.get("notes") || "").toString().trim();
    // Build a unique transaction reference, e.g. BK-20251018-AB12CD34.
    const transactionRef = `BK-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    // Counselor, date and time are required.
    if (!counselor_id || !date || !time) red("/counseling?error=" + encodeURIComponent("Please fill in date and time."));
    // Reject a slot that has already passed — this covers earlier times on today's
    // date too (e.g. 1:40 PM requested when it is already 1:45 PM).
    const slot = `${date}T${time.slice(0, 5)}`;   // the requested slot as "YYYY-MM-DDTHH:mm"
    if (slot <= manilaNow()) {
      red("/counseling?error=" + encodeURIComponent("That date and time has already passed. Please choose a slot later than now."));
    }
    // Reject the slot if another pending/approved appointment already holds it.
    const occupied = await q(
      "SELECT id FROM appointments WHERE counselor_id=? AND requested_date=? AND requested_time=? AND status IN ('pending','approved') LIMIT 1",
      [counselor_id, date, time]
    );
    if (occupied.length) {
      red("/counseling?error=" + encodeURIComponent("This counselor is unavailable at that date and time. Please choose another time slot."));
    }
    // Save the request with status "pending".
    await q("INSERT INTO appointments (transaction_ref,user_id,counselor_id,requested_date,requested_time,method,notes,status) VALUES (?,?,?,?,?,?,?,?)",
      [transactionRef, uid, counselor_id, date, time, method, notes, "pending"]);
    const { revalidatePath: rev } = await import("next/cache");
    rev("/counseling");                                  // refresh cached data
    red("/counseling?saved=requested");                  // confirm to the user
  }

  // Cancel action: reached via the ?cancel=<id> link (only the owner's row is touched).
  if (searchParams?.cancel) {
    await query("UPDATE appointments SET status='cancelled' WHERE id=? AND user_id=?", [Number(searchParams.cancel), user.id]);
    revalidatePath("/counseling");
    redirect("/counseling?saved=1");
  }

  // Data for the page: available counselors, this student's appointments, today's date.
  const counselors = await query("SELECT * FROM counselors WHERE is_available=1");
  const appointments = await query("SELECT a.*, c.name as counselor_name, c.specialization FROM appointments a JOIN counselors c ON c.id=a.counselor_id WHERE a.user_id=? ORDER BY a.created_at DESC", [user.id]);
  const today = manilaNow().slice(0, 10);   // today's date in the Philippines (the date input's minimum)

  return (
    <>
      <h1>Counseling</h1>
       <p className="muted">Request a time with a counselor. Occupied appointment slots cannot be booked. Your notes are private between you and the counselor.</p>
      {/* Status notices from the URL. */}
      {searchParams?.error && <div className="notice notice-error" style={{ marginTop: 10 }}>{searchParams.error}</div>}
       {searchParams?.saved && <div className="notice notice-success" style={{ marginTop: 10 }}>{searchParams.saved === "requested" ? "Appointment request submitted. Your transaction reference is shown below." : "Appointment transaction updated."}</div>}
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div>
          <h2>Available counselors</h2>
          {/* One card per available counselor, each with its own booking form. */}
          {counselors.map((c) => (
            <div key={c.id} className="card" style={{ marginBottom: 12 }}>
              <h3>{c.name}</h3>
              <div className="badge badge-blue" style={{ fontSize: 11 }}>{c.specialization}</div>
              <p className="muted" style={{ marginTop: 6 }}>{c.description}</p>
              <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>Schedule: {c.schedule}</p>
              {/* Collapsible booking form. */}
              <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#2b5ea6" }}>Request appointment with {c.name.split(" ")[0]}</summary>
                <form action={bookAction} style={{ marginTop: 10 }}>
                  {/* Hidden field carries the counselor id into the action. */}
                  <input type="hidden" name="counselor_id" value={c.id} />
                  {/* Date + time; today's already-past times are blocked in the browser too. */}
                  <TimeSlotFields today={today} />
                  <div className="form-group"><label>Method</label><select name="method" defaultValue="In-person"><option>In-person</option><option>Video call</option><option>Phone</option></select></div>
                  <div className="form-group"><label>Notes (optional)</label><textarea name="notes" placeholder="What would you like to talk about?" /></div>
                  <button type="submit" className="btn btn-primary btn-small">Submit appointment request</button>
                </form>
              </details>
            </div>
          ))}
        </div>
        <div>
          <div className="card">
            <h2>Appointment transaction history</h2>
            {/* One block per appointment, newest first. */}
            {appointments.length ? appointments.map((a) => (
              <div key={a.id} style={{ padding: "10px 0", borderBottom: "1px solid #eef2f7" }}>
                {/* The reference number students use to track the request. */}
                <div className="eyebrow" style={{ marginBottom: 4 }}>Reference: {a.transaction_ref || `BK-${a.id}`}</div>
                <strong style={{ fontSize: 14 }}>{a.counselor_name}</strong> <span className="muted" style={{ fontSize: 12 }}>- {a.specialization}</span><br />
                <span style={{ fontSize: 13 }}>{String(a.requested_date).slice(0, 10)} at {a.requested_time} - {a.method}</span>
                <span className={`badge ${statusBadge(a.status)}`} style={{ marginLeft: 6, fontSize: 11 }}>{a.status}</span>
                {/* Notes, when provided. */}
                {a.notes && <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>{a.notes}</p>}
                 {/* A pending request can still be cancelled. */}
                 {a.status === "pending" && <div style={{ marginTop: 6 }}><a href={`/counseling?cancel=${a.id}`} style={{ fontSize: 12, color: "#b42318" }}>Cancel request</a></div>}
              </div>
            )) : <p className="muted">No appointments yet. Request one on the left.</p>}
          </div>
          {/* Short explanation of the appointment lifecycle. */}
          <div className="card" style={{ marginTop: 12 }}>
            <h3>What to expect</h3>
            <ul style={{ marginLeft: 18, fontSize: 13, color: "#475467", lineHeight: 1.8 }}>
              <li>Counselor reviews your request (usually within a day)</li>
               <li>Track the request with your transaction reference number</li>
               <li>Status can be pending, approved, declined, completed, or cancelled</li>
              <li>Meet at the agreed time and place</li>
              <li>You can cancel a pending request any time</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
