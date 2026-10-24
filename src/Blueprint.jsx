import React from "react";

/* Hand-drawn blueprint illustrations for the education sheets.
   Every stroke has pathLength="1" so CSS can "draw" it in order
   (--k sets the stagger). These are original line drawings in the
   spirit of each campus, not exact architectural plans. */

function useCounter() {
  let k = 0;
  return () => ({ "--k": k++ });
}

const Ln = ({ d, s, cls = "ln" }) => <path className={cls} pathLength="1" d={d} style={s()} />;
const Label = ({ x, y, children, s, anchor = "middle" }) => (
  <text className="lbl" x={x} y={y} textAnchor={anchor} style={s()}>
    {children}
  </text>
);

/* Dimension line with end ticks and a measurement label */
function Dim({ x1, y1, x2, y2, label, s, vertical }) {
  const t = 5;
  const ticks = vertical
    ? `M${x1 - t} ${y1} H${x1 + t} M${x2 - t} ${y2} H${x2 + t}`
    : `M${x1} ${y1 - t} V${y1 + t} M${x2} ${y2 - t} V${y2 + t}`;
  return (
    <>
      <path className="ln dim" pathLength="1" d={`M${x1} ${y1} L${x2} ${y2} ${ticks}`} style={s()} />
      {vertical ? (
        <text className="lbl dimtxt" x={x1 - 8} y={(y1 + y2) / 2} textAnchor="middle" transform={`rotate(-90 ${x1 - 8} ${(y1 + y2) / 2})`} style={s()}>
          {label}
        </text>
      ) : (
        <text className="lbl dimtxt" x={(x1 + x2) / 2} y={y1 - 6} textAnchor="middle" style={s()}>
          {label}
        </text>
      )}
    </>
  );
}

function Compass({ x, y, s }) {
  return (
    <>
      <circle className="ln" pathLength="1" cx={x} cy={y} r="11" style={s()} />
      <Ln s={s} d={`M${x} ${y - 16} L${x + 4} ${y} L${x} ${y + 16} L${x - 4} ${y} Z`} />
      <Label s={s} x={x} y={y - 20}>N</Label>
    </>
  );
}

/* Modern campus hall: portico, window grid, flat roof (Boston) */
function ModernHall() {
  const s = useCounter();
  const win = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) if (!(r === 2 && c >= 2 && c <= 4)) win.push([92 + c * 30, 92 + r * 30]);
  return (
    <>
      <Ln s={s} cls="ln cons" d="M20 190 H380" />
      <Ln s={s} cls="ln cons" d="M70 60 V200 M330 60 V200" />
      <Ln s={s} d="M30 190 H370" />
      <Ln s={s} d="M80 190 V78 H320 V190" />
      <Ln s={s} d="M72 78 H328 V68 H72 Z" />
      <Ln s={s} d="M150 68 V54 H250 V68" />
      {win.map(([x, y]) => (
        <Ln key={`${x}-${y}`} s={s} d={`M${x} ${y} h18 v18 h-18 Z M${x + 9} ${y} v18`} />
      ))}
      <Ln s={s} d="M146 190 V150 H254 V190" />
      <Ln s={s} d="M146 150 L200 132 L254 150" />
      <Ln s={s} d="M160 190 V156 M180 190 V156 M220 190 V156 M240 190 V156" />
      <Ln s={s} d="M188 190 V166 H212 V190" />
      <Ln s={s} d="M30 190 C30 160 46 150 50 128 C54 150 70 160 70 190 M50 190 V172" />
      <Ln s={s} d="M330 190 C330 162 344 154 350 134 C356 154 370 162 370 190 M350 190 V174" />
      <Dim s={s} x1={80} y1={40} x2={320} y2={40} label="48.0 m" />
      <Dim s={s} vertical x1={390} y1={54} x2={390} y2={190} label="22.5 m" />
      <Compass s={s} x={44} y={42} />
      <Label s={s} x={200} y={212}>ELEVATION A · BOSTON CAMPUS HALL</Label>
    </>
  );
}

