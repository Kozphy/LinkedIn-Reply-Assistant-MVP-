"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, Contact } from "@/lib/api";

const STATUSES = ["new", "contacted", "replied", "follow_up_due", "archived"];
const RELATIONSHIPS = ["cold", "warm", "strong", "referrer"];
const SOURCES = [
  "manual",
  "user_confirmed",
  "public_company_site",
  "referral",
  "event",
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    company: "",
    status: "",
    relationship_level: "",
  });
  const [form, setForm] = useState({
    name: "",
    linkedin_url: "",
    current_title: "",
    company: "",
    location: "",
    relationship_level: "cold",
    status: "new",
    source: "manual",
    notes: "",
  });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.company) params.company = filters.company;
      if (filters.status) params.status = filters.status;
      if (filters.relationship_level)
        params.relationship_level = filters.relationship_level;
      setContacts(await api.getContacts(params));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.createContact(form);
      setShowForm(false);
      setForm({
        name: "",
        linkedin_url: "",
        current_title: "",
        company: "",
        location: "",
        relationship_level: "cold",
        status: "new",
        source: "manual",
        notes: "",
      });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Contacts</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Contact"}
        </button>
      </div>

      <div className="filters">
        <input
          placeholder="Filter by company"
          value={filters.company}
          onChange={(e) => setFilters({ ...filters, company: e.target.value })}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filters.relationship_level}
          onChange={(e) =>
            setFilters({ ...filters, relationship_level: e.target.value })
          }
        >
          <option value="">All relationships</option>
          {RELATIONSHIPS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <form className="card" onSubmit={handleCreate}>
          <h3>New Contact</h3>
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
              <label>Source *</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Title</label>
              <input
                value={form.current_title}
                onChange={(e) =>
                  setForm({ ...form, current_title: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>LinkedIn URL (manually entered)</label>
            <input
              value={form.linkedin_url}
              onChange={(e) =>
                setForm({ ...form, linkedin_url: e.target.value })
              }
              placeholder="https://www.linkedin.com/in/..."
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Relationship</label>
              <select
                value={form.relationship_level}
                onChange={(e) =>
                  setForm({ ...form, relationship_level: e.target.value })
                }
              >
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
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
            Save Contact
          </button>
        </form>
      )}

      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : contacts.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No contacts found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Title</th>
                <th>Status</th>
                <th>Relationship</th>
                <th>Source</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.company || "—"}</td>
                  <td>{c.current_title || "—"}</td>
                  <td>
                    <span className="badge">{c.status}</span>
                  </td>
                  <td>{c.relationship_level}</td>
                  <td>{c.source}</td>
                  <td>
                    <Link href={`/contacts/${c.id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
