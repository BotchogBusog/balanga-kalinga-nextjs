
import { query } from "../../lib/db";
import { requireStudent } from "../../lib/auth";

function badgeClass(level) {
  if (level === "low") return "badge-green";
  if (level === "moderate") return "badge-yellow";
  if (level === "high") return "badge-red";
  if (level === "Doing Well") return "badge-green";
  if (level === "Balanced") return "badge-yellow";
  if (level === "Needs Attention") return "badge-orange";
  return "badge-red";
}

function levelLabel(level) {
  if (level === "low") return "Low risk";
  if (level === "moderate") return "Moderate risk";
  if (level === "high") return "High risk";
  return level;
}

function appointmentBadge(status) {
  if (status === "approved") return "badge-green";
  if (status === "pending") return "badge-yellow";
  if (["declined", "cancelled"].includes(status)) return "badge-red";
  return "badge-blue";
}

export default async function DashboardPage() {
  const user = await requireStudent();
  const uid = user.id;

  const latestRows = await query("SELECT * FROM wellness_assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", [uid]);
  const latest = latestRows[0] || null;
  const appts = await query("SELECT a.*, c.name as counselor_name FROM appointments a JOIN counselors c ON c.id=a.counselor_id WHERE a.user_id=? ORDER BY a.requested_date DESC LIMIT 3", [uid]);
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">Student wellness portal</div>
        <h1 style={{ marginTop: 4 }}>Good to see you, {firstName}</h1>
        <p className="muted" style={{ marginTop: 5 }}>Review your latest check-in or connect with the counseling office.</p>
      </div>
      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <section className="card card-accent">
          <div className="eyebrow">Recommended first step</div>
          <h2 style={{ marginTop: 5 }}>Wellness check</h2>
          <p className="muted">Answer 10 questions in about 2 minutes. Your responses are used to give supportive feedback, not a diagnosis.</p>
          <a href="/wellness" className="btn btn-primary" style={{ marginTop: 14 }}>Take Wellness Check</a>
        </section>
        <section className="card">
          <div className="eyebrow">Latest status</div>
          {latest ? <>
            <div style={{ marginTop: 7 }}><span className={`badge ${badgeClass(latest.overall_level)}`}>{levelLabel(latest.overall_level)}</span></div>
            <p className="muted" style={{ marginTop: 8 }}>{latest.summary}</p>
            <p className="muted" style={{ marginTop: 8 }}>Assessed {new Date(latest.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
            {latest.overall_level === "high" && <div className="notice notice-error" style={{ marginTop: 10, marginBottom: 0 }}>Please contact a counselor soon. <a href="/counseling">View counseling support</a>.</div>}
          </> : <><p className="muted" style={{ marginTop: 7 }}>You have not completed a wellness check yet.</p><a href="/wellness" className="btn btn-secondary btn-small" style={{ marginTop: 10 }}>Start check-in</a></>}
        </section>
      </div>
      <div className="grid grid-2" style={{ marginTop: 2 }}>
        <section className="card">
          <div className="eyebrow">Counseling</div>
          <h2 style={{ marginTop: 5 }}>Appointments</h2>
          {appts.length ? <div className="status-row"><div><strong>{appts[0].counselor_name}</strong><span className="muted">{String(appts[0].requested_date).slice(0, 10)} at {appts[0].requested_time}</span></div><span className={`badge ${appointmentBadge(appts[0].status)}`}>{appts[0].status}</span></div> : <p className="muted">No appointment scheduled.</p>}
          <a href="/counseling" className="btn btn-secondary btn-small" style={{ marginTop: 12 }}>{appts.length ? "View counseling" : "Book counseling"}</a>
        </section>
        <section className="card">
          <div className="eyebrow">Other support</div>
          <h2 style={{ marginTop: 5 }}>Kalinga AI</h2>
          <p className="muted">Use Kalinga AI for supportive information about stress, sleep, emotions, and coping. It is not a counselor or emergency service.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}><a href="/ai-chat" className="btn btn-secondary btn-small">Open Kalinga AI</a></div>
        </section>
      </div>
    </>
  );
}
