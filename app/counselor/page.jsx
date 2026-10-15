import { redirect } from "next/navigation";
import { query } from "../../lib/db";
import { requireCounselor } from "../../lib/auth";

const STATUSES = ["pending", "approved", "declined", "completed", "cancelled"];

function badgeClass(status) {
  if (status === "approved") return "badge-green";
  if (status === "pending") return "badge-yellow";
  if (["declined", "cancelled"].includes(status)) return "badge-red";
  return "badge-blue";
}

export default async function CounselorPage({ searchParams }) {
  const user = await requireCounselor();
  const counselorRows = await query("SELECT * FROM counselors WHERE id=? LIMIT 1", [user.counselor_id]);
  const counselor = counselorRows[0];
  if (!counselor) redirect("/admin-login?error=" + encodeURIComponent("Your counselor account is not linked to a counselor profile."));

  async function updateAppointment(formData) {
    "use server";
    const { query: q } = await import("../../lib/db");
    const { getSessionUserId } = await import("../../lib/auth");
    const { redirect: red } = await import("next/navigation");
    const uid = getSessionUserId();
    const appointmentId = Number(formData.get("appointment_id"));
    const status = String(formData.get("status") || "");
    if (!uid || !appointmentId || !STATUSES.includes(status)) red("/admin-login");
    const rows = await q("SELECT counselor_id FROM users WHERE id=? AND role='counselor' LIMIT 1", [uid]);
    if (!rows[0]?.counselor_id) red("/admin-login");
    await q("UPDATE appointments SET status=? WHERE id=? AND counselor_id=?", [status, appointmentId, rows[0].counselor_id]);
    red("/counselor?saved=status");
  }

  async function toggleAvailability() {
    "use server";
    const { query: q } = await import("../../lib/db");
    const { getSessionUserId } = await import("../../lib/auth");
    const { redirect: red } = await import("next/navigation");
    const uid = getSessionUserId();
    const rows = await q("SELECT counselor_id FROM users WHERE id=? AND role='counselor' LIMIT 1", [uid]);
    if (!rows[0]?.counselor_id) red("/admin-login");
    await q("UPDATE counselors SET is_available=1-is_available WHERE id=?", [rows[0].counselor_id]);
    red("/counselor?saved=availability");
  }

  async function changePassword(formData) {
    "use server";
    const { query: q } = await import("../../lib/db");
    const { getSessionUserId, hashPassword } = await import("../../lib/auth");
    const { redirect: red } = await import("next/navigation");
    const password = String(formData.get("password") || "");
    const confirm = String(formData.get("confirm") || "");
    const uid = getSessionUserId();
    if (!uid) red("/admin-login");
    if (password.length < 8 || password !== confirm) red("/counselor?error=" + encodeURIComponent("Use a matching password of at least 8 characters."));
    await q("UPDATE users SET password_hash=? WHERE id=? AND role='counselor'", [await hashPassword(password), uid]);
    red("/counselor?saved=password");
  }

  const appointments = await query("SELECT a.*, u.name AS student_name, u.email AS student_email FROM appointments a JOIN users u ON u.id=a.user_id WHERE a.counselor_id=? ORDER BY a.requested_date DESC, a.requested_time DESC", [counselor.id]);

  return <>
    <div className="page-heading counselor-heading"><div><div className="eyebrow">Counselor workspace</div><h1 style={{ marginTop: 4 }}>Welcome, {counselor.name}</h1><p className="muted" style={{ marginTop: 5 }}>Review only the counseling appointments assigned to you.</p></div><form action={toggleAvailability}><button className={`btn ${counselor.is_available ? "btn-primary" : "btn-secondary"}`} type="submit">{counselor.is_available ? "Available for requests" : "Unavailable for requests"}</button></form></div>
    {searchParams?.saved && <div className="notice notice-success">{searchParams.saved === "status" ? "Appointment status updated." : searchParams.saved === "password" ? "Password updated." : "Availability updated."}</div>}
    {searchParams?.error && <div className="notice notice-error">{searchParams.error}</div>}
    <div className="grid grid-3">
      <div className="card stat admin-stat-primary"><div className="label">Appointments</div><div className="value">{appointments.length}</div><div className="muted">All assigned to you</div></div>
      <div className="card stat"><div className="label">Pending</div><div className="value">{appointments.filter((a) => a.status === "pending").length}</div><div className="muted">Need a response</div></div>
      <div className="card stat"><div className="label">Availability</div><div className="value">{counselor.is_available ? "Open" : "Closed"}</div><div className="muted">For new requests</div></div>
    </div>
    <section className="card report-table-card"><h2>My appointment transactions</h2>
      {appointments.length ? <div className="admin-table-scroll"><table><tbody><tr><th>Reference</th><th>Student</th><th>Date / Time</th><th>Method</th><th>Notes</th><th>Status</th><th>Update</th></tr>
        {appointments.map((appointment) => <tr key={appointment.id}><td><strong>{appointment.transaction_ref || `BK-${appointment.id}`}</strong></td><td>{appointment.student_name}<br /><span className="muted">{appointment.student_email}</span></td><td>{String(appointment.requested_date).slice(0, 10)}<br />{appointment.requested_time}</td><td>{appointment.method}</td><td>{appointment.notes || "—"}</td><td><span className={`badge ${badgeClass(appointment.status)}`}>{appointment.status}</span></td><td><form action={updateAppointment} className="status-update-form"><input type="hidden" name="appointment_id" value={appointment.id} /><select name="status" defaultValue={appointment.status}>{STATUSES.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select><button className="btn btn-secondary btn-small" type="submit">Save</button></form></td></tr>)}
      </tbody></table></div> : <p className="muted">No appointment transactions assigned to you yet.</p>}
    </section>
    <section className="card counselor-password"><h2>Change password</h2><p className="muted">Change the temporary password before using this account regularly.</p><form action={changePassword} className="form-row" style={{ marginTop: 12 }}><div className="form-group"><label>New password</label><input type="password" name="password" required minLength={8} /></div><div className="form-group"><label>Confirm password</label><input type="password" name="confirm" required minLength={8} /></div><div style={{ alignSelf: "end", paddingBottom: 14 }}><button className="btn btn-primary" type="submit">Update password</button></div></form></section>
  </>;
}
