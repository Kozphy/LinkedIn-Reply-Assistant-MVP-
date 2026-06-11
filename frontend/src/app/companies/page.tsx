"use client";

import { useCallback, useEffect, useState } from "react";
import { api, Company } from "@/lib/api";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState({
    name: "",
    industry: "",
    country: "",
    target_roles: "",
    career_value: "medium",
    notes: "",
  });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setCompanies(await api.getCompanies());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setForm({
      name: "",
      industry: "",
      country: "",
      target_roles: "",
      career_value: "medium",
      notes: "",
    });
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(c: Company) {
    setEditing(c);
    setForm({
      name: c.name,
      industry: c.industry || "",
      country: c.country || "",
      target_roles: c.target_roles || "",
      career_value: c.career_value || "medium",
      notes: c.notes || "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await api.updateCompany(editing.id, form);
      } else {
        await api.createCompany(form);
      }
      resetForm();
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this company?")) return;
    await api.deleteCompany(id);
    load();
  }

  return (
    <div>
      <div className="page-header">
        <h2>Companies</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Add Company
        </button>
      </div>

      {showForm && (
        <form className="card" onSubmit={handleSubmit}>
          <h3>{editing ? "Edit Company" : "New Company"}</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Industry</label>
              <input
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Country</label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Career Value</label>
              <select
                value={form.career_value}
                onChange={(e) =>
                  setForm({ ...form, career_value: e.target.value })
                }
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Target Roles</label>
            <textarea
              value={form.target_roles}
              onChange={(e) =>
                setForm({ ...form, target_roles: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary">
            Save
          </button>{" "}
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            Cancel
          </button>
        </form>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Industry</th>
              <th>Country</th>
              <th>Target Roles</th>
              <th>Value</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.name}</strong>
                  {c.notes && (
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                      {c.notes.slice(0, 80)}
                    </div>
                  )}
                </td>
                <td>{c.industry || "—"}</td>
                <td>{c.country || "—"}</td>
                <td>{c.target_roles?.slice(0, 50) || "—"}</td>
                <td>
                  <span
                    className={`badge badge-${c.career_value === "high" ? "high" : "medium"}`}
                  >
                    {c.career_value || "—"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-secondary"
                    style={{ marginRight: "0.5rem" }}
                    onClick={() => startEdit(c)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(c.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
