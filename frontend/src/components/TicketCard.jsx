import Badge from "./Badge";
import {
  ASSIGNED_GROUPS,
  CATEGORIES,
  PRIORITIES,
  labelFor,
} from "../ticketOptions";
import "./TicketCard.css";

const CONFIDENCE_TOOLTIP =
  "This is the model's own estimate of how sure it is, not a measured accuracy score.";

function FieldLabel({ children, isEdited }) {
  return (
    <span className="field-label">
      {children}
      {isEdited && <span className="edited-marker">edited</span>}
    </span>
  );
}

export default function TicketCard({
  ticket,
  originalTicket,
  editedFields,
  onFieldChange,
  onCopyText,
  onCopyJson,
  onCopyQuestion,
}) {
  const editedCount = editedFields.length;

  return (
    <article className="ticket-card">
      <div className="ticket-card-top">
        <span className="correction-count">
          {editedCount === 0
            ? "No fields corrected yet"
            : `${editedCount} field${editedCount === 1 ? "" : "s"} corrected`}
        </span>
        <Badge tone="neutral" title={CONFIDENCE_TOOLTIP}>
          Confidence: {ticket.confidence}
        </Badge>
      </div>

      <label className="field">
        <FieldLabel isEdited={editedFields.includes("summary")}>Summary</FieldLabel>
        <input
          type="text"
          className="field-input"
          value={ticket.summary}
          onChange={(event) => onFieldChange("summary", event.target.value)}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <FieldLabel isEdited={editedFields.includes("category")}>Category</FieldLabel>
          <select
            className="field-input"
            value={ticket.category}
            onChange={(event) => onFieldChange("category", event.target.value)}
          >
            {CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <FieldLabel isEdited={editedFields.includes("priority")}>Priority</FieldLabel>
          <div className="priority-field">
            <select
              className="field-input"
              value={ticket.priority}
              onChange={(event) => onFieldChange("priority", event.target.value)}
            >
              {PRIORITIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Badge tone={ticket.priority}>{labelFor(PRIORITIES, ticket.priority)}</Badge>
          </div>
        </label>

        <label className="field">
          <FieldLabel isEdited={editedFields.includes("assigned_group")}>
            Assignment group
          </FieldLabel>
          <select
            className="field-input"
            value={ticket.assigned_group}
            onChange={(event) => onFieldChange("assigned_group", event.target.value)}
          >
            {ASSIGNED_GROUPS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <FieldLabel isEdited={editedFields.includes("likely_cause")}>Likely cause</FieldLabel>
        <textarea
          className="field-input"
          rows={2}
          value={ticket.likely_cause}
          placeholder={
            originalTicket.likely_cause ? "" : "No cause suggested. Add your own read on it."
          }
          onChange={(event) => onFieldChange("likely_cause", event.target.value)}
        />
      </label>

      <section className="ticket-section">
        <h3 className="ticket-section-title">Next steps</h3>
        <ol className="next-steps">
          {ticket.next_steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="ticket-section">
        <h3 className="ticket-section-title">Questions for the user</h3>
        {ticket.questions_for_user.length === 0 ? (
          <p className="empty-line">Nothing missing. The model had what it needed.</p>
        ) : (
          <ul className="questions">
            {ticket.questions_for_user.map((question, index) => (
              <li key={index} className="question">
                <span>{question}</span>
                <button
                  type="button"
                  className="button button-small"
                  onClick={() => onCopyQuestion(question)}
                >
                  Copy
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="ticket-actions">
        <button type="button" className="button" onClick={onCopyText}>
          Copy as text
        </button>
        <button type="button" className="button button-primary" onClick={onCopyJson}>
          Copy JSON
        </button>
      </div>
    </article>
  );
}
