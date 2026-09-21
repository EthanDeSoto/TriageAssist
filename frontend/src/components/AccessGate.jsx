import { useState } from "react";
import "./AccessGate.css";

export default function AccessGate({ message, onSubmit }) {
  const [code, setCode] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (code.trim()) {
      onSubmit(code.trim());
    }
  }

  return (
    <div className="gate">
      <form className="gate-card" onSubmit={handleSubmit}>
        <h1 className="gate-title">Triage Assist</h1>
        <p className="gate-lead">
          This demo calls a paid AI API, so it is behind an access code.
        </p>

        <label className="gate-label" htmlFor="access-code">
          Access code
        </label>
        <input
          id="access-code"
          type="password"
          className="gate-input"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          autoFocus
        />

        {message && (
          <p className="gate-error" role="alert">
            {message}
          </p>
        )}

        <button type="submit" className="button button-primary" disabled={!code.trim()}>
          Enter
        </button>
      </form>
    </div>
  );
}
