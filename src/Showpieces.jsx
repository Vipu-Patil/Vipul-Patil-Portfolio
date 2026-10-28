import React, { useEffect, useRef, useState } from "react";

/* Shared helpers ------------------------------------------------ */
export const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useOnScreen(threshold = 0.25) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, on];
}

/* Rotating, typed word in the hero headline ---------------------- */
export function RotatingWord({ words, hold = 1800 }) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(words[0].length);
  const [del, setDel] = useState(false);
  useEffect(() => {
    if (prefersReduced()) return;
    const word = words[i];
    let t;
    if (!del && n === word.length) t = setTimeout(() => setDel(true), hold);
    else if (del && n === 0) {
      setDel(false);
      setI((i + 1) % words.length);
    } else t = setTimeout(() => setN(n + (del ? -1 : 1)), del ? 35 : 70);
    return () => clearTimeout(t);
  }, [n, del, i, words, hold]);
  return (
    <span className="rot" aria-label={words.join(", ")}>
      <span className="rot-text" aria-hidden="true">
        {words[i].slice(0, n)}
        <span className="rot-caret" />
      </span>
    </span>
  );
}

/* Scroll progress bar, trailing cursor ring, magnetic buttons ------ */
export function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - innerHeight;
        if (ref.current) ref.current.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
      });
    };
    on();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => {
      removeEventListener("scroll", on);
      removeEventListener("resize", on);
    };
  }, []);
  return <div className="progress" aria-hidden="true"><span ref={ref} /></div>;
}

