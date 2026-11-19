import React, { useEffect, useMemo, useRef, useState } from "react";
import { profile, pillars, metrics, experience, projects, skills, education } from "./data.js";
import photo from "./assets/vipul.jpg";
import Field from "./Field.jsx";
import { ArrowUpRight, ArrowLeft, ArrowRight } from "./Icons.jsx";
import ContactForm from "./ContactForm.jsx";
import SkillGlobe from "./SkillGlobe.jsx";
import Blueprint, { SystemBlueprint } from "./Blueprint.jsx";
import {
  ApiLog, PipelineRun, RagStream, AgentTrace, BrowserDemo, useOnScreen, prefersReduced,
  useTilt3D, Stack3D, Stage3D, MOVIE_TRACE, RAG_TRACE, useCarousel,
} from "./Showpieces.jsx";

/* ───────── Tiny in-browser retriever (TF-IDF + cosine) ───────── */
const STOP = new Set(
  "a an and are as at be by for from has have i in into is it its me my of on or our over that the their this to was what where which who with you your do did does how can about any".split(" ")
);
const tokenize = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9+#\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w))
    .map((w) => (w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w));

function buildIndex() {
  const chunks = [
    { source: "Summary", text: profile.summary },
    ...experience.flatMap((e) => e.bullets.map((b) => ({ source: `${e.role} · ${e.company}`, text: b }))),
    ...projects.flatMap((p) => p.bullets.map((b) => ({ source: `Project · ${p.name}`, text: b, extra: p.stack.join(" ") }))),
    ...education.map((ed) => ({ source: "Education", text: `${ed.degree}, ${ed.school} (${ed.location}), ${ed.start} – ${ed.end}.`, extra: "masters degree school university graduated study" })),
    ...skills.map((g) => ({ source: `Skills · ${g.group}`, text: `${g.group}: ${g.items.join(", ")}` })),
    ...pillars.flatMap((p) => p.proof.map((t) => ({ source: `What I do · ${p.role}`, text: t, extra: `${p.role} ${p.line}` }))),
  ];
  const docs = chunks.map((c) => tokenize(`${c.text} ${c.extra || ""}`));
  const df = new Map();
  docs.forEach((d) => new Set(d).forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
  const N = docs.length;
  const idf = (t) => Math.log((N + 1) / ((df.get(t) || 0) + 1)) + 1;
  const vec = (toks) => {
    const tf = new Map();
    toks.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
    const v = new Map();
    let norm = 0;
    tf.forEach((n, t) => {
      const w = n * idf(t);
      v.set(t, w);
      norm += w * w;
    });
    return { v, norm: Math.sqrt(norm) || 1 };
  };
  const vecs = docs.map(vec);
  return (query) => {
    const q = vec(tokenize(query));
    return chunks
      .map((c, i) => {
        let dot = 0;
        q.v.forEach((w, t) => {
          const dw = vecs[i].v.get(t);
          if (dw) dot += w * dw;
        });
        return { ...c, score: dot / (q.norm * vecs[i].norm) };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };
}


/* ───────── helpers ───────── */
const lit = (tags, active) => (!active ? "" : tags.includes(active) ? "is-lit" : "is-dim");

// Bold the measurable part of a sentence: 40%, 10K+, 200 ms, 2 weeks, 8 hours ...
const NUM = /((?:[<>~+−]\s?)?\d[\d,.]*(?:\s?(?:%|K\+|K\b|ms\b|hours?\b|minutes?\b|weeks?\b|days?\b|s\b(?= [A-Z]?[a-z]*\s?(?:OpenAI|timeout|boundary|window)))|\+(?=\s?coverage))(?:\s?(?:→|to)\s?(?:under\s)?\d[\d,.]*\s?(?:%|ms|hours?|minutes?|min|weeks?|days?))?)/g;
function Emph({ text }) {
  const parts = text.split(NUM);
  return parts.map((p, i) => (i % 2 && /\d/.test(p) && !/^\d{4}$/.test(p.trim()) ? <b key={i}>{p}</b> : p));
}

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* Words cross-fade with a short blur (masks the swap so it reads as one change) */
function RotWord({ words, every = 2600 }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (prefersReduced()) return;
    const t = setInterval(() => setI((v) => (v + 1) % words.length), every);
    return () => clearInterval(t);
  }, [words.length, every]);
  return (
    <span className="rw" aria-hidden="true">
      {words.map((w, j) => (
        <span key={w} className={`rw-w ${j === i ? "on" : ""}`}>{w}</span>
      ))}
    </span>
  );
}

/* ───────── theme ───────── */
function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("vp-theme") || "";
    } catch {
      return "";
    }
  });
  useEffect(() => {
    const root = document.documentElement;
    theme ? root.setAttribute("data-theme", theme) : root.removeAttribute("data-theme");
    try {
      theme ? localStorage.setItem("vp-theme", theme) : localStorage.removeItem("vp-theme");
    } catch {}
  }, [theme]);
  const isDark = () => (theme ? theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches);
  return [isDark, () => setTheme(isDark() ? "light" : "dark")];
}

