// Port of wellness.php
import { redirect } from "next/navigation";
import { query } from "../../lib/db";
import { requireStudent } from "../../lib/auth";
import { analyzeWellness } from "../../lib/ai";

const QUESTIONS = [
  { text: "How stressed do you feel about academic deadlines and workload right now?", area: "Work" },
  { text: "In the last week, how has your sleep been?", area: "Sleep" },
  { text: "How is your energy level most days?", area: "Energy" },
  { text: "How would you describe your overall mood lately?", area: "Mood" },
  { text: "How connected do you feel to friends, family, or classmates?", area: "Connection" },
  { text: "How often do you feel anxious, nervous, or on edge?", area: "Anxiety" },
  { text: "How is your motivation for schoolwork and daily tasks?", area: "Motivation" },
  { text: "How heavy does your current workload feel?", area: "Workload" },
  { text: "How is your emotional well-being (hopeful vs down) lately?", area: "Emotions" },
  { text: "How well do you feel you are coping with everything right now?", area: "Coping" },
];
const OPTIONS = [
  { value: 0, label: "Very well / Rarely" },
  { value: 1, label: "Okay sometimes" },
  { value: 2, label: "Somewhat difficult" },
  { value: 3, label: "Very difficult" },
];
function badgeClass(level) {
  if (level === "low" || level === "Doing Well") return "badge-green";
  if (level === "moderate" || level === "Balanced") return "badge-yellow";
  if (level === "Needs Attention") return "badge-orange";
  return "badge-red";
}

function riskLabel(level) {
  return level === "low" ? "Low risk" : level === "moderate" ? "Moderate risk" : "High risk";
}

