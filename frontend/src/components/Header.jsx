import "./Header.css";

export default function Header({ stubbyOn, onToggleStubby }) {
  return (
    <header className="header">
      <div className="header-titles">
        <h1 className="header-title">Triage Assist</h1>
        <p className="header-tagline">
          Paste a messy support request, get a structured ticket you can correct.
        </p>
      </div>

      <label className="stubby-toggle">
        <span className="stubby-toggle-label">
          Stubby: {stubbyOn ? "On" : "Off"}
        </span>
        <input
          type="checkbox"
          className="stubby-toggle-input"
          checked={stubbyOn}
          onChange={onToggleStubby}
        />
        <span className="stubby-toggle-track" aria-hidden="true">
          <span className="stubby-toggle-knob" />
        </span>
      </label>
    </header>
  );
}
