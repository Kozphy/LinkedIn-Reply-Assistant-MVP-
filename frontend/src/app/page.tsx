import Link from "next/link";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let stats;
  try {
    stats = await api.getDashboard();
  } catch {
    return (
      <div>
        <div className="page-header">
          <h2>Dashboard</h2>
        </div>
        <p className="error">
          Cannot reach the API. Start the backend with{" "}
          <code>uvicorn app.main:app --reload</code> on port 8000.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      <div className="card-grid">
        <div className="stat-card">
          <div className="label">Total Contacts</div>
          <div className="value">{stats.total_contacts}</div>
        </div>
        <div className="stat-card">
          <div className="label">Contacted</div>
          <div className="value">{stats.contacted_count}</div>
        </div>
        <div className="stat-card">
          <div className="label">Replied</div>
          <div className="value">{stats.replied_count}</div>
        </div>
        <div className="stat-card">
          <div className="label">Follow-up Due</div>
          <div className="value">{stats.follow_up_due_count}</div>
        </div>
      </div>

      <div className="card">
        <h3>Top Target Companies</h3>
        {stats.top_target_companies.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No companies yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Career Value</th>
              </tr>
            </thead>
            <tbody>
              {stats.top_target_companies.map((c) => (
                <tr key={c.name}>
                  <td>{c.name}</td>
                  <td>
                    <span
                      className={`badge badge-${c.career_value === "high" ? "high" : "medium"}`}
                    >
                      {c.career_value}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3>Recent Interactions</h3>
        {stats.recent_interactions.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No interactions logged.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Channel</th>
                <th>Message</th>
                <th>Result</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_interactions.map((i) => (
                <tr key={i.id}>
                  <td>{i.date}</td>
                  <td>{i.channel}</td>
                  <td>{i.message?.slice(0, 60) || "—"}</td>
                  <td>{i.result || "—"}</td>
                  <td>
                    <Link href={`/contacts/${i.contact_id}`}>View contact</Link>
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
