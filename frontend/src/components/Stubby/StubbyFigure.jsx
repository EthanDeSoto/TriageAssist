const BODY_PATH =
  "M 20 104 L 14 98.5 L 20 93 L 14 87.5 L 20 82 L 14 76.5 L 20 71 L 14 65.5 L 20 60 L 14 54.5 L 20 49 L 14 43.5 L 20 38 L 14 32.5 L 20 27 L 14 21.5 L 20 16 L 80 16 Q 86 16 86 22 L 86 98 Q 86 104 80 104 Z";

const FACES = {
  idle: {
    brows: "M 38 47 L 50 47 M 56 47 L 68 47",
    mouth: "M 47 71 Q 53 76 59 71",
    eyes: "dots",
  },
  typing: {
    brows: "M 38 48 L 50 44 M 56 44 L 68 48",
    mouth: "M 47 72 L 59 72",
    eyes: "squint",
  },
  bored: {
    brows: "M 38 50 L 50 49 M 56 49 L 68 50",
    mouth: "M 48 72 Q 53 69 58 72",
    eyes: "dots",
  },
  caught: {
    brows: "M 38 42 L 50 40 M 56 40 L 68 42",
    mouth: "M 47 70 Q 53 79 59 70",
    eyes: "wide",
  },
  loading: {
    brows: "M 38 45 L 50 48 M 56 48 L 68 45",
    mouth: "M 47 72 Q 53 70 59 72",
    eyes: "dots",
  },
  coldStart: {
    brows: "M 38 48 L 50 48 M 56 48 L 68 48",
    mouth: "M 50 72 Q 53 77 56 72",
    eyes: "closed",
  },
  happy: {
    brows: "M 38 43 L 50 41 M 56 41 L 68 43",
    mouth: "M 45 69 Q 53 79 61 69",
    eyes: "happy",
  },
  worried: {
    brows: "M 38 41 L 50 47 M 56 47 L 68 41",
    mouth: "M 47 75 Q 53 69 59 75",
    eyes: "wide",
  },
  error: {
    brows: "M 38 43 L 50 49 M 56 49 L 68 43",
    mouth: "M 47 74 Q 53 68 59 74",
    eyes: "x",
  },
};

const FACE_BY_MOOD = {
  idle: "idle",
  bored: "bored",
  typing: "typing",
  caught: "caught",
  loading: "loading",
  coldStart: "coldStart",
  successLow: "happy",
  successMedium: "happy",
  successHigh: "happy",
  successCritical: "worried",
  error: "error",
  clicked: "happy",
  leaving: "happy",
};

function Eyes({ style }) {
  if (style === "squint") {
    return (
      <g className="stubby-ink">
        <path d="M 39.5 58 Q 44 54.5 48.5 58" />
        <path d="M 57.5 58 Q 62 54.5 66.5 58" />
      </g>
    );
  }
  if (style === "happy") {
    return (
      <g className="stubby-ink">
        <path d="M 39.5 60 Q 44 53.5 48.5 60" />
        <path d="M 57.5 60 Q 62 53.5 66.5 60" />
      </g>
    );
  }
  if (style === "closed") {
    return (
      <g className="stubby-ink">
        <path d="M 39.5 58 L 48.5 58" />
        <path d="M 57.5 58 L 66.5 58" />
      </g>
    );
  }
  if (style === "x") {
    return (
      <g className="stubby-ink">
        <path d="M 40.5 54.5 L 47.5 61.5 M 47.5 54.5 L 40.5 61.5" />
        <path d="M 58.5 54.5 L 65.5 61.5 M 65.5 54.5 L 58.5 61.5" />
      </g>
    );
  }
  const radius = style === "wide" ? 6 : 4.5;
  return (
    <g className="stubby-eyes">
      <circle className="stubby-eye" cx="44" cy="58" r={radius} />
      <circle className="stubby-eye" cx="62" cy="58" r={radius} />
    </g>
  );
}