/* Heritage main building with clock tower and arched wings (Pune) */
function ClockTower() {
  const s = useCounter();
  const arches = [];
  for (let i = 0; i < 4; i++) arches.push(62 + i * 24, 270 + i * 24);
  return (
    <>
      <Ln s={s} cls="ln cons" d="M20 190 H380" />
      <Ln s={s} cls="ln cons" d="M200 20 V200" />
      <Ln s={s} d="M30 190 H370" />
      <Ln s={s} d="M50 190 V120 H160 V190 M240 190 V120 H350 V190" />
      <Ln s={s} d="M46 120 L105 98 L164 120 M236 120 L295 98 L354 120" />
      {arches.map((x) => (
        <Ln key={x} s={s} d={`M${x} 178 V150 A8 8 0 0 1 ${x + 16} 150 V178`} />
      ))}
      <Ln s={s} d="M160 190 V92 H240 V190" />
      <Ln s={s} d="M178 190 V158 A22 22 0 0 1 222 158 V190" />
      <Ln s={s} d="M170 92 V58 H230 V92" />
      <circle className="ln" pathLength="1" cx="200" cy="74" r="12" style={s()} />
      <Ln s={s} d="M200 74 V65 M200 74 L207 78" />
      <Ln s={s} d="M166 58 L200 18 L234 58" />
      <Ln s={s} d="M200 18 V8" />
      <Ln s={s} d="M172 110 h12 v18 h-12 Z M216 110 h12 v18 h-12 Z" />
      <Dim s={s} x1={50} y1={36} x2={160} y2={36} label="34.0 m" />
      <Dim s={s} vertical x1={378} y1={8} x2={378} y2={190} label="41.0 m" />
      <Compass s={s} x={330} y={42} />
      <Label s={s} x={200} y={212}>ELEVATION B · CLOCK TOWER, MAIN BUILDING</Label>
    </>
  );
}

export default function Blueprint({ kind, play }) {
  return (
    <svg
      className={`bp-svg ${play ? "draw" : ""}`}
      viewBox="0 0 400 222"
      role="img"
      aria-label={kind === "tower" ? "Blueprint sketch of a clock-tower campus building" : "Blueprint sketch of a modern campus hall"}
    >
      {kind === "tower" ? <ClockTower /> : <ModernHall />}
    </svg>
  );
}

/* ───────────────────────────────────────────────────────────────
   System blueprints for the experience section: an architecture
   sketch of what was built at each job. Numbers come from the resume.
   Node kinds: box, db (cylinder), doc (folded page).
   ─────────────────────────────────────────────────────────────── */
const SYSTEMS = {
  centene: {
    title: "SYS-01 · CLAIM SCORING PLATFORM",
    zone: { x: 206, y: 14, w: 108, h: 176, label: "AWS · 99.7% UPTIME" },
    nodes: [
      { id: "claims", kind: "doc", x: 10, y: 34, w: 74, h: 40, label: "Claims", sub: "ICD / CPT" },
      { id: "members", kind: "db", x: 10, y: 122, w: 74, h: 44, label: "Members", sub: "policy data" },
      { id: "spark", kind: "box", x: 112, y: 78, w: 76, h: 42, label: "Spark + SQL", sub: "8h → 90m" },
      { id: "score", kind: "box", x: 216, y: 30, w: 88, h: 46, label: "FastAPI score", sub: "XGBoost +28%" },
      { id: "rag", kind: "box", x: 216, y: 120, w: 88, h: 46, label: "RAG search", sub: "FAISS·Pinecone" },
      { id: "team", kind: "box", x: 328, y: 78, w: 64, h: 42, label: "Adjusters", sub: "queue −40%" },
    ],
    edges: [["claims", "spark"], ["members", "spark"], ["spark", "score"], ["spark", "rag"], ["score", "team"], ["rag", "team"]],
  },
  capgemini: {
    title: "SYS-02 · REAL-TIME RISK SCORING",
    zone: { x: 10, y: 176, w: 380, h: 20, label: "CI/CD · 6 SERVICES · 2W → 3D", band: true },
    nodes: [
      { id: "tx", kind: "doc", x: 10, y: 26, w: 76, h: 40, label: "Transactions", sub: "10K+/min" },
      { id: "cases", kind: "db", x: 10, y: 110, w: 76, h: 46, label: "Case data", sub: "siloed" },
      { id: "risk", kind: "box", x: 132, y: 26, w: 84, h: 40, label: "Risk engine", sub: "C++ · Python" },
      { id: "llm", kind: "box", x: 132, y: 112, w: 84, h: 42, label: "RAG + LLaMA", sub: "docs −50%" },
      { id: "api", kind: "box", x: 242, y: 68, w: 70, h: 42, label: "REST API", sub: "OAuth 2.0" },
      { id: "dash", kind: "box", x: 328, y: 68, w: 62, h: 42, label: "Analysts", sub: "dashboards" },
    ],
    edges: [["tx", "risk", "<200 ms"], ["cases", "llm"], ["risk", "api"], ["llm", "api"], ["api", "dash"]],
  },
  pharmapro: {
    title: "SYS-03 · MEDICAL DATA ETL",
    nodes: [
      { id: "pdf", kind: "doc", x: 10, y: 16, w: 68, h: 38, label: "PDFs", sub: "unstructured" },
      { id: "web", kind: "box", x: 10, y: 78, w: 68, h: 40, label: "Web", sub: "scraped" },
      { id: "rec", kind: "db", x: 10, y: 136, w: 68, h: 44, label: "Records", sub: "internal" },
      { id: "etl", kind: "box", x: 124, y: 78, w: 86, h: 40, label: "Python ETL", sub: "2h → 10 min" },
      { id: "clean", kind: "db", x: 240, y: 74, w: 68, h: 48, label: "Clean set", sub: "validated" },
      { id: "ceo", kind: "box", x: 330, y: 78, w: 62, h: 40, label: "CEO", sub: "insights" },
    ],
    edges: [["pdf", "etl"], ["web", "etl"], ["rec", "etl"], ["etl", "clean"], ["clean", "ceo"]],
  },
};

