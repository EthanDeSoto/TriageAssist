import { useRef, useState } from "react";
import { ACCEPTED_FILE_LABEL, ACCEPTED_FILE_TYPES } from "../ticketOptions";
import { formatFileSize, isImageFile } from "../fileRules";
import "./FileDropZone.css";

export default function FileDropZone({ file, previewUrl, onSelectFile, onRemoveFile }) {
  const inputRef = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  function handleDrop(event) {
    event.preventDefault();
    setIsDraggingOver(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) {
      onSelectFile(dropped);
    }
  }

  function handleInputChange(event) {
    const chosen = event.target.files[0];
    if (chosen) {
      onSelectFile(chosen);
    }
    event.target.value = "";
  }

  if (file) {
    return (
      <div className="file-card">
        {previewUrl && isImageFile(file) ? (
          <img className="file-thumbnail" src={previewUrl} alt={`Preview of ${file.name}`} />
        ) : (
          <span className="file-icon" aria-hidden="true">
            PDF
          </span>
        )}
        <div className="file-meta">
          <span className="file-name">{file.name}</span>
          <span className="file-size">{formatFileSize(file.size)}</span>
        </div>
        <button
          type="button"
          className="file-remove"
          onClick={onRemoveFile}
          aria-label={`Remove ${file.name}`}
        >
          &times;
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`file-drop${isDraggingOver ? " file-drop-active" : ""}`}
      onClick={() => inputRef.current.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
    >
      <span className="file-drop-main">Drop a screenshot, click to browse, or press Ctrl+V</span>
      <span className="file-drop-hint">{ACCEPTED_FILE_LABEL}</span>
      <input
        ref={inputRef}
        type="file"
        className="visually-hidden"
        accept={ACCEPTED_FILE_TYPES.join(",")}
        onChange={handleInputChange}
        tabIndex={-1}
      />
    </button>
  );
}