export default function StubbyFigure({ mood, showNewspaper }) {
  const face = FACES[FACE_BY_MOOD[mood] || "idle"];

  return (
    <svg
      className="stubby-svg"
      viewBox="0 0 120 120"
      role="img"
      aria-label="Stubby, a small paper ticket stub mascot"
    >
      <g className="stubby-legs stubby-ink">
        <path d="M 40 104 L 38 115" />
        <path d="M 66 104 L 68 115" />
        <path d="M 33 115 L 42 115" />
        <path d="M 64 115 L 73 115" />
      </g>

      <g className="stubby-arm stubby-arm-left stubby-ink">
        <path d="M 20 72 L 8 80" />
        <circle className="stubby-hand" cx="8" cy="80" r="3.2" />
        {mood === "loading" && (
          <g className="stubby-watch">
            <circle cx="8" cy="80" r="4.6" />
            <path d="M 8 80 L 8 77.5 M 8 80 L 10 81" />
          </g>
        )}
        {mood === "successHigh" && (
          <rect className="stubby-sleeve" x="12" y="71" width="7" height="8" rx="2" />
        )}
      </g>

      <g className="stubby-arm stubby-arm-right stubby-ink">
        {mood === "successMedium" ? (
          <>
            <path d="M 86 72 L 96 78" />
            <g className="stubby-thumb">
              <rect x="93" y="70" width="10" height="10" rx="3.5" />
              <rect x="95.5" y="62" width="4.5" height="9" rx="2.2" />
            </g>
          </>
        ) : (
          <>
            <path d="M 86 72 L 98 80" />
            <circle className="stubby-hand" cx="98" cy="80" r="3.2" />
          </>
        )}
        {mood === "successHigh" && (
          <rect className="stubby-sleeve" x="87" y="71" width="7" height="8" rx="2" />
        )}
      </g>

      <path className="stubby-body" d={BODY_PATH} />
      <path className="stubby-perforation" d="M 24 21 L 24 99" />
      <rect className="stubby-print" x="32" y="23" width="46" height="3.4" rx="1.7" />
      <rect className="stubby-print" x="32" y="30" width="30" height="3.4" rx="1.7" />

      <Eyes style={face.eyes} />
      <path className="stubby-brows stubby-ink" d={face.brows} />
      <path className="stubby-mouth stubby-ink" d={face.mouth} />

      {mood === "coldStart" && (
        <g className="stubby-zzz">
          <text x="92" y="40">z</text>
          <text x="99" y="31">z</text>
          <text x="106" y="23">z</text>
        </g>
      )}

      {mood === "successCritical" && (
        <>
          <g className="stubby-sweat">
            <path d="M 74 46 q -3 4 0 5.4 q 3 -1.4 0 -5.4 Z" />
            <path d="M 78 56 q -3 4 0 5.4 q 3 -1.4 0 -5.4 Z" />
          </g>
          <g className="stubby-extinguisher">
            <rect x="91" y="72" width="12" height="22" rx="5" />
            <path className="stubby-ink" d="M 97 72 L 97 67 L 104 70" />
          </g>
        </>
      )}

      {mood === "successLow" && (
        <g className="stubby-coffee">
          <path d="M 92 74 h 11 v 8 a 4 4 0 0 1 -4 4 h -3 a 4 4 0 0 1 -4 -4 Z" />
          <path className="stubby-ink" d="M 103 76 q 4 2 0 5" />
          <path className="stubby-steam stubby-ink" d="M 96 71 q 2 -3 0 -5 M 100 71 q 2 -3 0 -5" />
        </g>
      )}

      {showNewspaper && (
        <g className="stubby-newspaper">
          <rect x="26" y="62" width="54" height="34" rx="2" />
          <path className="stubby-ink" d="M 53 62 L 53 96" />
          <text x="53" y="72" textAnchor="middle">PRINTER NEWS</text>
          <g className="stubby-newsprint">
            <rect x="30" y="77" width="19" height="2.2" rx="1.1" />
            <rect x="30" y="82" width="19" height="2.2" rx="1.1" />
            <rect x="30" y="87" width="13" height="2.2" rx="1.1" />
            <rect x="57" y="77" width="19" height="2.2" rx="1.1" />
            <rect x="57" y="82" width="19" height="2.2" rx="1.1" />
            <rect x="57" y="87" width="15" height="2.2" rx="1.1" />
          </g>
        </g>
      )}
    </svg>
  );
}
