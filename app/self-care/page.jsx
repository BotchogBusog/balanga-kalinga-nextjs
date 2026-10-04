import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { query } from "../../lib/db";
import { requireStudent } from "../../lib/auth";

export default async function SelfCarePage() {
  const user = await requireStudent();

  async function logActivity(formData) {
    "use server";
    const { query: q } = await import("../../lib/db");
    const { getSessionUserId } = await import("../../lib/auth");
    const { redirect: red } = await import("next/navigation");
    const uid = getSessionUserId();
    const activityId = Number(formData.get("activity_id"));
    if (!uid || !activityId) red("/login");
    await q("INSERT INTO activity_logs (user_id, activity_id) SELECT ?, id FROM self_care_activities WHERE id=?", [uid, activityId]);
    revalidatePath("/self-care");
    red("/self-care?saved=1");
  }

  const activities = await query("SELECT * FROM self_care_activities ORDER BY category, id");
  const completed = await query("SELECT l.created_at, a.title FROM activity_logs l JOIN self_care_activities a ON a.id=l.activity_id WHERE l.user_id=? ORDER BY l.created_at DESC LIMIT 5", [user.id]);
  return (
    <>
      <div className="page-heading"><div className="eyebrow">Practical support</div><h1 style={{ marginTop: 4 }}>Self-care activities</h1><p className="muted" style={{ marginTop: 5 }}>Short activities for stress, focus, sleep, and emotional wellbeing. Choose what feels manageable today.</p></div>
      <div className="grid grid-2">
        <section>
          {activities.map((activity) => (
            <article className="card" key={activity.id}>
              <div className="eyebrow">{activity.category} · {activity.duration_min} minutes</div>
              <h2 style={{ marginTop: 5 }}>{activity.title}</h2>
              <p className="muted">{activity.description}</p>
              <details style={{ marginTop: 10 }}>
                <summary style={{ color: "#174b84", cursor: "pointer", fontWeight: 600 }}>View instructions</summary>
                <p style={{ whiteSpace: "pre-line", marginTop: 10, fontSize: 13 }}>{activity.instructions}</p>
                <form action={logActivity} style={{ marginTop: 12 }}><input type="hidden" name="activity_id" value={activity.id} /><button className="btn btn-secondary btn-small" type="submit">Mark as completed</button></form>
              </details>
            </article>
          ))}
        </section>
        <aside>
          <div className="card card-accent"><h2>When to use this page</h2><p className="muted">These activities can support everyday wellbeing. They do not replace counseling or emergency help.</p><a href="/safety-plan" className="btn btn-primary btn-small" style={{ marginTop: 12 }}>Create a personal safety plan</a></div>
          <div className="card"><div className="eyebrow">Recent activity</div><h2 style={{ marginTop: 5 }}>Completed activities</h2>{completed.length ? completed.map((item, i) => <div className="status-row" key={i}><strong>{item.title}</strong><span className="muted">{new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></div>) : <p className="muted">No activities recorded yet.</p>}</div>
        </aside>
      </div>
    </>
  );
}
