import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { query } from "../../lib/db";
import { requireStudent } from "../../lib/auth";

export default async function SafetyPlanPage({ searchParams }) {
  const user = await requireStudent();
  async function savePlan(formData) {
    "use server";
    const { query: q } = await import("../../lib/db");
    const { getSessionUserId } = await import("../../lib/auth");
    const { redirect: red } = await import("next/navigation");
    const uid = getSessionUserId();
    if (!uid) red("/login");
    const values = ["warning_signs", "coping_steps", "trusted_contacts", "professional_contacts"].map((name) => (formData.get(name) || "").toString().trim());
    if (values.some((value) => !value)) red("/safety-plan?error=" + encodeURIComponent("Please complete each section of your plan."));
    await q("INSERT INTO safety_plans (user_id,warning_signs,coping_steps,trusted_contacts,professional_contacts) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE warning_signs=VALUES(warning_signs), coping_steps=VALUES(coping_steps), trusted_contacts=VALUES(trusted_contacts), professional_contacts=VALUES(professional_contacts)", [uid, ...values]);
    revalidatePath("/safety-plan");
    red("/safety-plan?saved=1");
  }
  const rows = await query("SELECT * FROM safety_plans WHERE user_id=? LIMIT 1", [user.id]);
  const plan = rows[0] || {};
  const resources = await query("SELECT name, phone, description FROM emergency_resources ORDER BY id LIMIT 4");
  return (
    <>
      <div className="page-heading"><div className="eyebrow">Private student resource</div><h1 style={{ marginTop: 4 }}>Personal safety plan</h1><p className="muted" style={{ marginTop: 5 }}>Write down what may help if your wellbeing becomes difficult. You can update this plan at any time.</p></div>
      {searchParams?.error && <div className="notice notice-error">{searchParams.error}</div>}
      {searchParams?.saved && <div className="notice notice-success">Your safety plan was saved.</div>}
      <div className="notice notice-info"><strong>Important:</strong> This plan is for preparation and is not monitored in real time. If you may be in immediate danger, call emergency services or reach a trusted person now.</div>
      <div className="grid grid-2">
        <form action={savePlan} className="card">
          <div className="form-group"><label htmlFor="warning_signs">Warning signs I may need support</label><textarea id="warning_signs" name="warning_signs" defaultValue={plan.warning_signs || ""} required placeholder="For example: I stop sleeping, isolate myself, or feel unable to cope." /></div>
          <div className="form-group"><label htmlFor="coping_steps">Things I can try first</label><textarea id="coping_steps" name="coping_steps" defaultValue={plan.coping_steps || ""} required placeholder="For example: breathing exercise, short walk, quiet place, or contacting someone." /></div>
          <div className="form-group"><label htmlFor="trusted_contacts">People I can contact</label><textarea id="trusted_contacts" name="trusted_contacts" defaultValue={plan.trusted_contacts || ""} required placeholder="Names and phone numbers of trusted friends, family, or classmates." /></div>
          <div className="form-group"><label htmlFor="professional_contacts">Professional or campus support</label><textarea id="professional_contacts" name="professional_contacts" defaultValue={plan.professional_contacts || ""} required placeholder="Counselor, guidance office, clinic, or other support contact." /></div>
          <button type="submit" className="btn btn-primary">Save safety plan</button>
        </form>
        <aside>
          <div className="card"><h2>Support contacts</h2>{resources.map((resource) => <div className="status-row" key={resource.name}><div><strong>{resource.name}</strong><span className="muted">{resource.description}</span></div><a href={`tel:${resource.phone}`} className="btn btn-secondary btn-small">{resource.phone}</a></div>)}</div>
          <div className="card"><h2>Need a counselor?</h2><p className="muted">You can request a private appointment with a Balanga Kalinga counselor.</p><a href="/counseling" className="btn btn-secondary btn-small" style={{ marginTop: 10 }}>Book counseling</a></div>
        </aside>
      </div>
    </>
  );
}