export function CursorRing() {
  const ring = useRef(null);
  const dot = useRef(null);
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || prefersReduced()) return;
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0;
    const move = (e) => {
      x = e.clientX;
      y = e.clientY;
      const hot = e.target.closest && e.target.closest("a, button, .chip, input, .project, .bp-card");
      ring.current?.classList.toggle("hot", !!hot);
      document.body.classList.add("has-ring");
    };
    const down = () => ring.current?.classList.add("press");
    const up = () => ring.current?.classList.remove("press");
    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px)`;
      if (dot.current) dot.current.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(tick);
    };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", down);
    addEventListener("pointerup", up);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", down);
      removeEventListener("pointerup", up);
    };
  }, []);
  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  );
}

export function useMagnetic() {
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || prefersReduced()) return;
    let last = null;
    const move = (e) => {
      const el = e.target.closest && e.target.closest(".btn, .repo, .theme-btn");
      if (last && last !== el) {
        last.style.transform = "";
        last = null;
      }
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
      last = el;
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, []);
}

/* Infinite marquee -------------------------------------------------- */
export function Marquee({ items, reverse, speed = 40, className = "" }) {
  const row = items.map((t, i) => (
    <span className="mq-item" key={i}>
      {t}
      <span className="mq-sep" aria-hidden="true">✦</span>
    </span>
  ));
  return (
    <div className={`marquee ${reverse ? "rev" : ""} ${className}`} style={{ "--mq-speed": `${speed}s` }}>
      <div className="mq-track">
        <div className="mq-group">{row}</div>
        <div className="mq-group" aria-hidden="true">{row}</div>
      </div>
    </div>
  );
}

/* Count-up numbers -------------------------------------------------- */
export function CountUp({ value }) {
  const [ref, on] = useOnScreen(0.4);
  const m = String(value).match(/^([^\d]*)([\d.,]+)(.*)$/);
  const single = m && (String(value).match(/\d+(\.\d+)?/g) || []).length === 1;
  const [shown, setShown] = useState(single && !prefersReduced() ? `${m[1]}0${m[3]}` : value);
  const done = useRef(false);
  useEffect(() => {
    if (!on || done.current || !single || prefersReduced()) return;
    done.current = true;
    const target = parseFloat(m[2].replace(/,/g, ""));
    const dec = (m[2].split(".")[1] || "").length;
    const t0 = performance.now();
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / 1400);
      const e = 1 - Math.pow(1 - k, 3);
      setShown(`${m[1]}${(target * e).toFixed(dec)}${m[3]}`);
      if (k < 1) raf = requestAnimationFrame(tick);
      else setShown(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <span ref={ref} className={`count ${on ? "on" : ""}`} aria-label={value}>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}

/* Live mini-demos for the role console ------------------------------ */
const ENDPOINTS = ["POST /v1/score", "POST /v1/score", "GET /v1/claims/:id", "POST /v1/validate", "GET /health"];
export function ApiLog({ running }) {
  const [lines, setLines] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({ id: i, ep: ENDPOINTS[i % ENDPOINTS.length], ms: 40 + i * 17, code: 200 }))
  );
  const [tpm, setTpm] = useState(10412);
  useEffect(() => {
    if (!running || prefersReduced()) return;
    const t = setInterval(() => {
      setLines((ls) => {
        const id = ls[ls.length - 1].id + 1;
        const ep = ENDPOINTS[(Math.random() * ENDPOINTS.length) | 0];
        const ms = ep.includes("health") ? 3 + ((Math.random() * 5) | 0) : 28 + ((Math.random() * 160) | 0);
        return [...ls.slice(-6), { id, ep, ms, code: Math.random() < 0.04 ? 429 : 200 }];
      });
      setTpm((v) => Math.max(10010, Math.min(10990, v + (((Math.random() - 0.5) * 140) | 0))));
    }, 650);
    return () => clearInterval(t);
  }, [running]);
  return (
    <div className="demo api">
      <div className="demo-head mono">
        <span>scoring-service · live</span>
        <span className="demo-kpi">{tpm.toLocaleString()} tx/min</span>
      </div>
      <ul className="api-lines mono">
        {lines.map((l) => (
          <li key={l.id}>
            <span className="api-ep">{l.ep}</span>
            <span className={`api-code ${l.code !== 200 ? "warn" : ""}`}>{l.code}</span>
            <span className="api-ms">
              <span className="api-bar" style={{ width: `${Math.max(4, Math.min(64, l.ms / 3))}px` }} />
              {l.ms} ms
            </span>
          </li>
        ))}
      </ul>
      <p className="demo-foot mono">p99 under 200 ms · 99.7% uptime · auto-rollback armed</p>
    </div>
  );
}

const STAGES = ["lint", "test", "build", "scan", "deploy"];
export function PipelineRun({ running }) {
  const [k, setK] = useState(2.4);
  useEffect(() => {
    if (!running || prefersReduced()) return;
    const t = setInterval(() => setK((v) => (v >= STAGES.length + 1.5 ? 0 : v + 0.1)), 90);
    return () => clearInterval(t);
  }, [running]);
  return (
    <div className="demo pipe">
      <div className="demo-head mono">
        <span>release #482 · 6 services</span>
        <span className="demo-kpi">{k >= STAGES.length ? "shipped ✓" : "running…"}</span>
      </div>
      <ol className="stages">
        {STAGES.map((s, i) => {
          const p = Math.max(0, Math.min(1, k - i));
          return (
            <li key={s} className={p >= 1 ? "done" : p > 0 ? "run" : ""}>
              <span className="st-dot">{p >= 1 ? "✓" : ""}</span>
              <span className="st-name mono">{s}</span>
              <span className="st-bar"><span style={{ width: `${p * 100}%` }} /></span>
            </li>
          );
        })}
      </ol>
      <p className="demo-foot mono">GitHub Actions · Docker · release cycle 2 weeks → 3 days</p>
    </div>
  );
}

const ANSWER =
  "Claim #88213 matches 3 prior cases with the same provider billing pattern. Similar claims were confirmed fraud in 2 of 3 reviews. Recommend manual review before payment.";
const HITS = [
  { doc: "case_4471 · duplicate billing", s: 0.91 },
  { doc: "policy §12.3 · upcoding", s: 0.86 },
  { doc: "case_2208 · same provider", s: 0.82 },
];
export function RagStream({ running }) {
  const words = ANSWER.split(" ");
  const [n, setN] = useState(10);
  useEffect(() => {
    if (!running || prefersReduced()) {
      setN(words.length);
      return;
    }
    const t = setInterval(() => setN((v) => (v >= words.length + 14 ? 0 : v + 1)), 120);
    return () => clearInterval(t);
  }, [running, words.length]);
  const retrieving = n < 4;
  return (
    <div className="demo rag">
      <div className="demo-head mono">
        <span>claims-research · RAG</span>
        <span className="demo-kpi">{retrieving ? "retrieving…" : "grounded ✓"}</span>
      </div>
      <p className="rag-q mono">
        <span className="rag-prompt">ask&gt;</span> is claim #88213 similar to known fraud?
      </p>
      <ul className="rag-hits mono">
        {HITS.map((h, i) => (
          <li key={h.doc}>
            <span className="rag-doc">{h.doc}</span>
            <span className="rag-bar"><span style={{ width: retrieving ? "0%" : `${h.s * 100}%`, transitionDelay: `${i * 120}ms` }} /></span>
            <span className="rag-s">{h.s.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <p className="rag-a">
        {words.slice(0, Math.max(0, n - 3)).join(" ")}
        {n - 3 < words.length && <span className="rot-caret" />}
      </p>
      <p className="demo-foot mono">illustrative sample · embeddings + FAISS/Pinecone + LLM</p>
    </div>
  );
}

/* Project showcase demos ------------------------------------------- */
const TRACE = [
  { t: "cmd", s: "$ incidentiq investigate INC-2041" },
  { t: "step", s: "▸ retrieve runbooks · pgvector top_k=3" },
  { t: "ok", s: "  ✓ api-latency-spike.md (0.91)" },
  { t: "step", s: '▸ tool: query_logs(service="checkout", since="15m")' },
  { t: "ok", s: "  ✓ 1,284 lines · 5xx spike at 14:02" },
  { t: "step", s: '▸ tool: get_metrics("p95_latency")' },
  { t: "ok", s: "  ✓ 180 ms → 2.4 s after deploy" },
  { t: "step", s: "▸ tool: list_deployments()" },
  { t: "ok", s: "  ✓ v2.8.1 rolled out at 14:00" },
  { t: "guard", s: "▸ guard: prompt-injection scan · clean" },
  { t: "result", s: "● root cause: v2.8.1 connection-pool regression" },
  { t: "dim", s: "  confidence 0.87 · evidence: logs, metrics, deploys" },
];
export function AgentTrace() {
  const [ref, on] = useOnScreen(0.3);
  const [n, setN] = useState(prefersReduced() ? TRACE.length : 1);
  useEffect(() => {
    if (!on || prefersReduced()) return;
    const t = setInterval(() => setN((v) => (v >= TRACE.length + 6 ? 1 : v + 1)), 520);
    return () => clearInterval(t);
  }, [on]);
  return (
    <div ref={ref} className="showcase-demo trace mono" aria-label="Illustrative IncidentIQ investigation trace">
      <div className="win-bar"><i /><i /><i /><span>agent trace · LangSmith</span></div>
      <ol className="trace-lines">
        {TRACE.slice(0, Math.min(n, TRACE.length)).map((l, i) => (
          <li key={i} className={`tr-${l.t}`}>{l.s}</li>
        ))}
        {n < TRACE.length && <li className="tr-cursor"><span className="rot-caret" /></li>}
      </ol>
      <span className="demo-note">illustrative run</span>
    </div>
  );
}

const FORM = [
  { label: "Account no.", value: "4401-2291-07", sel: "frame[main] > input#acct" },
  { label: "Payee", value: "ACME Medical LLC", sel: "frame[main] > input#payee" },
  { label: "Amount", value: "$12,480.00", sel: "frame[main] > input#amt" },
];
export function BrowserDemo() {
  const [ref, on] = useOnScreen(0.3);
  const [k, setK] = useState(prefersReduced() ? 40 : 0);
  useEffect(() => {
    if (!on || prefersReduced()) return;
    const t = setInterval(() => setK((v) => (v >= 46 ? 0 : v + 1)), 160);
    return () => clearInterval(t);
  }, [on]);
  // timeline: each field takes 9 ticks (move 3, verify 2, type 4); then approval; then replay
  const field = Math.min(FORM.length, Math.floor(k / 9));
  const local = k % 9;
  const approval = k >= 28;
  const approved = k >= 34;
  const saved = k >= 38;
  const cur = Math.min(field, FORM.length - 1);
  const cursorTop = approval ? 84 : 26 + cur * 22;
  const cursorLeft = approval ? 70 : 62;
  return (
    <div ref={ref} className="showcase-demo browser" aria-label="Illustrative browser automation demo">
      <div className="win-bar mono"><i /><i /><i /><span className="url">legacy-bank.example/ops/frames.jsp</span></div>
      <div className="bw-body">
        <div className="bw-side mono">
          <p>MENU</p>
          <p className="on">Payments</p>
          <p>Accounts</p>
          <p>Reports</p>
        </div>
        <div className="bw-form">
          <p className="bw-title">Wire transfer · step 2 of 3</p>
          {FORM.map((f, i) => {
            const typed = i < field ? f.value : i === field && !approval && local >= 5 ? f.value.slice(0, Math.ceil(((local - 4) / 4) * f.value.length)) : "";
            const verifying = i === field && !approval && local >= 3 && local < 5;
            return (
              <label key={f.label} className={`bw-row ${verifying ? "verify" : ""} ${i < field ? "filled" : ""}`}>
                <span>{f.label}</span>
                <span className="bw-input mono">{typed}</span>
                {verifying && <span className="bw-tag mono">✓ verified {f.sel}</span>}
              </label>
            );
          })}
          <div className={`bw-approve ${approval ? "show" : ""} ${approved ? "ok" : ""}`}>
            <span className="mono">{approved ? "✓ approved by ops reviewer" : "⏸ human approval required · amount > $10k"}</span>
          </div>
          <div className={`bw-saved mono ${saved ? "show" : ""}`}>↺ workflow saved · deterministic replay #31</div>
        </div>
        <span className="bw-cursor" style={{ top: `${cursorTop}%`, left: `${cursorLeft}%` }} aria-hidden="true" />
      </div>
      <span className="demo-note">illustrative run</span>
    </div>
  );
}

/* 3D tilt toward the cursor, with a moving glare, for any [data-tilt] element */
export function useTilt3D() {
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || prefersReduced()) return;
    let cur = null;
    const reset = (el) => {
      el.style.transform = "";
      el.classList.remove("tilting");
    };
    const move = (e) => {
      const el = e.target.closest && e.target.closest("[data-tilt]");
      if (cur && cur !== el) reset(cur);
      cur = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      const max = parseFloat(el.dataset.tilt) || 8;
      el.style.transform = `perspective(900px) rotateX(${((0.5 - py) * max).toFixed(2)}deg) rotateY(${((px - 0.5) * max).toFixed(2)}deg) translateZ(0)`;
      el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
      el.classList.add("tilting");
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, []);
}
