import FileDropZone from "./FileDropZone";
import { MAX_DESCRIPTION_LENGTH, MIN_DESCRIPTION_LENGTH } from "../ticketOptions";
import "./InputPanel.css";

const WARN_AT = MAX_DESCRIPTION_LENGTH - 200;

function counterTone(length) {
  if (length > MAX_DESCRIPTION_LENGTH) {
    return "over";
  }
  if (length >= WARN_AT) {
    return "near";
  }
  return "fine";
}

export default function InputPanel({
  description,
  onDescriptionChange,
  file,
  previewUrl,
  fileError,
  onSelectFile,
  onRemoveFile,
  onSubmit,
  onClear,
  onUseSample,
  isLoading,
}) {
  const length = description.length;
  const trimmedLength = description.trim().length;
  const hasFile = Boolean(file);
  const isTooShort = !hasFile && trimmedLength > 0 && trimmedLength < MIN_DESCRIPTION_LENGTH;
  const isTooLong = length > MAX_DESCRIPTION_LENGTH;
  const canSubmit = !isLoading && !isTooShort && !isTooLong && (trimmedLength > 0 || hasFile);

  function handleSubmit(event) {
    event.preventDefault();
    if (canSubmit) {
      onSubmit();
    }
  }

  function handleKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      if (canSubmit) {
        onSubmit();
      }
    }
  }

  return (
    <form className="panel input-panel" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <div className="panel-heading">Support request</div>

      <label className="input-label" htmlFor="description">
        Describe the problem
      </label>
      <textarea
        id="description"
        className="description-input"
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        placeholder="Paste what the user told you, in their own words."
        rows={10}
        aria-describedby="character-counter"
      />

      <div className="input-footnotes">
        <span
          id="character-counter"
          className={`character-counter counter-${counterTone(length)}`}
        >
          {length.toLocaleString()} / {MAX_DESCRIPTION_LENGTH.toLocaleString()}
        </span>
        <button type="button" className="link-button" onClick={onUseSample}>
          Try a sample ticket
        </button>
      </div>

      {isTooShort && (
        <p className="inline-warning" role="alert">
          A little more detail, please. The server needs at least{" "}
          {MIN_DESCRIPTION_LENGTH} characters and this has {trimmedLength}, or
          you can attach a screenshot instead.
        </p>
      )}
      {isTooLong && (
        <p className="inline-warning" role="alert">
          That's {(length - MAX_DESCRIPTION_LENGTH).toLocaleString()} characters
          over the limit. Trim it down to {MAX_DESCRIPTION_LENGTH.toLocaleString()}.
        </p>
      )}

      <div className="file-section">
        <FileDropZone
          file={file}
          previewUrl={previewUrl}
          onSelectFile={onSelectFile}
          onRemoveFile={onRemoveFile}
        />
        {fileError && (
          <p className="inline-warning" role="alert">
            {fileError}
          </p>
        )}
      </div>

      <div className="input-actions">
        <button type="submit" className="button button-primary" disabled={!canSubmit}>
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Triaging&hellip;
            </>
          ) : (
            "Triage ticket"
          )}
        </button>
        <button type="button" className="button" onClick={onClear} disabled={isLoading}>
          Clear
        </button>
        <span className="shortcut-hint">Ctrl + Enter</span>
      </div>
    </form>
  );
}