export default async function WellnessPage({ searchParams }) {
  const user = await requireStudent();

  async function submitCheck(formData) {
    "use server";
    const { query: q } = await import("../../lib/db");
    const { getSessionUserId } = await import("../../lib/auth");
    const { redirect: red } = await import("next/navigation");
    const uid = getSessionUserId();
    if (!uid) red("/login");
    const answers = [];
    for (let i = 0; i < QUESTIONS.length; i++) {
      const v = formData.get(`answers_${i}`);
      if (v === null) red("/wellness?error=" + encodeURIComponent("Please answer all questions."));
      answers.push(Math.min(3, Math.max(0, parseInt(v, 10) || 0)));
    }
    const values = answers.map((val, i) => ({ question: QUESTIONS[i].area, value: val }));
    const total = answers.reduce((a, b) => a + b, 0);
    const max = QUESTIONS.length * 3;
    const analysis = await analyzeWellness(values);
    const overall = analysis.riskLevel;
    const weak = analysis.weakAreas;
    const suggested = analysis.suggestions;
    await q("INSERT INTO wellness_assessments (user_id,answers,overall_level,summary,suggested_actions) VALUES (?,?,?,?,?)",
      [uid, JSON.stringify(values), overall, analysis.summary, JSON.stringify(suggested)]);
    const { revalidatePath: rev } = await import("next/cache");
    rev("/wellness");
    red("/wellness?result=" + encodeURIComponent(JSON.stringify({ overall, total, max, summary: analysis.summary, weak, suggested })));
  }

  const history = await query("SELECT * FROM wellness_assessments WHERE user_id=? ORDER BY created_at DESC LIMIT 10", [user.id]);
  let result = null;
  try { if (searchParams?.result) result = JSON.parse(searchParams.result); } catch {}
  const counselor = result?.overall === "high"
    ? (await query("SELECT name, specialization, description, schedule, email, phone FROM counselors WHERE is_available=1 ORDER BY id LIMIT 1"))[0]
    : null;

  return (
    <>
      <h1>Wellness Check</h1>
      <p className="muted">10 gentle questions, about 2 minutes. This is not a diagnosis, just a snapshot to help you notice patterns.</p>
      {searchParams?.error && <div className="notice notice-error" style={{ marginTop: 10 }}>{searchParams.error}</div>}
      {(searchParams?.saved || result) && <div className="notice notice-success" style={{ marginTop: 10 }}>Wellness check saved.</div>}
      {result && (
        <div className="card" style={{ marginTop: 16, borderColor: "#c7d7f7", background: "#eef4ff" }}>
          <h2>Your result: <span className={`badge ${badgeClass(result.overall)}`}>{riskLabel(result.overall)}</span> ({result.total}/{result.max})</h2>
          <p style={{ marginTop: 8 }}>{result.summary}</p>
          {result.weak?.length > 0 && <p className="muted" style={{ marginTop: 8 }}>Areas that may need support: <strong>{result.weak.join(", ")}</strong></p>}
          <div style={{ marginTop: 10 }}><strong style={{ fontSize: 14 }}>Suggested next steps:</strong>
            <ul style={{ marginLeft: 18, fontSize: 14, marginTop: 6 }}>{result.suggested.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
          {counselor && <div className="notice notice-error" style={{ marginTop: 16, marginBottom: 0 }}>
            <strong>Support is available now</strong>
            <p style={{ marginTop: 4 }}>Please consider reaching out to {counselor.name}. They can help you make a safe plan and talk through what you are experiencing.</p>
            <p style={{ marginTop: 6 }}><strong>{counselor.specialization}</strong><br />
              {counselor.email && <>Email: <a href={`mailto:${counselor.email}`}>{counselor.email}</a><br /></>}
              {counselor.phone && <>Phone: <a href={`tel:${counselor.phone}`}>{counselor.phone}</a></>}<br />
              <span style={{ fontSize: 12 }}>Available: {counselor.schedule}</span>
            </p>
            <a href="/counseling" className="btn btn-secondary btn-small" style={{ marginTop: 8 }}>Request an appointment</a>
          </div>}
        </div>
      )}
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h2>Answer each question honestly</h2>
          <form action={submitCheck}>
            {QUESTIONS.map((q, i) => (
              <div key={i} style={{ marginBottom: 14, padding: 12, border: "1px solid #e5e7eb", borderRadius: 10, background: "#fcfcfd" }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{i + 1}. {q.text} <span className="muted" style={{ fontWeight: 400 }}>({q.area})</span></div>
                <div className="option-group">
                  {OPTIONS.map((opt) => (
                    <label key={opt.value}><input type="radio" name={`answers_${i}`} value={opt.value} required /> {opt.label}</label>
                  ))}
                </div>
              </div>
            ))}
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Submit check-in</button>
            <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Your answers are private and used only to give you supportive feedback.</p>
          </form>
        </div>
        <div>
          <div className="card">
            <h2>Your history</h2>
            {history.length ? (
              <table><tbody>
                <tr><th>Date</th><th>Result</th><th>Score</th></tr>
                {history.map((r) => {
                  let score = 0;
                  try { score = (JSON.parse(r.answers) || []).reduce((a, x) => a + (x.value || 0), 0); } catch {}
                  return (
                    <tr key={r.id}>
                      <td>{new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                       <td><span className={`badge ${badgeClass(r.overall_level)}`}>{riskLabel(r.overall_level)}</span></td>
                      <td>{score}/30</td>
                    </tr>
                  );
                })}
              </tbody></table>
            ) : <p className="muted">No history yet. Take your first check-in on the left.</p>}
          </div>
          <div className="card" style={{ marginTop: 12 }}>
            <h3>What happens after?</h3>
            <p className="muted">You will see areas that may need support and simple actions like breathing exercises, study planners, or reaching out to a counselor. You can also talk to Kalinga AI any time.</p>
            <div style={{ marginTop: 10 }}><a href="/ai-chat" className="btn btn-secondary btn-small">Talk to Kalinga AI</a></div>
          </div>
        </div>
      </div>
    </>
  );
}
