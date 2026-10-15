"use client";

export default function PrintReportButton() {
  return <button type="button" className="btn btn-secondary" onClick={() => window.print()}>Print report</button>;
}
