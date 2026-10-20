// Port of wellness.php — wellness check history and the modal check-in entry point.
import { query } from "../../lib/db";              // database helper
import { requireStudent } from "../../lib/auth";   // students only
import WellnessModal from "../../components/WellnessModal"; // the 10-question check-in dialog

// badgeClass — badge colour for a result level (supports legacy labels too).
function badgeClass(level) {
  if (level === "low" || level === "Doing Well") return "badge-green";
  if (level === "moderate" || level === "Balanced") return "badge-yellow";
  if (level === "Needs Attention") return "badge-orange";
  return "badge-red";   // high or unknown -> red
}

// riskLabel — friendly wording for a result level.
function riskLabel(level) {
  return level === "low" ? "Low risk" : level === "moderate" ? "Moderate risk" : "High risk";
}

// Server component: the check-in modal, the history table, and support links.
export default async function WellnessPage({ searchParams }) {
  const user = await requireStudent();   // logged-in student

  // Server Action: delete all of this student's wellness records.
  async function clearHistory() {
    "use server";
    const { query: q } = await import("../../lib/db");
    const { getSessionUserId } = await import("../../lib/auth");
    const { revalidatePath: rev } = await import("next/cache");
    const { redirect: red } = await import("next/navigation");
    const uid = getSessionUserId();
    if (!uid) red("/login");
    await q("DELETE FROM wellness_assessments WHERE user_id=?", [uid]);   // only this user's rows
    rev("/wellness");
    red("/wellness?cleared=1");
  }

  // The student's last 10 check-ins, newest first.
  const history = await query("SELECT * FROM wellness_assessments WHERE user_id=? ORDER BY created_at DESC LIMIT 10", [user.id]);

  return (
    <>
      <h1>Wellness Check</h1>
      <p className="muted">The following questions ask about your feelings and experiences over the past four weeks. The check-in opens in a window over this page and takes about two minutes.</p>
      {searchParams?.cleared && <div className="notice notice-success" style={{ marginTop: 10 }}>Your wellness history has been cleared.</div>}
      {/* Two columns: the check-in trigger, and the history. */}
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h2>Start a check-in</h2>
          <p className="muted">Answer all 10 questions and choose the option that best describes how often you experienced each situation.</p>
          {/* Opens the questionnaire dialog; the result appears in the same dialog. */}
          <WellnessModal style={{ marginTop: 14 }} />
          <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>Your answers are private and used only to give you supportive feedback.</p>
          <div className="notice notice-info" style={{ marginTop: 16, marginBottom: 0 }}>
            <strong>What happens after?</strong>
            <p style={{ marginTop: 4 }}>You will see areas that may need support and simple actions like breathing exercises, a study planner, or reaching out to a counselor.</p>
            <div style={{ marginTop: 8 }}><a href="/ai-chat" className="btn btn-secondary btn-small">Talk to Kalinga AI</a></div>
          </div>
        </div>
        <div className="card">
          <h2>Your history</h2>
          {/* History table, or an empty state when there is none. */}
          {history.length ? (
            <table><tbody>
              <tr><th>Date</th><th>Result</th><th>Score</th></tr>
              {history.map((r) => {
                let score = 0;              // sum of this row's stored answers
                const maxScore = 50;        // maximum possible score (10 questions * 5)
                // Recompute the score from the stored JSON answers.
                try { const values = JSON.parse(r.answers) || []; score = values.reduce((a, x) => a + (x.value || 0), 0); } catch {}
                return (
                  <tr key={r.id}>
                    <td>{new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td><span className={`badge ${badgeClass(r.overall_level)}`}>{riskLabel(r.overall_level)}</span></td>
                    <td>{score}/{maxScore}</td>
                  </tr>
                );
              })}
            </tbody></table>
          ) : <p className="muted">No history yet. Start your first check-in on the left.</p>}
          {/* Destructive action: clear all history (disabled when empty). */}
          <form action={clearHistory} style={{ marginTop: 14 }}>
            <button type="submit" className="btn btn-secondary btn-small" disabled={!history.length} style={{ color: "#b42318", borderColor: "#e4b6b1", opacity: history.length ? 1 : 0.55, cursor: history.length ? "pointer" : "not-allowed" }}>Clear all history</button>
            <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>{history.length ? "This permanently removes all of your wellness-check records." : "No wellness history to clear yet."}</p>
          </form>
        </div>
      </div>
    </>
  );
}
