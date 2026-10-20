"use client";
// WellnessModal — opens the 10-question wellness check in a dialog, submits it
// to /api/wellness, and shows the result without leaving the current page.
import { useEffect, useState } from "react";            // React hooks
import { useRouter } from "next/navigation";            // lets us refresh server-rendered data after saving
import { QUESTIONS, OPTIONS } from "../lib/wellness";   // the shared question/answer definitions

// badgeClass — pick a badge colour for a risk level.
function badgeClass(level) {
  if (level === "low") return "badge-green";        // low risk -> green
  if (level === "moderate") return "badge-yellow";  // moderate -> yellow
  return "badge-red";                               // high (or unknown) -> red
}

// riskLabel — friendly wording for a risk level.
function riskLabel(level) {
  return level === "low" ? "Low risk" : level === "moderate" ? "Moderate risk" : "High risk";
}

// Props: the trigger's label/classes/style, so the same modal can be used
// from the dashboard and from the wellness history page.
export default function WellnessModal({ label = "Take Wellness Check", className = "btn btn-primary", style }) {
  const router = useRouter();                        // allows router.refresh() after a save
  const [open, setOpen] = useState(false);           // is the dialog visible?
  const [answers, setAnswers] = useState({});        // { questionIndex: value } for answered questions
  const [sending, setSending] = useState(false);     // true while the API call is in flight
  const [error, setError] = useState("");            // validation/server error message
  const [result, setResult] = useState(null);        // the returned analysis, once submitted
  const answered = Object.keys(answers).length;      // how many questions have an answer

  // While the dialog is open: lock background scrolling and close on Escape.
  useEffect(() => {
    if (!open) return;                               // nothing to do while closed
    function onKeyDown(e) {
      if (e.key === "Escape" && !sending) setOpen(false); // Escape closes (unless submitting)
    }
    document.addEventListener("keydown", onKeyDown); // listen for Escape
    const previous = document.body.style.overflow;   // remember the page's scroll setting
    document.body.style.overflow = "hidden";         // stop the page behind from scrolling
    return () => {
      document.removeEventListener("keydown", onKeyDown); // clean up the listener
      document.body.style.overflow = previous;            // restore scrolling
    };
  }, [open, sending]);

  // openModal — reset the form and show the dialog.
  function openModal() {
    setAnswers({});                                  // clear previous answers
    setResult(null);                                 // clear a previous result
    setError("");                                    // clear a previous error
    setOpen(true);                                   // show the dialog
  }

  // closeModal — hide the dialog (but never while a submission is in flight).
  function closeModal() {
    if (sending) return;                             // ignore while saving
    setOpen(false);                                  // hide the dialog
  }

  // submit — send all ten answers and show the result in the same dialog.
  async function submit() {
    // Client-side check: every question must be answered.
    if (answered < QUESTIONS.length) {
      setError("Please answer all 10 questions before submitting.");
      return;
    }
    setSending(true);                                // disable the button / show progress
    setError("");                                    // clear any old error
    try {
      // POST the answers in question order.
      const res = await fetch("/api/wellness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: QUESTIONS.map((_, i) => answers[i]) }),
      });
      const data = await res.json();                 // parse the JSON reply
      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again."); // show the server's message
      } else {
        setResult(data);                             // switch the dialog to the result view
        router.refresh();                            // update the page's server-rendered history/status
      }
    } catch {
      setError("Something went wrong. Please try again."); // network/parse failure
    }
    setSending(false);                               // re-enable the button
  }

  return (
    <>
      {/* The trigger button (label/classes come from the caller). */}
      <button type="button" className={className} style={style} onClick={openModal}>{label}</button>

      {/* The dialog itself: only rendered while open. */}
      {open && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="wellness-modal-title">
            {/* Header: title + close button. */}
            <div className="modal-head">
              <div>
                <h2 id="wellness-modal-title" style={{ margin: 0 }}>{result ? "Your wellness result" : "Wellness Check"}</h2>
                {/* Hide the subtitle once the result is showing. */}
                {!result && <p className="muted" style={{ margin: "4px 0 0" }}>Answer all 10 questions. It takes about two minutes.</p>}
              </div>
              <button type="button" className="modal-close" aria-label="Close" onClick={closeModal}>×</button>
            </div>

            {result ? (
              /* ---------- Result view ---------- */
              <>
                <div className="modal-body">
                  <h3 style={{ marginTop: 0 }}>
                    <span className={`badge ${badgeClass(result.overall)}`}>{riskLabel(result.overall)}</span>
                    <span className="muted" style={{ fontWeight: 400, marginLeft: 8 }}>{result.total}/{result.max}</span>
                  </h3>
                  <p style={{ marginTop: 8 }}>{result.summary}</p>
                  {/* Areas that scored highest, when there are any. */}
                  {result.weak?.length > 0 && (
                    <p className="muted" style={{ marginTop: 8 }}>Areas that may need support: <strong>{result.weak.join(", ")}</strong></p>
                  )}
                  {/* Suggested next steps from the analysis. */}
                  {result.suggested?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <strong style={{ fontSize: 14 }}>Suggested next steps</strong>
                      <ul style={{ marginLeft: 18, fontSize: 14, marginTop: 6 }}>
                        {result.suggested.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {/* High risk -> surface immediate support options. */}
                  {result.overall === "high" && (
                    <div className="notice notice-error" style={{ marginTop: 14, marginBottom: 0 }}>
                      <strong>Support is available now.</strong> Please reach out to the guidance office, or call NCMH 1553 / 911 if you feel unsafe.
                    </div>
                  )}
                </div>
                <div className="modal-foot">
                  <button type="button" className="btn btn-secondary btn-small" onClick={closeModal}>Done</button>
                  <a href="/counseling" className="btn btn-primary btn-small">Request an appointment</a>
                </div>
              </>
            ) : (
              /* ---------- Questionnaire view ---------- */
              <>
                <div className="modal-body">
                  {/* Progress: answered count + bar. */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span className="muted" style={{ fontSize: 12 }}>Answered {answered} of {QUESTIONS.length}</span>
                    <span className="muted" style={{ fontSize: 12 }}>{Math.round((answered / QUESTIONS.length) * 100)}%</span>
                  </div>
                  <div className="progress-track" style={{ marginBottom: 16 }}>
                    <div className="progress-fill" style={{ width: `${(answered / QUESTIONS.length) * 100}%` }} />
                  </div>
                  {/* Validation/server error. */}
                  {error && <div className="notice notice-error">{error}</div>}
                  {/* One card of radio buttons per question. */}
                  {QUESTIONS.map((q, i) => (
                    <div key={i} className={`modal-question${answers[i] ? " modal-question-answered" : ""}`}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{i + 1}. {q.text}</div>
                      <div className="option-group">
                        {/* One radio group per question; checked mirrors the saved answer. */}
                        {OPTIONS.map((opt) => (
                          <label key={opt.value}>
                            <input
                              type="radio"
                              name={`wellness_${i}`}
                              value={opt.value}
                              checked={Number(answers[i]) === opt.value}
                              onChange={() => setAnswers((a) => ({ ...a, [i]: opt.value }))}
                            /> {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="modal-foot">
                  <span className="muted" style={{ fontSize: 12 }}>
                    {answered < QUESTIONS.length ? "Answer every question to submit." : "All set — submit when ready."}
                  </span>
                  <button type="button" className="btn btn-primary" onClick={submit} disabled={sending}>
                    {sending ? "Analyzing..." : "Submit check-in"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
