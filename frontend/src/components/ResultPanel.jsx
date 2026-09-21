import ErrorNotice from "./ErrorNotice";
import SkeletonCard from "./SkeletonCard";
import TicketCard from "./TicketCard";
import "./ResultPanel.css";

function statusMessage(status, isColdStart, error) {
  if (status === "loading") {
    return isColdStart
      ? "Waking up the server — first request of the day can take up to a minute."
      : "Triaging the ticket.";
  }
  if (status === "success") {
    return "Triage finished. The ticket is ready to review.";
  }
  if (status === "error") {
    return error ? error.message : "Something went wrong.";
  }
  return "";
}

export default function ResultPanel({
  status,
  isColdStart,
  ticket,
  originalTicket,
  editedFields,
  error,
  onFieldChange,
  onRetry,
  onCopyText,
  onCopyJson,
  onCopyQuestion,
}) {
  return (
    <section className="panel result-panel">
      <div className="panel-heading">Triage result</div>

      <p className="visually-hidden" aria-live="polite">
        {statusMessage(status, isColdStart, error)}
      </p>

      {status === "idle" && (
        <div className="empty-state">
          <p className="empty-state-lead">
            Paste a support request and Triage Assist drafts the ticket — category,
            priority, assignment group, and next steps — for you to correct before
            it goes out.
          </p>
          <p className="empty-state-note">AI suggests. You decide.</p>
        </div>
      )}

      {status === "loading" && (
        <>
          {isColdStart && (
            <p className="cold-start-note">
              Waking up the server — first request of the day can take up to a minute.
            </p>
          )}
          <SkeletonCard />
        </>
      )}

      {status === "error" && (
        <ErrorNotice kind={error.kind} message={error.message} onRetry={onRetry} />
      )}

      {status === "success" && ticket && (
        <TicketCard
          ticket={ticket}
          originalTicket={originalTicket}
          editedFields={editedFields}
          onFieldChange={onFieldChange}
          onCopyText={onCopyText}
          onCopyJson={onCopyJson}
          onCopyQuestion={onCopyQuestion}
        />
      )}
    </section>
  );
}
