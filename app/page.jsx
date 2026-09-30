// Port of index.php
import Link from "next/link";
import { currentUser } from "../lib/auth";

export default async function HomePage() {
  const user = await currentUser().catch(() => null);
  const isAdmin = user?.role === "admin";
  return (
    <>
      <div className="hero">
        <div className="eyebrow">Balanga Kalinga · BPSU student support</div>
        <h1 style={{ marginTop: 5 }}>Student wellness services</h1>
        <p>Use this portal to complete a wellness check, record your mood, request counseling, and find support when student life feels difficult.</p>
        <div className="hero-actions">
          {user ? (
            <>
              <Link href={isAdmin ? "/admin" : "/dashboard"} className="btn btn-primary">Go to dashboard</Link>
              {!isAdmin && <Link href="/ai-chat" className="btn btn-secondary">Talk to Kalinga AI</Link>}
            </>
          ) : (
            <>
              <Link href="/register" className="btn btn-primary">Create student account</Link>
              <Link href="/login" className="btn btn-secondary">Student login</Link>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-3" style={{ marginTop: 24 }}>
        <div className="card"><div className="eyebrow">Assessment</div><h3 style={{ marginTop: 5 }}>Wellness Check</h3><p className="muted">Ten questions about stress, sleep, mood, and coping. Takes about two minutes.</p><div style={{ marginTop: 12 }}><Link href={user ? "/wellness" : "/login"} className="btn btn-secondary btn-small">Take wellness check</Link></div></div>
        <div className="card"><div className="eyebrow">Information and support</div><h3 style={{ marginTop: 5 }}>Kalinga AI</h3><p className="muted">Get supportive information about common student concerns. AI responses are not professional counseling.</p><div style={{ marginTop: 12 }}><Link href={user ? "/ai-chat" : "/login"} className="btn btn-secondary btn-small">Open Kalinga AI</Link></div></div>
        <div className="card"><div className="eyebrow">Human support</div><h3 style={{ marginTop: 5 }}>Counseling office</h3><p className="muted">Review counselor availability and request an appointment for a date and time that works for you.</p><div style={{ marginTop: 12 }}><Link href={user ? "/counseling" : "/login"} className="btn btn-secondary btn-small">View counseling</Link></div></div>
      </div>
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card"><h3>How it helps</h3><ul style={{ marginLeft: 18, color: "#475467", fontSize: 14, lineHeight: 1.8 }}><li>Track mood daily with a quick note</li><li>Wellness trends you can see over time</li><li>Private AI chat with safety guidance</li></ul></div>
        <div className="card"><h3>Safe and private</h3><p className="muted">Your AI chats are private to you. Counselors only see appointments you request. Admins see only anonymous trends. If you use words that suggest immediate danger, Kalinga AI will gently guide you to human help.</p><p className="muted" style={{ marginTop: 10 }}><strong>Not a medical service.</strong> This platform supports wellness and does not diagnose or prescribe.</p></div>
      </div>
      <div className="card" style={{ marginTop: 16, background: "#eef4ff", borderColor: "#c7d7f7" }}><h3>Try the demo</h3><p className="muted">Student: alex@balanga.edu.ph / student123 &nbsp; | &nbsp; Admin: admin@kalinga.edu.ph / admin123</p></div>
    </>
  );
}
