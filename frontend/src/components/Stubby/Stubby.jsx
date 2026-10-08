import { useEffect, useMemo, useRef, useState } from "react";
import StubbyFigure from "./StubbyFigure";
import { pickLine } from "./stubbyLines";
import { readStored, writeStored } from "../../storage";
import "./Stubby.css";

const POSITION_KEY = "triage-assist.stubby-position";
const QUIP_COOLDOWN_MS = 20000;
const QUIP_VISIBLE_MS = 4000;
const BORED_READING_DELAY_MS = 1800;
const CLICK_REACTION_MS = 500;
const DRAG_THRESHOLD_PX = 4;

const CONFETTI = Array.from({ length: 12 }, (unused, index) => ({
  angle: -140 + index * 10,
  distance: 46 + (index % 4) * 14,
  delay: (index % 5) * 40,
}));

function isSuccess(mood) {
  return mood.startsWith("success");
}

function quipGroupFor(mood, topic) {
  if (isSuccess(mood) && topic === "access" && Math.random() < 0.5) {
    return "access";
  }
  return mood;
}

export default function Stubby({ mood, topic }) {
  const [position, setPosition] = useState(() => readStored(POSITION_KEY, null));
  const [isDragging, setIsDragging] = useState(false);
  const [quip, setQuip] = useState(null);
  const [showNewspaper, setShowNewspaper] = useState(false);
  const [isReacting, setIsReacting] = useState(false);

  const lastQuipAtRef = useRef(0);
  const lastLineRef = useRef(null);
  const dragStateRef = useRef(null);
  const latestPositionRef = useRef(null);

  function speak(group, { force = false } = {}) {
    const now = Date.now();
    if (!force && now - lastQuipAtRef.current < QUIP_COOLDOWN_MS) {
      return;
    }
    const line = pickLine(group, lastLineRef.current);
    if (!line) {
      return;
    }
    lastQuipAtRef.current = now;
    lastLineRef.current = line;
    setQuip(line);
  }

  useEffect(() => {
    speak(quipGroupFor(mood, topic));
  }, [mood]);

  useEffect(() => {
    if (!isReacting) {
      return;
    }
    const timer = setTimeout(() => setIsReacting(false), CLICK_REACTION_MS);
    return () => clearTimeout(timer);
  }, [isReacting]);

  useEffect(() => {
    if (!quip) {
      return;
    }
    const timer = setTimeout(() => setQuip(null), QUIP_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [quip]);

  useEffect(() => {
    if (mood !== "bored") {
      setShowNewspaper(false);
      return;
    }
    const timer = setTimeout(() => setShowNewspaper(true), BORED_READING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [mood]);

  useEffect(() => {
    if (mood !== "idle") {
      return;
    }
    const timer = setInterval(() => speak("idle"), QUIP_COOLDOWN_MS);
    return () => clearInterval(timer);
  }, [mood]);

  const confetti = useMemo(() => (isSuccess(mood) ? CONFETTI : []), [mood]);
  const displayMood = isReacting ? "clicked" : mood;

  function handlePointerDown(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    dragStateRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    const drag = dragStateRef.current;
    if (!drag) {
      return;
    }
    const movedFar =
      Math.abs(event.clientX - drag.pointerX) > DRAG_THRESHOLD_PX ||
      Math.abs(event.clientY - drag.pointerY) > DRAG_THRESHOLD_PX;
    if (!movedFar) {
      return;
    }
    if (!drag.moved) {
      drag.moved = true;
      setIsDragging(true);
    }
    const maxX = window.innerWidth - drag.width;
    const maxY = window.innerHeight - drag.height;
    const next = {
      x: Math.min(Math.max(event.clientX - drag.offsetX, 0), Math.max(maxX, 0)),
      y: Math.min(Math.max(event.clientY - drag.offsetY, 0), Math.max(maxY, 0)),
    };
    latestPositionRef.current = next;
    setPosition(next);
  }

  function handlePointerUp(event) {
    const drag = dragStateRef.current;
    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (drag && drag.moved) {
      setIsDragging(false);
      writeStored(POSITION_KEY, latestPositionRef.current);
      return;
    }
    speak("clicked", { force: true });
    setIsReacting(true);
  }

  const placement = position
    ? { left: `${position.x}px`, top: `${position.y}px`, right: "auto", bottom: "auto" }
    : undefined;

  return (
    <div
      className={`stubby${isDragging ? " stubby-dragging" : ""}`}
      style={placement}
      data-mood={displayMood}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {quip && (
        <div className="stubby-bubble" role="status">
          {quip}
        </div>
      )}

      <div className="stubby-stage">
        {confetti.map((piece, index) => (
          <span
            key={index}
            className="confetti"
            style={{
              "--angle": `${piece.angle}deg`,
              "--distance": `${piece.distance}px`,
              "--delay": `${piece.delay}ms`,
            }}
          />
        ))}
        <StubbyFigure mood={displayMood} showNewspaper={showNewspaper} />
      </div>
    </div>
  );
}
