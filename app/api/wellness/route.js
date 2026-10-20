// JSON endpoint used by the wellness-check modal (POST /api/wellness).
import { NextResponse } from "next/server";           // helper for building JSON responses
import jwt from "jsonwebtoken";                       // verify the session token
import { cookies } from "next/headers";               // read cookies on the server
import { query } from "../../../lib/db";              // database helper
import { analyzeWellness } from "../../../lib/ai";    // AI/baseline analysis of the answers
import { QUESTIONS } from "../../../lib/wellness";    // the shared question list

// Secret used to verify the signed session cookie.
const SECRET = process.env.JWT_SECRET || "balanga-kalinga-dev-secret-change-me";

// sessionUser — read the session cookie and return the matching user row, or null.
async function sessionUser() {
  const token = cookies().get("bk_session")?.value;   // the signed session token
  if (!token) return null;                            // no cookie -> not logged in
  try {
    const payload = jwt.verify(token, SECRET);                      // validate the token
    const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [payload.uid]); // load the user
    return rows[0] || null;                                         // the row, or null if deleted
  } catch {
    return null;                                                    // invalid/expired token -> not logged in
  }
}

// POST /api/wellness — score a submitted wellness check and store it.
export async function POST(req) {
  const user = await sessionUser();                                              // who is calling?
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 }); // must be signed in
  if (user.role !== "student") {
    // Only students take the check; staff have their own pages.
    return NextResponse.json({ error: "Only student accounts can take the wellness check." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));            // parse the JSON body (tolerate bad input)
  const raw = Array.isArray(body.answers) ? body.answers : []; // the submitted answer values

  // Require exactly one answer per question.
  if (raw.length !== QUESTIONS.length) {
    return NextResponse.json({ error: "Please answer all 10 questions." }, { status: 400 });
  }

  // Normalise every answer to an integer in the 1..5 range.
  const answers = [];
  for (let i = 0; i < QUESTIONS.length; i++) {
    const n = parseInt(raw[i], 10);                           // this answer as a number
    // A missing/invalid answer -> reject the whole submission.
    if (!Number.isFinite(n)) return NextResponse.json({ error: "Please answer all 10 questions." }, { status: 400 });
    answers.push(Math.min(5, Math.max(1, n)));                // clamp to 1..5
  }

  // Pair each numeric answer with its question area.
  const values = answers.map((value, i) => ({ question: QUESTIONS[i].area, value }));
  const total = answers.reduce((a, b) => a + b, 0);           // raw sum of scores
  const max = QUESTIONS.length * 5;                           // highest possible sum (10 * 5)
  const analysis = await analyzeWellness(values);             // AI/baseline analysis

  // Save the assessment (answers and suggestions stored as JSON text).
  await query(
    "INSERT INTO wellness_assessments (user_id,answers,overall_level,summary,suggested_actions) VALUES (?,?,?,?,?)",
    [user.id, JSON.stringify(values), analysis.riskLevel, analysis.summary, JSON.stringify(analysis.suggestions)]
  );

  // Return everything the modal needs to render the result in place.
  return NextResponse.json({
    overall: analysis.riskLevel,      // low | moderate | high
    total,                            // this check's score
    max,                              // the maximum possible score
    summary: analysis.summary,        // supportive summary text
    weak: analysis.weakAreas,         // areas that may need support
    suggested: analysis.suggestions,  // suggested next steps
  });
}