function shapePath(n) {
  const { x, y, w, h } = n;
  if (n.kind === "db") {
    const ry = 6;
    return `M${x} ${y + ry} A${w / 2} ${ry} 0 0 1 ${x + w} ${y + ry} A${w / 2} ${ry} 0 0 1 ${x} ${y + ry} V${y + h - ry} A${w / 2} ${ry} 0 0 0 ${x + w} ${y + h - ry} V${y + ry}`;
  }
  if (n.kind === "doc") {
    const f = 9;
    return `M${x} ${y} H${x + w - f} L${x + w} ${y + f} V${y + h} H${x} Z M${x + w - f} ${y} V${y + f} H${x + w}`;
  }
  return `M${x + 3} ${y} H${x + w - 3} Q${x + w} ${y} ${x + w} ${y + 3} V${y + h - 3} Q${x + w} ${y + h} ${x + w - 3} ${y + h} H${x + 3} Q${x} ${y + h} ${x} ${y + h - 3} V${y + 3} Q${x} ${y} ${x + 3} ${y} Z`;
}

function edgePath(a, b) {
  const sx = a.x + a.w, sy = a.y + a.h / 2;
  const ex = b.x - 4, ey = b.y + b.h / 2;
  const mx = Math.round((sx + ex) / 2);
  return { d: sy === ey ? `M${sx} ${sy} H${ex}` : `M${sx} ${sy} H${mx} V${ey} H${ex}`, ex, ey, mx, sy };
}

export function SystemBlueprint({ system, play }) {
  const spec = SYSTEMS[system];
  const s = useCounter();
  if (!spec) return null;
  const byId = Object.fromEntries(spec.nodes.map((n) => [n.id, n]));
  const edges = spec.edges.map(([a, b, label]) => ({ ...edgePath(byId[a], byId[b]), label }));
  return (
    <svg className={`bp-svg sys ${play ? "draw" : ""}`} viewBox="0 0 400 222" role="img" aria-label={`Architecture sketch: ${spec.title}`}>
      {spec.zone && (
        <>
          <rect className="ln cons" x={spec.zone.x} y={spec.zone.y} width={spec.zone.w} height={spec.zone.h} rx="6" />
          <text className="lbl dimtxt" x={spec.zone.x + spec.zone.w / 2} y={spec.zone.band ? spec.zone.y + 13 : spec.zone.y + spec.zone.h + 11} textAnchor="middle" style={s()}>
            {spec.zone.label}
          </text>
        </>
      )}
      {spec.nodes.map((n) => (
        <g key={n.id}>
          <path className="ln" pathLength="1" d={shapePath(n)} style={s()} />
          <text className="lbl node-l" x={n.x + n.w / 2} y={n.y + n.h / 2 + (n.kind === "db" ? 2 : -1)} textAnchor="middle" style={s()}>
            {n.label}
          </text>
          <text className="lbl node-s" x={n.x + n.w / 2} y={n.y + n.h / 2 + (n.kind === "db" ? 14 : 12)} textAnchor="middle" style={s()}>
            {n.sub}
          </text>
        </g>
      ))}
      {edges.map((e, i) => (
        <g key={i}>
          <path className="ln dim" pathLength="1" d={`${e.d} M${e.ex - 5} ${e.ey - 3} L${e.ex} ${e.ey} L${e.ex - 5} ${e.ey + 3}`} style={s()} />
          {e.label && (
            <text className="lbl dimtxt" x={e.mx} y={e.sy - 5} textAnchor="middle" style={s()}>
              {e.label}
            </text>
          )}
        </g>
      ))}
      {play && (
        <g className="packets">
          {edges.map((e, i) => (
            <circle key={i} r="2.4" className="pk">
              <animateMotion dur={`${1.6 + (i % 3) * 0.4}s`} begin={`${(i * 0.37) % 1.5}s`} repeatCount="indefinite" path={e.d} />
            </circle>
          ))}
        </g>
      )}
      <text className="lbl" x="200" y="214" textAnchor="middle" style={s()}>
        {spec.title}
      </text>
    </svg>
  );
}
