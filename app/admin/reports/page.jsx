import Link from "next/link";
import { query } from "../../../lib/db";
import { requireAdmin } from "../../../lib/auth";
import PrintReportButton from "../../../components/PrintReportButton";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isDate(value) {
  return DATE_PATTERN.test(String(value || ""));
}

function countFor(rows, key) {
  return Number(rows.find((row) => row.label === key)?.total || 0);
}

export default async function ReportsPage({ searchParams }) {
  await requireAdmin();
  const from = isDate(searchParams?.from) ? searchParams.from : "";
  const to = isDate(searchParams?.to) ? searchParams.to : "";
  const filters = [];
  const params = [];
  if (from) { filters.push("created_at >= ?"); params.push(from); }
  if (to) { filters.push("created_at < DATE_ADD(?, INTERVAL 1 DAY)"); params.push(to); }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const period = from || to ? `${from || "Start"} to ${to || "Today"}` : "All records";

  const [appointmentStatuses, wellnessLevels, registrations, appointments] = await Promise.all([
    query(`SELECT status AS label, COUNT(*) AS total FROM appointments ${where} GROUP BY status`, params),
    query(`SELECT overall_level AS label, COUNT(*) AS total FROM wellness_assessments ${where} GROUP BY overall_level`, params),
    query(`SELECT COUNT(*) AS total FROM users ${where ? where + " AND role='student'" : "WHERE role='student'"}`, params),
    query(`SELECT a.transaction_ref, a.requested_date, a.requested_time, a.method, a.status, a.created_at, u.name AS student_name, c.name AS counselor_name FROM appointments a JOIN users u ON u.id=a.user_id JOIN counselors c ON c.id=a.counselor_id ${where.replaceAll("created_at", "a.created_at")} ORDER BY a.created_at DESC LIMIT 100`, params),
  ]);

  const totalAppointments = appointmentStatuses.reduce((sum, row) => sum + Number(row.total), 0);
  const totalWellness = wellnessLevels.reduce((sum, row) => sum + Number(row.total), 0);

  return (
    <>
      <div className="page-heading report-heading">
        <div><div className="eyebrow">Admin module</div><h1 style={{ marginTop: 4 }}>Reports</h1><p className="muted" style={{ marginTop: 5 }}>Summary of student registrations, wellness checks, and counseling transactions.</p></div>
        <PrintReportButton />
      </div>

      <form className="card report-filter" action="/admin/reports">
        <div className="form-row"><div className="form-group"><label>From date</label><input type="date" name="from" defaultValue={from} /></div><div className="form-group"><label>To date</label><input type="date" name="to" defaultValue={to} /></div></div>
        <div className="report-filter-actions"><button className="btn btn-primary" type="submit">Apply filter</button><Link href="/admin/reports" className="btn btn-secondary">Clear filter</Link><span className="muted">Showing: {period}</span></div>
      </form>

      <div className="grid grid-3 report-summary">
        <div className="card stat admin-stat-primary"><div className="label">Student registrations</div><div className="value">{Number(registrations[0]?.total || 0)}</div><div className="muted">Within selected period</div></div>
        <div className="card stat"><div className="label">Wellness checks</div><div className="value">{totalWellness}</div><div className="muted">Within selected period</div></div>
        <div className="card stat"><div className="label">Appointment transactions</div><div className="value">{totalAppointments}</div><div className="muted">Within selected period</div></div>
      </div>

      <div className="grid grid-2">
        <section className="card">
          <h2>Wellness assessment summary</h2>
          {wellnessLevels.length ? wellnessLevels.map((row) => <div key={row.label} className="status-row"><span style={{ textTransform: "capitalize" }}>{row.label} risk</span><strong>{Number(row.total)}</strong></div>) : <p className="muted">No wellness checks in this period.</p>}
        </section>
        <section className="card">
          <h2>Appointment transaction status</h2>
          {appointmentStatuses.length ? appointmentStatuses.map((row) => <div key={row.label} className="status-row"><span style={{ textTransform: "capitalize" }}>{row.label}</span><strong>{Number(row.total)}</strong></div>) : <p className="muted">No appointment transactions in this period.</p>}
        </section>
      </div>

      <section className="card report-table-card">
        <h2>Appointment transaction report</h2>
        {appointments.length ? <div className="admin-table-scroll"><table><tbody>
          <tr><th>Reference</th><th>Student</th><th>Counselor</th><th>Appointment</th><th>Method</th><th>Status</th><th>Submitted</th></tr>
          {appointments.map((appointment) => <tr key={appointment.transaction_ref || appointment.created_at}>
            <td><strong>{appointment.transaction_ref || "—"}</strong></td><td>{appointment.student_name}</td><td>{appointment.counselor_name}</td>
            <td>{String(appointment.requested_date).slice(0, 10)}<br />{appointment.requested_time}</td><td>{appointment.method}</td>
            <td><span className={`badge ${appointment.status === "approved" ? "badge-green" : appointment.status === "pending" ? "badge-yellow" : ["declined", "cancelled"].includes(appointment.status) ? "badge-red" : "badge-blue"}`}>{appointment.status}</span></td>
            <td>{new Date(appointment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
          </tr>)}
        </tbody></table></div> : <p className="muted">No appointment transactions in this period.</p>}
      </section>
    </>
  );
}
