"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, Contact, Interaction, OutreachMessage } from "@/lib/api";

export default function ContactDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [outreach, setOutreach] = useState<OutreachMessage[]>([]);
  const [goal, setGoal] = useState("learn about your team's work");
  const [tone, setTone] = useState("professional");
  const [background, setBackground] = useState("");
  const [hasConnection, setHasConnection] = useState(false);
  const [generated, setGenerated] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [c, ints, msgs] = await Promise.all([
        api.getContact(id),
        api.getInteractions(id),
        api.getOutreachMessages(),
      ]);
      setContact(c);
      setInteractions(ints);
      setOutreach(msgs.filter((m) => m.contact_id === id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const msg = await api.generateOutreach({
        contact_id: id,
        goal,
        tone,
        user_background: background,
        has_personal_connection: hasConnection,
      });
      setGenerated(msg.generated_message);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    }
  }

  if (!contact && !error) return <p>Loading...</p>;
  if (!contact) return <p className="error">{error}</p>;

  const nextAction =
    interactions.find((i) => i.next_follow_up_date)?.next_follow_up_date ||
    "No follow-up scheduled";

  return (
    <div>
      <div className="page-header">
        <h2>{contact.name}</h2>
        <Link href="/contacts" className="btn btn-secondary">
          Back to Contacts
        </Link>
      </div>

      <div className="card">
        <h3>Profile</h3>
        <table>
          <tbody>
            <tr>
              <th style={{ width: 160 }}>Title</th>
              <td>{contact.current_title || "—"}</td>
            </tr>
            <tr>
              <th>Company</th>
              <td>{contact.company || "—"}</td>
            </tr>
            <tr>
              <th>Location</th>
              <td>{contact.location || "—"}</td>
            </tr>
            <tr>
              <th>LinkedIn</th>
              <td>
                {contact.linkedin_url ? (
                  <a href={contact.linkedin_url} target="_blank" rel="noreferrer">
                    {contact.linkedin_url}
                  </a>
                ) : (
                  "—"
                )}
              </td>
            </tr>
            <tr>
              <th>Status</th>
              <td>
                <span className="badge">{contact.status}</span>
              </td>
            </tr>
            <tr>
              <th>Relationship</th>
              <td>{contact.relationship_level}</td>
            </tr>
            <tr>
              <th>Source</th>
              <td>{contact.source}</td>
            </tr>
            <tr>
              <th>Notes</th>
              <td>{contact.notes || "—"}</td>
            </tr>
            <tr>
              <th>Next Action</th>
              <td>{nextAction}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Interaction Timeline</h3>
        {interactions.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No interactions yet.</p>
        ) : (
          interactions.map((i) => (
            <div key={i.id} className="timeline-item">
              <div className="date">
                {i.date} · {i.channel}
              </div>
              <p>{i.message || "—"}</p>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                Result: {i.result || "—"}
                {i.next_follow_up_date &&
                  ` · Follow-up: ${i.next_follow_up_date}`}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>Outreach Message Generator</h3>
        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label>Your Background</label>
            <textarea
              required
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="Brief professional background..."
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Goal</label>
              <input value={goal} onChange={(e) => setGoal(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)}>
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
                checked={hasConnection}
                onChange={(e) => setHasConnection(e.target.checked)}
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
          <div style={{ marginTop: "1rem" }}>
            <h4 style={{ marginBottom: "0.5rem" }}>Generated Draft</h4>
            <div className="message-preview">{generated}</div>
          </div>
        )}
        {outreach.length > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <h4 style={{ marginBottom: "0.5rem" }}>Previous Drafts</h4>
            {outreach.map((m) => (
              <div key={m.id} className="message-preview" style={{ marginBottom: "0.75rem" }}>
                <small style={{ color: "var(--muted)" }}>
                  {m.tone} · {m.goal}
                </small>
                <p>{m.generated_message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
