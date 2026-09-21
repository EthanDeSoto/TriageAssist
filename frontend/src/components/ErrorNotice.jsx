import "./ErrorNotice.css";

const TITLES = {
  validation: "That request wasn't accepted",
  ai: "The AI couldn't finish",
  rate_limited: "Slow down a moment",
  network: "Can't reach the server",
  timeout: "This took too long",
  unknown: "Something went wrong",
};

export default function ErrorNotice({ kind, message, onRetry }) {
  return (
    <div className="error-notice">
      <div className="error-notice-title">{TITLES[kind] || TITLES.unknown}</div>
      <p className="error-notice-message">{message}</p>
      <p className="error-notice-reassure">
        Your text and file are still here, nothing was lost.
      </p>
      {onRetry && (
        <button type="button" className="button button-small" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