const SECTIONS = [
  ["what", "What I do"],
  ["work", "Experience"],
  ["projects", "Projects"],
  ["skills", "Skills"],
  ["education", "Education"],
  ["contact", "Contact"],
];

function useActiveSection() {
  const [cur, setCur] = useState("");
  useEffect(() => {
    const els = SECTIONS.map(([id]) => document.getElementById(id)).filter(Boolean);
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (ens) => ens.forEach((en) => en.isIntersecting && setCur(en.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return cur;
}

function Nav() {
  const [isDark, toggle] = useTheme();
  const [, force] = useState(0);
  const cur = useActiveSection();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(scrollY > 8);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="wrap nav-inner">
        <a href="#top" className="wordmark" aria-label="Vipul Patil, back to top">
          <span className="wm-dot" aria-hidden="true" />
          Vipul Patil
        </a>
        <nav className="nav-links" aria-label="Sections">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={cur === id ? "on" : ""} aria-current={cur === id ? "true" : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <button
          className="icon-btn"
          onClick={() => {
            toggle();
            force((n) => n + 1);
          }}
          aria-label={isDark() ? "Switch to light mode" : "Switch to dark mode"}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {isDark() ? (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </>
            ) : (
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}

/* ───────── hero ───────── */
function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1 className="hero-title" aria-label={`${profile.name} builds backends, automation and AI that run in production.`}>
            <span className="ln"><span>{profile.name} builds</span></span>
            <span className="ln"><span><RotWord words={profile.rotating} /></span></span>
            <span className="ln"><span>that run in production.</span></span>
          </h1>
          <p className="hero-lede enter" style={{ "--e": "420ms" }}>{profile.summary}</p>
          <div className="hero-actions enter" style={{ "--e": "520ms" }}>
            <a className="btn primary" href="#work">See my work</a>
            <a className="btn" href="#contact">Get in touch</a>
            <span className="hero-links">
              {profile.links.map((l) => (
                <a key={l.label} className="tlink" href={l.url} target="_blank" rel="noreferrer">
                  {l.label} <ArrowUpRight />
                </a>
              ))}
            </span>
          </div>
        </div>
        <figure className="hero-photo enter" style={{ "--e": "200ms" }} data-tilt="3">
          <img src={photo} alt={`Portrait of ${profile.name}`} width="480" height="600" />
          <span className="now mono">
            <i aria-hidden="true" /> {profile.currently}
          </span>
        </figure>
      </div>
      <div className="wrap">
        <dl className="ledger enter" style={{ "--e": "640ms" }}>
          {profile.modelCard
            .filter((r) => !["model", "known limitation"].includes(r.k))
            .map((r) => (
              <div key={r.k}>
                <dt className="mono">{r.k}</dt>
                <dd>{r.v}</dd>
              </div>
            ))}
        </dl>
      </div>
    </section>
  );
}

/* ───────── section shell (heading in a left rail on wide screens) ───────── */
function Sec({ id, title, note, children, wide, aside }) {
  return (
    <section className={`sec ${wide ? "wide" : "split"}`} id={id} aria-labelledby={`${id}-h`}>
      <div className="wrap sec-grid">
        <header className="sec-head" data-reveal>
          <h2 id={`${id}-h`}>{title}</h2>
          {note && <p className="sec-note">{note}</p>}
          {aside}
        </header>
        <div className="sec-body">{children}</div>
      </div>
    </section>
  );
}

/* ───────── what I do ───────── */
const DEMOS = [ApiLog, PipelineRun, RagStream];
function WhatIDo() {
  const [k, setK] = useState(0);
  const [auto, setAuto] = useState(true);
  const [ref, on] = useOnScreen(0.2);
  useEffect(() => {
    if (!auto || !on || prefersReduced()) return;
    const t = setTimeout(() => setK((v) => (v + 1) % pillars.length), 8000);
    return () => clearTimeout(t);
  }, [k, auto, on]);
  const p = pillars[k];
  const Demo = DEMOS[k] || ApiLog;
  return (
    <Sec id="what" title="What I do" note="Three kinds of work, one habit: ship it, then measure it. Pick one to see a system like it running.">
      <div ref={ref} className="roles" data-reveal>
        <div className="role-tabs" role="tablist" aria-label="Roles">
          {pillars.map((x, i) => (
            <button
              key={x.role}
              role="tab"
              id={`role-tab-${i}`}
              aria-selected={i === k}
              aria-controls="role-panel"
              className={`role-tab ${i === k ? "on" : ""}`}
              onClick={() => {
                setK(i);
                setAuto(false);
              }}
            >
              <span className="rt-name">{x.role}</span>
              <span className="rt-line">{x.line}</span>
              {i === k && auto && on && <span className="rt-timer" key={`t${k}`} aria-hidden="true" />}
            </button>
          ))}
        </div>
        <div className="role-panel" role="tabpanel" id="role-panel" aria-labelledby={`role-tab-${k}`} key={k}>
          <ul className="proof">
            {p.proof.map((t, j) => (
              <li key={t} style={{ "--j": j }}>
                <Emph text={t} />
              </li>
            ))}
          </ul>
          <div className="demo-wrap">
            <Demo running={on} />
          </div>
        </div>
      </div>
    </Sec>
  );
}

/* ───────── experience as case studies ───────── */
function CaseStudy({ e, i, active }) {
  const [ref, inView] = useInView(0.1);
  const [open, setOpen] = useState(false);
  const outcomes = metrics.filter((m) => m.where.endsWith(e.company.split(" ")[0]));
  const lead = e.bullets.slice(0, 2);
  const rest = e.bullets.slice(2);
  return (
    <article ref={ref} className={`case ${lit(e.tags, active)}`} data-reveal>
      <div className="case-meta mono">
        <span>{e.start} – {e.end}</span>
        <span>{e.location}</span>
      </div>
      <h3 className="case-title">
        {e.role} <span className="at">at</span> {e.company}
      </h3>
      <p className="case-blurb">{e.blurb}</p>
      {outcomes.length > 0 && (
        <dl className="outcomes">
          {outcomes.map((m) => (
            <div key={m.label}>
              <dt>{m.value}</dt>
              <dd>{m.label}</dd>
            </div>
          ))}
        </dl>
      )}
      {e.system && (
        <div className="plate" data-tilt="2">
          <Stack3D className="sys3d" render={() => <SystemBlueprint system={e.system} play={inView} />} />
          {e.stamp && <span className="plate-stamp mono" aria-hidden="true">{e.stamp}</span>}
        </div>
      )}
      <ul className="case-points">
        {lead.map((b) => (
          <li key={b}><Emph text={b} /></li>
        ))}
      </ul>
      {rest.length > 0 && (
        <>
          <div className={`more ${open ? "open" : ""}`} id={`more-${i}`}>
            <div>
              <ul className="case-points">
                {rest.map((b, j) => (
                  <li key={b} style={{ "--j": j }}><Emph text={b} /></li>
                ))}
              </ul>
            </div>
          </div>
          <button className="more-btn" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={`more-${i}`}>
            {open ? "Show less" : `Show ${rest.length} more`}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </>
      )}
      <ul className="tags" aria-label="Skills used">
        {e.tags.map((t) => (
          <li key={t} className={t === active ? "on" : ""}>{t}</li>
        ))}
      </ul>
    </article>
  );
}

function Experience({ active }) {
  return (
    <Sec id="work" title="Experience" note="Healthcare claims, financial risk and medical data: systems that real teams relied on.">
      <div className="cases">
        {experience.map((e, i) => (
          <CaseStudy key={e.company} e={e} i={i} active={active} />
        ))}
      </div>
    </Sec>
  );
}

/* ───────── projects: one row, scroll sideways ───────── */
function ProjectCard({ p, i, active }) {
  return (
    <article className={`proj ${lit(p.tags, active)}`}>
      {p.demo && (
        <Stage3D flip={i % 2 === 1}>
          {p.demo === "trace" ? (
            <AgentTrace />
          ) : p.demo === "movie" ? (
            <AgentTrace lines={MOVIE_TRACE} title="GET /api/fact · server log" label="Illustrative Movie Memory request log" />
          ) : p.demo === "rag" ? (
            <AgentTrace lines={RAG_TRACE} title="RAG pipeline · request log" label="Illustrative healthcare RAG request log" />
          ) : (
            <BrowserDemo />
          )}
        </Stage3D>
      )}
      <div className="proj-copy">
        <div className="proj-meta mono">
          <span>{p.date}</span>
          {i === 0 && <span className="badge">Latest</span>}
        </div>
        <h3>{p.name}</h3>
        <p className="proj-kicker">{p.kicker}</p>
        <ul className="proj-points">
          {p.bullets.map((b) => (
            <li key={b}><Emph text={b} /></li>
          ))}
        </ul>
        <div className="proj-foot">
          <ul className="tags" aria-label="Built with">
            {p.stack.map((t) => (
              <li key={t} className={active && t.includes(active) ? "on" : ""}>{t}</li>
            ))}
          </ul>
          {p.url && (
            <a className="tlink strong" href={p.url} target="_blank" rel="noreferrer">
              View code <ArrowUpRight />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function Projects({ active }) {
  const { track, idx, edges, go } = useCarousel(projects.length);
  const controls = (
    <div className="car-ctrl">
      <span className="car-count mono" aria-live="polite">
        {String(idx + 1).padStart(2, "0")} <span>/ {String(projects.length).padStart(2, "0")}</span>
      </span>
      <button type="button" className="icon-btn" onClick={() => go(idx - 1)} disabled={edges.start} aria-label="Previous project">
        <ArrowLeft />
      </button>
      <button type="button" className="icon-btn" onClick={() => go(idx + 1)} disabled={edges.end} aria-label="Next project">
        <ArrowRight />
      </button>
    </div>
  );
  return (
    <Sec id="projects" wide title="Projects" note="Things I built on my own time. Scroll sideways or use the arrows; each runs an illustrative demo." aside={controls}>
      <div className="track" ref={track} tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Projects" data-reveal>
        {projects.map((p, i) => (
          <ProjectCard key={p.name} p={p} i={i} active={active} />
        ))}
      </div>
      <div className="car-dots" role="tablist" aria-label="Choose a project">
        {projects.map((p, i) => (
          <button key={p.name} type="button" role="tab" aria-selected={i === idx} aria-label={p.name} className={i === idx ? "on" : ""} onClick={() => go(i)} />
        ))}
      </div>
    </Sec>
  );
}

/* ───────── skills ───────── */
function Skills({ active, setActive }) {
  const usedIn = useMemo(() => {
    if (!active) return [];
    return [
      ...experience.filter((e) => e.tags.includes(active)).map((e) => `${e.company}`),
      ...projects.filter((p) => p.tags.includes(active)).map((p) => p.name),
    ];
  }, [active]);
  return (
    <Sec id="skills" title="Skills" note="Drag the globe, or pick any skill. The jobs and projects that used it light up on the page.">
      <div className="skills" data-reveal>
        <div className="globe-col">
          <SkillGlobe groups={skills} active={active} onPick={setActive} />
          <p className="used-in" aria-live="polite">
            {active ? (
              <>
                <b>{active}</b>
                {usedIn.length ? <> · used at {usedIn.join(", ")}</> : <> · in my toolkit</>}
                <button className="tlink" onClick={() => setActive("")}>Clear</button>
              </>
            ) : (
              <span>No skill selected</span>
            )}
          </p>
        </div>
        <div className="skill-lists">
          {skills.map((g) => (
            <div key={g.group} className="skill-group">
              <h3>{g.group}</h3>
              <ul>
                {g.items.map((s) => (
                  <li key={s}>
                    <button className={`chip ${active === s ? "on" : ""}`} aria-pressed={active === s} onClick={() => setActive(active === s ? "" : s)}>
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Sec>
  );
}

/* ───────── ask my résumé ───────── */
const SUGGESTIONS = ["backend APIs and latency", "automation and CI/CD", "AI agents", "fraud detection", "RAG and vector search", "education"];
function AskMyResume() {
  const search = useMemo(buildIndex, []);
  const [q, setQ] = useState("fraud detection");
  const results = useMemo(() => (q.trim() ? search(q) : []), [q, search]);
  return (
    <Sec id="ask" wide title="Ask my résumé" note="A small TF-IDF retriever that runs in your browser and returns the three closest lines.">
      <div className="ask" data-reveal>
        <label className="ask-input" htmlFor="ask-query">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span className="sr">Search my résumé</span>
          <input id="ask-query" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try evaluation, AWS or LLaMA" autoComplete="off" />
        </label>
        <div className="ask-chips">
          {SUGGESTIONS.map((s) => (
            <button key={s} className={`chip ${q === s ? "on" : ""}`} onClick={() => setQ(s)}>
              {s}
            </button>
          ))}
        </div>
        <ol className="results">
          {results.length === 0 && <li className="result empty">No matching lines. Try fraud, agents, pgvector or Northeastern.</li>}
          {results.map((r, i) => (
            <li className="result" key={r.source + i}>
              <div className="result-meta mono">
                <span>{r.source}</span>
                <span className="score">
                  <span className="bar"><span style={{ width: `${Math.min(100, Math.round(r.score * 100))}%` }} /></span>
                  {r.score.toFixed(2)}
                </span>
              </div>
              <p>{r.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </Sec>
  );
}

/* ───────── education ───────── */
function EduSheet({ ed, i, total }) {
  const [ref, inView] = useInView();
  const short = ed.degree.replace("Master of Science", "M.S.").replace("Bachelor of Science", "B.S.").split(",")[0];
  return (
    <article ref={ref} className={`sheet ${inView ? "in" : ""}`} data-reveal data-tilt="2">
      <div className="bp-sheet">
        <span className="bp-cross" aria-hidden="true" />
        <span className="bp-stamp mono" aria-hidden="true">{ed.end.slice(-4)}</span>
        <Stack3D render={() => <Blueprint kind={ed.sheet} play={inView} />} />
      </div>
      <dl className="sheet-block">
        <div className="wide">
          <dt className="mono">Institution</dt>
          <dd><h3>{ed.school}</h3></dd>
        </div>
        <div className="wide">
          <dt className="mono">Degree</dt>
          <dd>{ed.degree}</dd>
        </div>
        <div>
          <dt className="mono">Location</dt>
          <dd>{ed.location}</dd>
        </div>
        <div>
          <dt className="mono">Dates</dt>
          <dd>{ed.start ? `${ed.start} – ` : ""}{ed.end}</dd>
        </div>
        <div>
          <dt className="mono">Drawn by</dt>
          <dd>V. Patil · {short}</dd>
        </div>
        <div>
          <dt className="mono">Sheet</dt>
          <dd>{String(i + 1).padStart(2, "0")} of {String(total).padStart(2, "0")}</dd>
        </div>
      </dl>
    </article>
  );
}

function Education() {
  return (
    <Sec id="education" wide title="Education" note="Drawn to scale, more or less.">
      <div className="sheets">
        {education.map((ed, i) => (
          <EduSheet key={ed.school + ed.degree} ed={ed} i={i} total={education.length} />
        ))}
      </div>
    </Sec>
  );
}

/* ───────── contact ───────── */
function Contact() {
  const [copied, setCopied] = useState(false);
  const selectEmail = () => {
    const el = document.getElementById("email-text");
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };
  const copy = () => {
    try {
      navigator.clipboard.writeText(profile.email).then(
        () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        },
        selectEmail
      );
    } catch {
      selectEmail();
    }
  };
  return (
    <section className="contact" id="contact" aria-labelledby="contact-h">
      <div className="wrap">
        <div className="contact-head" data-reveal>
          <p className="status"><i aria-hidden="true" /> Open to Software, Automation and AI Engineer roles</p>
          <h2 id="contact-h">Have a system that needs to run in production? Let’s talk.</h2>
          <div className="contact-row">
            <span id="email-text" className="email mono">{profile.email}</span>
            <button className="btn primary" onClick={copy}>{copied ? "Copied" : "Copy email"}</button>
            {profile.links.map((l) => (
              <a key={l.label} className="btn" href={l.url} target="_blank" rel="noreferrer">
                {l.label} <ArrowUpRight />
              </a>
            ))}
          </div>
        </div>
        <div className="contact-form" data-reveal>
          <ContactForm to={profile.email} handle="vipul.patil" />
        </div>
      </div>
    </section>
  );
}

/* Reveals every [data-reveal] element once, as it enters the viewport */
function useScrollReveal() {
  useEffect(() => {
    const els = [...document.querySelectorAll("[data-reveal]")];
    const show = (el) => el.setAttribute("data-shown", "");
    if (!("IntersectionObserver" in window)) {
      els.forEach(show);
      return;
    }
    const STAG = [0, 60, 110, 150, 180, 200];
    els.forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => c.hasAttribute("data-reveal"));
      el.style.setProperty("--rv-d", `${STAG[Math.min(sibs.indexOf(el), STAG.length - 1)]}ms`);
    });
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            show(en.target);
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function App() {
  const [active, setActive] = useState("");
  useScrollReveal();
  useTilt3D();
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <div className="bg-layer" aria-hidden="true">
        <Field density={0.7} />
      </div>
      <Nav />
      <main id="main">
        <Hero />
        <WhatIDo />
        <Experience active={active} />
        <Projects active={active} />
        <Skills active={active} setActive={setActive} />
        <AskMyResume />
        <Education />
        <Contact />
      </main>
      <footer className="footer">
        <div className="wrap footer-inner mono">
          <span>© {new Date().getFullYear()} {profile.name} · {profile.location}</span>
          <a className="tlink" href="#top">Back to top</a>
        </div>
      </footer>
    </>
  );
}
