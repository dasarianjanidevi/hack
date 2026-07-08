"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Student {
  student_id: string;
  name: string;
  batch: string;
  attendance_pct: string;
}

const BATCHES = ["Batch-A", "Batch-B", "Batch-C", "Batch-D"];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState({
    student_id: "",
    name: "",
    batch: "Batch-A",
    attendance_pct: "",
  });

  const fetchStudents = () => {
    setFetching(true);
    fetch(`${API_BASE}/api/students`)
      .then((r) => r.json())
      .then((d) => setStudents(d.students || []))
      .catch(() => setStudents([]))
      .finally(() => setFetching(false));
  };

  useEffect(() => { fetchStudents(); }, []);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.student_id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.batch.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!form.student_id.trim() || !form.name.trim() || !form.attendance_pct) {
      setSubmitError("Please fill in all required fields.");
      return;
    }
    const att = parseInt(form.attendance_pct);
    if (isNaN(att) || att < 0 || att > 100) {
      setSubmitError("Attendance must be a number between 0 and 100.");
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: form.student_id.trim().toUpperCase(),
          name: form.name.trim(),
          batch: form.batch,
          attendance_pct: att,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.detail || "Failed to create student.");
      } else {
        setSubmitSuccess(`✅ Student "${data.student.name}" (${data.student.student_id}) added successfully!`);
        setForm({ student_id: "", name: "", batch: "Batch-A", attendance_pct: "" });
        fetchStudents();
      }
    } catch {
      setSubmitError("Network error — is the backend running?");
    } finally {
      setSubmitLoading(false);
    }
  };

  const attendanceColor = (pct: string) => {
    const n = parseInt(pct);
    if (n < 65) return "#ef4444";
    if (n < 75) return "#f59e0b";
    return "#10b981";
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px",
    borderRadius: 10, background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.88)", fontSize: 14,
    outline: "none", transition: "border-color 0.2s ease",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 600,
    color: "rgba(255,255,255,0.4)", letterSpacing: "0.07em",
    textTransform: "uppercase", marginBottom: 7,
  };

  return (
    <div className="mesh-bg min-h-screen flex flex-col">

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 40px", borderBottom: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50,
        background: "rgba(5,8,15,0.88)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 6,
            color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 500,
            textDecoration: "none", transition: "color 0.2s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg,#3b82f6,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "white",
            }}>E</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.02em" }}>
              EduOS <span style={{ color: "#3b82f6" }}>AI</span>
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="badge badge-green">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
            Student Management
          </span>
        </div>
      </nav>

      <main style={{ flex: 1, maxWidth: 1100, width: "100%", margin: "0 auto", padding: "48px 24px" }}>

        {/* Page heading */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "rgba(255,255,255,0.92)", marginBottom: 8 }}>
            Student Management
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>
            Add new students manually or search existing students by roll number, name, or batch.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 28, alignItems: "start" }}>

          {/* ── Add Student Form ────────────────────────────────────── */}
          <div className="glass-premium" style={{ padding: 32 }}>
            {/* Header */}
            <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>➕</span>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em" }}>
                  Add New Student
                </h2>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                Data is saved to the backend and immediately available in the pipeline selector.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Roll Number */}
              <div>
                <label style={labelStyle} htmlFor="inp-student-id">
                  Roll Number (Student ID) <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  id="inp-student-id"
                  type="text"
                  placeholder="e.g. S061"
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 5 }}>
                  Must be unique. Will be auto-uppercased (e.g. s061 → S061)
                </p>
              </div>

              {/* Name */}
              <div>
                <label style={labelStyle} htmlFor="inp-name">
                  Full Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  id="inp-name"
                  type="text"
                  placeholder="e.g. Riya Chakraborty"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>

              {/* Batch */}
              <div>
                <label style={labelStyle} htmlFor="inp-batch">Batch</label>
                <div style={{ position: "relative" }}>
                  <select
                    id="inp-batch"
                    value={form.batch}
                    onChange={(e) => setForm({ ...form, batch: e.target.value })}
                    style={{ ...inputStyle, appearance: "none", paddingRight: 36, cursor: "pointer" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  >
                    {BATCHES.map((b) => (
                      <option key={b} value={b} style={{ background: "#0a0f1a" }}>{b}</option>
                    ))}
                  </select>
                  <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                    width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Attendance */}
              <div>
                <label style={labelStyle} htmlFor="inp-attendance">
                  Attendance % <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  id="inp-attendance"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0 – 100"
                  value={form.attendance_pct}
                  onChange={(e) => setForm({ ...form, attendance_pct: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                {form.attendance_pct && (
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 99, transition: "width 0.3s ease",
                        width: `${Math.min(100, Math.max(0, parseInt(form.attendance_pct) || 0))}%`,
                        background: attendanceColor(form.attendance_pct),
                      }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: attendanceColor(form.attendance_pct) }}>
                      {parseInt(form.attendance_pct) < 65 ? "At Risk" : parseInt(form.attendance_pct) < 75 ? "Below 75%" : "Good"}
                    </span>
                  </div>
                )}
              </div>

              {/* Feedback */}
              {submitError && (
                <div style={{
                  padding: "11px 14px", borderRadius: 10, fontSize: 13,
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                  color: "#fca5a5",
                }}>
                  ⚠ {submitError}
                </div>
              )}
              {submitSuccess && (
                <div style={{
                  padding: "11px 14px", borderRadius: 10, fontSize: 13,
                  background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
                  color: "#6ee7b7",
                }}>
                  {submitSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={submitLoading}
                className="btn-primary"
                style={{ width: "100%", padding: "13px 24px", fontSize: 14, marginTop: 4 }}
              >
                {submitLoading ? (
                  <>
                    <svg className="animate-spin-ring" width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" />
                    </svg>
                    Saving...
                  </>
                ) : "➕ Add Student"}
              </button>
            </form>
          </div>

          {/* ── Student Directory ──────────────────────────────────────── */}
          <div className="glass-premium" style={{ padding: 32 }}>
            {/* Header + search */}
            <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em", marginBottom: 3 }}>
                    Student Directory
                  </h2>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                    {students.length} students enrolled
                  </p>
                </div>
                <span className="badge badge-blue">
                  {filteredStudents.length} shown
                </span>
              </div>

              {/* Search */}
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.3)", fontSize: 14, pointerEvents: "none",
                }}>🔍</div>
                <input
                  id="directory-search"
                  type="text"
                  placeholder="Search by Roll No, name, or batch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingLeft: 36,
                    fontSize: 13,
                    paddingRight: searchQuery ? 36 : 14,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.08)", border: "none",
                    color: "rgba(255,255,255,0.5)", cursor: "pointer",
                    width: 22, height: 22, borderRadius: "50%", fontSize: 11,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>✕</button>
                )}
              </div>
            </div>

            {/* Table */}
            {fetching ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 52 }} />
                ))}
              </div>
            ) : filteredStudents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>
                  {searchQuery ? `No students match "${searchQuery}"` : "No students found"}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0, maxHeight: 520, overflowY: "auto" }}>
                {/* Table header */}
                <div style={{
                  display: "grid", gridTemplateColumns: "90px 1fr 90px 90px 80px",
                  gap: 12, padding: "8px 14px",
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  marginBottom: 4,
                }}>
                  <span>Roll No</span>
                  <span>Name</span>
                  <span>Batch</span>
                  <span style={{ textAlign: "center" }}>Attendance</span>
                  <span style={{ textAlign: "right" }}>Action</span>
                </div>

                {filteredStudents.map((s, i) => (
                  <div
                    key={s.student_id}
                    style={{
                      display: "grid", gridTemplateColumns: "90px 1fr 90px 90px 80px",
                      gap: 12, padding: "12px 14px",
                      borderRadius: 10, alignItems: "center",
                      background: i % 2 === 0 ? "rgba(255,255,255,0.012)" : "transparent",
                      border: "1px solid transparent",
                      transition: "background 0.15s, border-color 0.15s",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = i % 2 === 0 ? "rgba(255,255,255,0.012)" : "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                  >
                    {/* Roll No */}
                    <span style={{
                      fontFamily: "monospace", fontSize: 12, fontWeight: 700,
                      color: "#60a5fa",
                      background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.18)",
                      padding: "3px 8px", borderRadius: 6, display: "inline-block",
                    }}>
                      {s.student_id}
                    </span>

                    {/* Name */}
                    <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.82)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.name}
                    </span>

                    {/* Batch */}
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)",
                      background: "rgba(255,255,255,0.05)", padding: "3px 8px",
                      borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)",
                    }}>
                      {s.batch}
                    </span>

                    {/* Attendance */}
                    <span style={{
                      fontSize: 13, fontWeight: 700, textAlign: "center",
                      color: attendanceColor(s.attendance_pct),
                    }}>
                      {s.attendance_pct}%
                    </span>

                    {/* Action */}
                    <div style={{ textAlign: "right" }}>
                      <Link
                        href={`/?student=${encodeURIComponent(s.name)}`}
                        style={{
                          fontSize: 11, fontWeight: 600, color: "#60a5fa",
                          textDecoration: "none", padding: "4px 10px",
                          borderRadius: 6, background: "rgba(59,130,246,0.08)",
                          border: "1px solid rgba(59,130,246,0.18)",
                          transition: "all 0.15s",
                          display: "inline-block",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.18)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.08)"; }}
                      >
                        Run →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: "20px 40px", borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.18)" }}>
          EduOS AI · Student Management · Powered by RAG + Multi-Agent LLM Pipeline
        </p>
      </footer>
    </div>
  );
}
