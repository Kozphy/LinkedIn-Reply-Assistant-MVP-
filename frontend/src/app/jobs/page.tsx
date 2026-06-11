"use client";

import { useCallback, useEffect, useState } from "react";
import { api, Job } from "@/lib/api";

const STATUSES = ["saved", "applied", "interviewing", "offer", "rejected", "archived"];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company: "",
    url: "",
    location: "",
    description: "",
    status: "saved",
    next_action: "",
    user_skills: "",
  });
  const [fitPreview, setFitPreview] = useState<{
    fit_score: number;
    missing_skills: string[];
    matched_skills: string[];
  } | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setJobs(await api.getJobs());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handlePreviewFit() {
    if (!form.description.trim() || !form.user_skills.trim()) return;
    const skills = form.user_skills.split(",").map((s) => s.trim()).filter(Boolean);
    const result = await api.computeFitScore(form.description, skills);
    setFitPreview(result);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const skills = form.user_skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await api.createJob({
        title: form.title,
        company: form.company,
        url: form.url || undefined,
        location: form.location || undefined,
        description: form.description || undefined,
        status: form.status,
        next_action: form.next_action || undefined,
        user_skills: skills.length ? skills : undefined,
      });
      setShowForm(false);
      setForm({
        title: "",
        company: "",
        url: "",
        location: "",
        description: "",
        status: "saved",
        next_action: "",
        user_skills: "",
      });
      setFitPreview(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Jobs</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Job"}
        </button>
      </div>

      {showForm && (
        <form className="card" onSubmit={handleSubmit}>
          <h3>New Job Opportunity</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Company *</label>
              <input
                required
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>URL</label>
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Job Description (paste from posting)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ minHeight: 140 }}
            />
          </div>
          <div className="form-group">
            <label>Your Skills (comma-separated)</label>
            <input
              value={form.user_skills}
              onChange={(e) => setForm({ ...form, user_skills: e.target.value })}
              placeholder="python, sql, risk management, aws"
            />
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePreviewFit}
            style={{ marginBottom: "1rem" }}
          >
            Preview Fit Score
          </button>
          {fitPreview && (
            <div className="card" style={{ background: "#f8fafc" }}>
              <strong>Fit Score: {fitPreview.fit_score}%</strong>
              <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
                Matched: {fitPreview.matched_skills.join(", ") || "none"}
              </p>
              <p style={{ fontSize: "0.85rem" }}>
                Missing: {fitPreview.missing_skills.join(", ") || "none"}
              </p>
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Next Action</label>
              <input
                value={form.next_action}
                onChange={(e) =>
                  setForm({ ...form, next_action: e.target.value })
                }
              />
            </div>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary">
            Save Job
          </button>
        </form>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Company</th>
              <th>Location</th>
              <th>Fit Score</th>
              <th>Missing Skills</th>
              <th>Status</th>
              <th>Next Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td>
                  <strong>{j.title}</strong>
                  {j.url && (
                    <div>
                      <a href={j.url} target="_blank" rel="noreferrer">
                        View posting
                      </a>
                    </div>
                  )}
                </td>
                <td>{j.company}</td>
                <td>{j.location || "—"}</td>
                <td>
                  {j.fit_score != null ? (
                    <span
                      className={`badge badge-${j.fit_score >= 70 ? "high" : "medium"}`}
                    >
                      {j.fit_score}%
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td style={{ fontSize: "0.85rem" }}>{j.missing_skills || "—"}</td>
                <td>
                  <span className="badge">{j.status}</span>
                </td>
                <td style={{ fontSize: "0.85rem" }}>{j.next_action || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
