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
