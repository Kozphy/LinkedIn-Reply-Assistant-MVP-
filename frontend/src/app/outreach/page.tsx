"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, Contact, OutreachMessage } from "@/lib/api";

export default function OutreachPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<OutreachMessage[]>([]);
  const [form, setForm] = useState({
    contact_id: "",
    goal: "learn about your team's work",
    tone: "professional",
    user_background: "",
    has_personal_connection: false,
  });
  const [generated, setGenerated] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [c, m] = await Promise.all([
        api.getContacts(),
        api.getOutreachMessages(),
      ]);
      setContacts(c);
      setMessages(m);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setGenerated("");
    try {
      const msg = await api.generateOutreach({
        contact_id: Number(form.contact_id),
        goal: form.goal,
        tone: form.tone,
        user_background: form.user_background,
        has_personal_connection: form.has_personal_connection,
      });
      setGenerated(msg.generated_message);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    }
  }

  const contactMap = Object.fromEntries(contacts.map((c) => [c.id, c.name]));

  return (
    <div>
      <div className="page-header">
        <h2>Outreach Generator</h2>
      </div>

      <div className="card">
        <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: "1rem" }}>
          Generates LinkedIn-safe messages without spammy language. Does not claim
          a personal connection unless you confirm one exists.
        </p>
        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label>Contact *</label>
            <select
              required
              value={form.contact_id}
              onChange={(e) =>
                setForm({ ...form, contact_id: e.target.value })
              }
            >
              <option value="">Select a contact</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Your Background *</label>
            <textarea
              required
              value={form.user_background}
              onChange={(e) =>
                setForm({ ...form, user_background: e.target.value })
              }
              placeholder="I am a risk consultant with experience in Python, SQL, and compliance..."
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Goal</label>
              <input
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Tone</label>
              <select
                value={form.tone}
                onChange={(e) => setForm({ ...form, tone: e.target.value })}
              >
                <option value="professional">Professional</option>
                <option value="warm">Warm</option>
                <option value="curious">Curious</option>
                <option value="direct">Direct</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={form.has_personal_connection}
                onChange={(e) =>
                  setForm({
                    ...form,
                    has_personal_connection: e.target.checked,
                  })
                }
              />{" "}
              I have a genuine prior personal connection with this contact
            </label>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary">
            Generate Message
          </button>
        </form>

        {generated && (
          <div style={{ marginTop: "1.5rem" }}>
            <h3>Generated Message</h3>
            <div className="message-preview">{generated}</div>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem" }}>
              Review and edit before sending manually on LinkedIn.
            </p>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Saved Drafts</h3>
        {messages.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No outreach drafts yet.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                <Link href={`/contacts/${m.contact_id}`}>
                  {contactMap[m.contact_id] || `Contact #${m.contact_id}`}
                </Link>
                {" · "}
                {m.tone} · {m.goal}
              </div>
              <div className="message-preview">{m.generated_message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
