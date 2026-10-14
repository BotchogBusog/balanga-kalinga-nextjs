// Port of admin.php. Staff see aggregated trends only — never AI chats.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { query } from "../../lib/db";
import { requireAdmin } from "../../lib/auth";

export default async function AdminPage({ searchParams }) {
  const user = await requireAdmin();

  const transactionStatuses = ["pending", "approved", "declined", "completed", "cancelled"];
  if (searchParams?.appointment && transactionStatuses.includes(searchParams?.status)) {
    await query("UPDATE appointments SET status=? WHERE id=?", [searchParams.status, Number(searchParams.appointment)]);
    revalidatePath("/admin");
    redirect("/admin?saved=Appointment transaction updated.");
  }
  if (searchParams?.toggle_counselor) {
    await query("UPDATE counselors SET is_available = 1 - is_available WHERE id=?", [Number(searchParams.toggle_counselor)]);
    revalidatePath("/admin");
    redirect("/admin");
  }
  if (searchParams?.delete_user) {
    const delId = Number(searchParams.delete_user);
    if (delId !== user.id) await query("DELETE FROM users WHERE id=? AND role='student'", [delId]);
    revalidatePath("/admin");
    redirect("/admin");
  }

  const usersCount = (await query("SELECT COUNT(*) as c FROM users WHERE role='student'"))[0].c;
  const assessmentsCount = (await query("SELECT COUNT(*) as c FROM wellness_assessments"))[0].c;
  const pendingCount = (await query("SELECT COUNT(*) as c FROM appointments WHERE status='pending'"))[0].c;
  const totalAppts = (await query("SELECT COUNT(*) as c FROM appointments"))[0].c;
  const counselorsAvail = (await query("SELECT COUNT(*) as c FROM counselors WHERE is_available=1"))[0].c;
  const appointments = await query("SELECT a.*, u.name as student_name, u.email, c.name as counselor_name FROM appointments a JOIN users u ON u.id=a.user_id JOIN counselors c ON c.id=a.counselor_id ORDER BY a.created_at DESC LIMIT 20");
  const counselors = await query("SELECT * FROM counselors");
  const levels = await query("SELECT overall_level, COUNT(*) as c FROM wellness_assessments GROUP BY overall_level");
  const moods = await query("SELECT mood, COUNT(*) as c FROM moods GROUP BY mood");
  const students = await query("SELECT id,name,email,student_id,course,year_level,created_at FROM users WHERE role='student' ORDER BY created_at DESC LIMIT 20");

  return (
    <>
      <div className="admin-workspace">
        <main className="admin-overview">
          <div className="admin-page-heading">
            <div className="eyebrow">Staff workspace</div>
            <h1>Admin Dashboard</h1>
            <p className="muted">Review student support activity, counselor availability, and anonymous wellness trends.</p>
          </div>
          {searchParams?.saved && <div className="notice notice-success">{searchParams.saved}</div>}
          <div className="grid grid-3">
            <div className="card stat admin-stat-primary">
              <div className="label">Students</div><div className="value">{Number(usersCount)}</div><div className="muted">Registered accounts</div>
            </div>
            <div className="card stat"><div className="label">Pending appointments</div><div className="value">{Number(pendingCount)}</div><div className="muted">of {Number(totalAppts)} total requests</div></div>
            <div className="card stat"><div className="label">Available counselors</div><div className="value">{Number(counselorsAvail)}</div><div className="muted">Currently on duty</div></div>
          </div>
          <div className="card admin-checks">
            <div className="label">Wellness checks total</div>
            <div className="value">{Number(assessmentsCount)}</div>
          </div>
          <div className="grid grid-2">
            <div className="card">
              <h2>Wellness levels</h2>
              {levels.length ? levels.map((l, i) => (
                <div key={i} className="status-row"><span>{l.overall_level}</span><strong>{Number(l.c)}</strong></div>
              )) : <p className="muted">No data yet.</p>}
              <h2 style={{ marginTop: 18 }}>Mood counts</h2>
              {moods.length ? moods.map((m, i) => (
                <div key={i} className="status-row"><span>{m.mood}</span><strong>{Number(m.c)}</strong></div>
              )) : <p className="muted">No moods yet.</p>}
            </div>
            <div className="card" id="counselors">
              <h2>Counselors</h2>
              {counselors.map((c) => (
                <div key={c.id} className="status-row">
                  <div><strong>{c.name}</strong><span className="muted">{c.specialization} · {c.is_available ? "Available" : "Unavailable"}</span></div>
                  <a href={`/admin?toggle_counselor=${c.id}`} className="btn btn-secondary btn-small">{c.is_available ? "Set unavailable" : "Set available"}</a>
                </div>
              ))}
            </div>
          </div>
        </main>
        <aside className="admin-records" aria-label="Latest student records">
          <section className="card admin-record-card" id="appointments">
            <div className="admin-record-heading"><div><div className="eyebrow">Transactions</div><h2>Appointments</h2></div><span className="badge badge-blue">Latest 20</span></div>
            {appointments.length ? <div className="admin-table-scroll">
            <table><tbody>
              <tr><th>Reference / Student</th><th>Counselor</th><th>Date / Time</th><th>Method</th><th>Status</th><th>Update status</th></tr>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td><strong style={{ fontSize: 12 }}>{a.transaction_ref || `BK-${a.id}`}</strong><br />{a.student_name}<br /><span className="muted" style={{ fontSize: 12 }}>{a.email}</span></td>
                  <td>{a.counselor_name}</td>
                  <td>{String(a.requested_date).slice(0, 10)} {a.requested_time}</td>
                  <td>{a.method}</td>
                  <td><span className={`badge ${a.status === "approved" ? "badge-green" : a.status === "pending" ? "badge-yellow" : ["declined", "cancelled"].includes(a.status) ? "badge-red" : "badge-blue"}`}>{a.status}</span></td>
                  <td><form action="/admin" style={{ display: "flex", gap: 6 }}><input type="hidden" name="appointment" value={a.id} /><select name="status" defaultValue={a.status} style={{ minWidth: 104, padding: "5px 6px", fontSize: 12 }}><option value="pending">Pending</option><option value="approved">Approved</option><option value="declined">Declined</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select><button className="btn btn-secondary btn-small" type="submit">Save</button></form></td>
                </tr>
              ))}
            </tbody></table>
            </div> : <p className="muted">No appointments yet.</p>}
          </section>
          <section className="card admin-record-card" id="students">
            <div className="admin-record-heading"><div><div className="eyebrow">Directory</div><h2>Students</h2></div><span className="badge badge-blue">Latest 20</span></div>
            <div className="admin-table-scroll">
          <table><tbody>
            <tr><th>Name</th><th>Email</th><th>ID</th><th>Course</th><th>Joined</th><th></th></tr>
            {students.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td><td>{u.email}</td><td>{u.student_id}</td><td>{u.course}</td>
                <td>{new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                <td><a href={`/admin?delete_user=${u.id}`} style={{ fontSize: 12, color: "#b42318" }}>Remove</a></td>
              </tr>
            ))}
          </tbody></table>
            </div>
          </section>
        </aside>
      </div>
      <p className="muted" style={{ marginTop: 12, fontSize: 12 }}>Admin area - separate login via /admin-login. Student login at /login.</p>
    </>
  );
}
