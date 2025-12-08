import { createFileRoute } from "@tanstack/react-router";
import { useState, ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const API = "http://localhost:3000";
const api = (path: string) => `${API}${path}`;

export const Route = createFileRoute("/testing")({
  component: TestingPage,
});

export default function TestingPage() {
  const [result, setResult] = useState<any>(null);

  const {
    getAccessTokenSilently,
    isAuthenticated,
    loginWithRedirect,
  } = useAuth0();

  // Call API with auth token
  const callApi = async (method: string, url: string, body?: any) => {
    try {
      if (!isAuthenticated) {
        await loginWithRedirect();
        return;
      }

      const token = await getAccessTokenSilently();

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await res.json().catch(() => ({}));
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

  const formToObj = (formData: FormData) => {
    const obj: any = {};
    formData.forEach((val, key) => {
      obj[key] = val === "" ? null : val;
    });
    return obj;
  };

  return (
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Backend Testing Sandbox</h1>

      {!isAuthenticated && (
        <button
          onClick={() => loginWithRedirect()}
          style={{ ...buttonStyle, marginBottom: "20px" }}
        >
          Login with Auth0
        </button>
      )}

      <Card title="Create Event">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);

            const body = formToObj(fd);
            body.dateTime = new Date().toISOString();

            if (body.maxAttendees) body.maxAttendees = Number(body.maxAttendees);

            callApi("POST", api("/events"), body);
          }}
        >

          <input name="title" placeholder="Title" style={inputStyle} required />
          <input name="description" placeholder="Description" style={inputStyle} />
          <input name="location" placeholder="Location" style={inputStyle} />
          <input name="musicTag" placeholder="Music Tag" style={inputStyle} />
          <input name="artistId" placeholder="Artist ID" style={inputStyle} />

          <select name="visibility" style={inputStyle}>
            <option value="PRIVATE">PRIVATE</option>
            <option value="PUBLIC">PUBLIC</option>
          </select>

          <input name="maxAttendees" placeholder="Max attendees" style={inputStyle} />

          <button style={buttonStyle}>Create Event</button>
        </form>
      </Card>

      <Card title="Update Event">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const body = formToObj(fd);

            if (body.updateDateTime === "on") {
              body.dateTime = new Date().toISOString();
            } else {
              delete body.dateTime;
            }
            delete body.updateDateTime;

            callApi("PATCH", api(`/events/${body.eventId}`), body);
          }}
        >
          <input name="eventId" placeholder="Event ID" style={inputStyle} required />
          <input name="title" placeholder="Title" style={inputStyle} />
          <input name="description" placeholder="Description" style={inputStyle} />

          <label>
            <input type="checkbox" name="updateDateTime" /> Update Date to Now
          </label>

          <input name="location" placeholder="Location" style={inputStyle} />
          <input name="musicTag" placeholder="Music Tag" style={inputStyle} />
          <input name="artistId" placeholder="Artist ID" style={inputStyle} />

          <select name="visibility" style={inputStyle}>
            <option value="">(no change)</option>
            <option value="PRIVATE">PRIVATE</option>
            <option value="PUBLIC">PUBLIC</option>
          </select>

          <input name="maxAttendees" placeholder="Max attendees" style={inputStyle} />

          <button style={buttonStyle}>Update Event</button>
        </form>
      </Card>

      <Card title="Delete Event">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const body = formToObj(fd);
            callApi("DELETE", api(`/events/${body.eventId}`));
          }}
        >
          <input name="eventId" placeholder="Event ID" style={inputStyle} required />
          <button style={buttonStyle}>Delete Event</button>
        </form>
      </Card>

      <Card title="RSVP to Event">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const body = formToObj(fd);

            callApi("POST", api(`/events/${body.eventId}/rsvp`), {
              status: body.status,
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
            const fd = new FormData(e.currentTarget);
            const body = formToObj(fd);

            callApi("POST", api(`/events/${body.eventId}/comments`), {
              content: body.content,
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
            const fd = new FormData(e.currentTarget);
            const body = formToObj(fd);

            callApi(
              "PATCH",
              api(`/events/${body.eventId}/comments/${body.commentId}`),
              { content: body.content }
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
            const fd = new FormData(e.currentTarget);
            const body = formToObj(fd);

            callApi(
              "DELETE",
              api(`/events/${body.eventId}/comments/${body.commentId}`)
            );
          }}
        >
          <input name="eventId" placeholder="Event ID" style={inputStyle} required />
          <input name="commentId" placeholder="Comment ID" style={inputStyle} required />
          <button style={buttonStyle}>Delete Comment</button>
        </form>
      </Card>

      <Card title="Create Connection (Send Request)">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const body = formToObj(fd);

            callApi("POST", api("/connections"), {
              receiverId: body.receiverId,
            });
          }}
        >
          <input
            name="receiverId"
            placeholder="Receiver User ID"
            style={inputStyle}
            required
          />

          <button style={buttonStyle}>Send Connection Request</button>
        </form>
      </Card>

      <Card title="Get My Connections">
        <button
          style={buttonStyle}
          onClick={() => callApi("GET", api("/connections"))}
        >
          Fetch Connections
        </button>
      </Card>

      <Card title="Update Connection">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const body = formToObj(fd);

            callApi(
              "PATCH",
              api(`/connections/${body.connectionId}`),
              { status: body.status }
            );
          }}
        >
          <input
            name="connectionId"
            placeholder="Connection ID"
            style={inputStyle}
            required
          />

          <select name="status" style={inputStyle} required>
            <option value="PENDING">PENDING</option>
            <option value="ACCEPTED">ACCEPTED</option>
          </select>

          <button style={buttonStyle}>Update Connection</button>
        </form>
      </Card>

      <Card title="Delete Connection">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const body = formToObj(fd);

            callApi("DELETE", api(`/connections/${body.connectionId}`));
          }}
        >
          <input
            name="connectionId"
            placeholder="Connection ID"
            style={inputStyle}
            required
          />

          <button style={buttonStyle}>Delete Connection</button>
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
