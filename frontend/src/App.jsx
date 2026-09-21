import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import InputPanel from "./components/InputPanel";
import ResultPanel from "./components/ResultPanel";
import Stubby from "./components/Stubby/Stubby";
import Toast from "./components/Toast";
import { triageTicket } from "./api";
import { checkFile, isImageFile } from "./fileRules";
import { pickSampleTicket } from "./sampleTickets";
import { readStored, writeStored } from "./storage";
import { copyToClipboard, formatTicketAsJson, formatTicketAsText } from "./ticketText";

const STUBBY_ON_KEY = "triage-assist.stubby-on";
const EDITABLE_FIELDS = ["summary", "category", "priority", "assigned_group", "likely_cause"];
const TYPING_MOOD_MS = 1400;
const CAUGHT_MOOD_MS = 1600;
const BORED_AFTER_MS = 30000;
const RESULT_SETTLE_MS = 6000;
const GOODBYE_MS = 1400;

function successMood(priority) {
  return `success${priority.charAt(0).toUpperCase()}${priority.slice(1)}`;
}

export default function App() {
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState(null);

  const [status, setStatus] = useState("idle");
  const [isColdStart, setIsColdStart] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [originalTicket, setOriginalTicket] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [stubbyOn, setStubbyOn] = useState(() => readStored(STUBBY_ON_KEY, true));
  const [isLeaving, setIsLeaving] = useState(false);
  const [transientMood, setTransientMood] = useState(null);
  const [isBored, setIsBored] = useState(false);
  const [resultSettled, setResultSettled] = useState(false);
  const [activityTick, setActivityTick] = useState(0);

  useEffect(() => {
    if (!file || !isImageFile(file)) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!transientMood) {
      return;
    }
    const delay = transientMood === "caught" ? CAUGHT_MOOD_MS : TYPING_MOOD_MS;
    const timer = setTimeout(() => setTransientMood(null), delay);
    return () => clearTimeout(timer);
  }, [transientMood, activityTick]);

  useEffect(() => {
    const timer = setTimeout(() => setIsBored(true), BORED_AFTER_MS);
    return () => clearTimeout(timer);
  }, [activityTick]);

  useEffect(() => {
    if (status !== "success" && status !== "error") {
      return;
    }
    const timer = setTimeout(() => setResultSettled(true), RESULT_SETTLE_MS);
    return () => clearTimeout(timer);
  }, [status, ticket]);

  useEffect(() => {
    function handlePaste(event) {
      const item = Array.from(event.clipboardData.items).find(
        (candidate) => candidate.kind === "file",
      );
      if (!item) {
        return;
      }
      const pasted = item.getAsFile();
      if (pasted) {
        event.preventDefault();
        selectFile(pasted);
      }
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  function markActivity() {
    setIsBored(false);
    setActivityTick((tick) => tick + 1);
  }

  function selectFile(chosen) {
    markActivity();
    const problem = checkFile(chosen);
    if (problem) {
      setFileError(problem);
      return;
    }
    setFileError(null);
    setFile(chosen);
    setTransientMood("caught");
  }

  function removeFile() {
    markActivity();
    setFile(null);
    setFileError(null);
  }

  function handleDescriptionChange(value) {
    markActivity();
    setDescription(value);
    setTransientMood("typing");
  }

  function handleUseSample() {
    markActivity();
    setDescription(pickSampleTicket(description));
    setTransientMood("typing");
  }

  function handleClear() {
    markActivity();
    setDescription("");
    setFile(null);
    setFileError(null);
    setStatus("idle");
    setTicket(null);
    setOriginalTicket(null);
    setError(null);
    setIsColdStart(false);
  }

  async function handleSubmit() {
    markActivity();
    setTransientMood(null);
    setStatus("loading");
    setIsColdStart(false);
    setError(null);
    setResultSettled(false);

    try {
      const response = await triageTicket({
        description: description.trim(),
        file,
        onColdStart: () => setIsColdStart(true),
      });
      const withCause = { ...response.result, likely_cause: response.result.likely_cause || "" };
      setOriginalTicket(withCause);
      setTicket(withCause);
      setStatus("success");
    } catch (requestError) {
      setError({ kind: requestError.kind, message: requestError.message });
      setStatus("error");
    } finally {
      setIsColdStart(false);
    }
  }

  function handleFieldChange(field, value) {
    markActivity();
    setTicket((current) => ({ ...current, [field]: value }));
  }

  const editedFields = useMemo(() => {
    if (!ticket || !originalTicket) {
      return [];
    }
    return EDITABLE_FIELDS.filter((field) => ticket[field] !== originalTicket[field]);
  }, [ticket, originalTicket]);

  async function copyAndTell(text, message) {
    const copied = await copyToClipboard(text);
    setToast(copied ? message : "Copying isn't allowed in this browser.");
  }

  function handleToggleStubby() {
    if (!stubbyOn) {
      setStubbyOn(true);
      writeStored(STUBBY_ON_KEY, true);
      return;
    }
    setIsLeaving(true);
    setTimeout(() => {
      setIsLeaving(false);
      setStubbyOn(false);
      writeStored(STUBBY_ON_KEY, false);
    }, GOODBYE_MS);
  }

  function currentMood() {
    if (isLeaving) {
      return "leaving";
    }
    if (status === "loading") {
      return isColdStart ? "coldStart" : "loading";
    }
    if (!resultSettled && status === "error") {
      return "error";
    }
    if (!resultSettled && status === "success" && ticket) {
      return successMood(ticket.priority);
    }
    if (transientMood) {
      return transientMood;
    }
    if (isBored) {
      return "bored";
    }
    return "idle";
  }

  return (
    <div className="app" onPointerDown={markActivity}>
      <Header stubbyOn={stubbyOn} onToggleStubby={handleToggleStubby} />

      <main className="panels">
        <InputPanel
          description={description}
          onDescriptionChange={handleDescriptionChange}
          file={file}
          previewUrl={previewUrl}
          fileError={fileError}
          onSelectFile={selectFile}
          onRemoveFile={removeFile}
          onSubmit={handleSubmit}
          onClear={handleClear}
          onUseSample={handleUseSample}
          isLoading={status === "loading"}
        />

        <ResultPanel
          status={status}
          isColdStart={isColdStart}
          ticket={ticket}
          originalTicket={originalTicket}
          editedFields={editedFields}
          error={error}
          onFieldChange={handleFieldChange}
          onRetry={handleSubmit}
          onCopyText={() => copyAndTell(formatTicketAsText(ticket), "Copied as plain text")}
          onCopyJson={() => copyAndTell(formatTicketAsJson(ticket), "Copied as JSON")}
          onCopyQuestion={(question) => copyAndTell(question, "Question copied")}
        />
      </main>

      {stubbyOn && (
        <Stubby
          mood={currentMood()}
          topic={ticket && ticket.category === "access" ? "access" : null}
        />
      )}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
