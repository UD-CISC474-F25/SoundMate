import { createFileRoute } from "@tanstack/react-router";
import { useState, ReactNode } from "react";

const API = "http://localhost:3000";
const api = (path: string) => `${API}${path}`;

export const Route = createFileRoute("/testing")({
  component: TestingPage,
});

export default function TestingPage() {
  const [result, setResult] = useState<any>(null);

  const callApi = async (method: string, url: string, body?: any) => {
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ error: err.toString() });
    }
  };

  const Card = ({ title, children }: { title: string; children: ReactNode }) => (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "16px",
        background: "#fafafa",
      }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );

  const inputStyle = {
    marginBottom: "8px",
    padding: "6px 8px",
    width: "100%",
    boxSizing: "border-box" as const,
  };

  const buttonStyle = {
    padding: "6px 12px",
    marginTop: "6px",
    cursor: "pointer",
  };

  return (
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Backend Testing Sandbox</h1>

      <Card title="Create Event">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.target as any;

            callApi("POST", api("/events"), {
              title: f.title.value,
              description: f.description.value || null,
              dateTime: new Date().toISOString(), 
              location: f.location.value || null,
              musicTag: f.musicTag.value || null,
              artistId: f.artistId.value || null,
              visibility: f.visibility.value,
              maxAttendees: f.maxAttendees.value
                ? Number(f.maxAttendees.value)
                : null,
            });
          }}
        >
          <input name="title" placeholder="Title (required)" style={inputStyle} required />
          <input name="description" placeholder="Description" style={inputStyle} />
          <input name="location" placeholder="Location" style={inputStyle} />
          <input name="musicTag" placeholder="Music Tag" style={inputStyle} />
          <input name="artistId" placeholder="Artist ID" style={inputStyle} />
          <select name="visibility" style={inputStyle}>
            <option value="PRIVATE">PRIVATE</option>
            <option value="PUBLIC">PUBLIC</option>
          </select>
          <input name="maxAttendees" placeholder="Max attendees (positive int)" style={inputStyle} />
          <button style={buttonStyle}>Create</button>
        </form>
      </Card>

      <Card title="Update Event">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.target as any;

            callApi("PATCH", api(`/events/${f.eventId.value}`), {
              title: f.title.value || undefined,
              description: f.description.value || null,
              dateTime: undefined,
              location: f.location.value || null,
              musicTag: f.musicTag.value || null,
              artistId: f.artistId.value || null,
              visibility: f.visibility.value || undefined,
              maxAttendees: f.maxAttendees.value
                ? Number(f.maxAttendees.value)
                : null,
            });
          }}
        >
          <input name="eventId" placeholder="Event ID (required)" style={inputStyle} required />
          <input name="title" placeholder="Title" style={inputStyle} />
          <input name="description" placeholder="Description" style={inputStyle} />
          <input name="location" placeholder="Location" style={inputStyle} />
          <input name="musicTag" placeholder="Music Tag" style={inputStyle} />
          <input name="artistId" placeholder="Artist ID" style={inputStyle} />
          <select name="visibility" style={inputStyle}>
            <option value="">(no change)</option>
            <option value="PRIVATE">PRIVATE</option>
            <option value="PUBLIC">PUBLIC</option>
          </select>
          <input name="maxAttendees" placeholder="Max attendees" style={inputStyle} />
          <button style={buttonStyle}>Update</button>
        </form>
      </Card>

      <Card title="Delete Event">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.target as any;
            callApi("DELETE", api(`/events/${f.eventId.value}`));
          }}
        >
          <input name="eventId" placeholder="Event ID" style={inputStyle} required />
          <button style={buttonStyle}>Delete</button>
        </form>
      </Card>

      <Card title="RSVP to Event">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.target as any;

            callApi("POST", api(`/events/${f.eventId.value}/rsvp`), {
              status: f.status.value,
            });
          }}
        >
          <input name="eventId" placeholder="Event ID" style={inputStyle} required />
          <select name="status" style={inputStyle} required>
            <option value="GOING">GOING</option>
            <option value="MAYBE">MAYBE</option>
            <option value="DECLINED">DECLINED</option>
            <option value="INVITED">INVITED</option>
          </select>
          <button style={buttonStyle}>Submit RSVP</button>
        </form>
      </Card>

      <Card title="Add Comment">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.target as any;

            callApi("POST", api(`/events/${f.eventId.value}/comments`), {
              content: f.content.value,
            });
          }}
        >
          <input name="eventId" placeholder="Event ID" style={inputStyle} required />
          <input name="content" placeholder="Comment text" style={inputStyle} required />
          <button style={buttonStyle}>Add Comment</button>
        </form>
      </Card>

      <Card title="Edit Comment">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.target as any;

            callApi(
              "PATCH",
              api(`/events/${f.eventId.value}/comments/${f.commentId.value}`),
              { content: f.content.value }
            );
          }}
        >
          <input name="eventId" placeholder="Event ID" style={inputStyle} required />
          <input name="commentId" placeholder="Comment ID" style={inputStyle} required />
          <input name="content" placeholder="New text" style={inputStyle} required />
          <button style={buttonStyle}>Edit Comment</button>
        </form>
      </Card>

      <Card title="Delete Comment">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.target as any;

            callApi(
              "DELETE",
              api(`/events/${f.eventId.value}/comments/${f.commentId.value}`)
            );
          }}
        >
          <input name="eventId" placeholder="Event ID" style={inputStyle} required />
          <input name="commentId" placeholder="Comment ID" style={inputStyle} required />
          <button style={buttonStyle}>Delete Comment</button>
        </form>
      </Card>

      <Card title="API Response">
        <pre
          style={{
            background: "#fff",
            padding: "12px",
            borderRadius: "6px",
            maxHeight: "300px",
            overflow: "auto",
            fontSize: "14px",
          }}
        >
          {result ? JSON.stringify(result, null, 2) : "No response yet."}
        </pre>
      </Card>
    </div>
  );
}
