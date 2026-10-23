import React, { useEffect, useMemo, useRef, useState } from "react";
import { profile, pillars, metrics, experience, projects, skills, education } from "./data.js";
import photo from "./assets/vipul.jpg";
import Field from "./Field.jsx";

/* ───────── Tiny in-browser retriever (TF-IDF + cosine) ─────────
   A playful nod to the RAG work: visitors type a question and the
   page retrieves the most relevant lines from the resume. */

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

const SUGGESTIONS = ["backend APIs and latency", "automation and CI/CD", "AI agents", "fraud detection", "RAG and vector search", "education"];

function AskMyResume() {
  const search = useMemo(buildIndex, []);
  const [q, setQ] = useState("fraud detection");
  const results = useMemo(() => (q.trim() ? search(q) : []), [q, search]);

  return (
    <section className="ask" aria-labelledby="ask-title" data-reveal="zoom">
      <div className="ask-head">
        <h2 id="ask-title">Ask my resume</h2>
        <p className="mono small muted">A tiny TF-IDF retriever running in your browser. Top 3 chunks by cosine similarity.</p>
      </div>
      <label className="ask-input">
        <span className="mono prompt" aria-hidden="true">query&gt;</span>
        <input id="ask-query" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “evaluation”, “AWS”, “LLaMA”…" autoComplete="off" />
      </label>
      <div className="chips" role="list">
        {SUGGESTIONS.map((s) => (
          <button key={s} role="listitem" className={`chip ${q === s ? "on" : ""}`} onClick={() => setQ(s)}>
            {s}
          </button>
        ))}
      </div>
      <ol className="results">
        {results.length === 0 && <li className="result empty">No matching lines. Try “fraud”, “agents”, “pgvector” or “Northeastern”.</li>}
        {results.map((r, i) => (
          <li className="result" key={r.source + i} style={{ "--d": `${i * 70}ms` }}>
            <div className="result-meta mono small">
              <span>{r.source}</span>
              <span className="score">
                <span className="bar">
                  <span style={{ width: `${Math.min(100, Math.round(r.score * 100))}%` }} />
                </span>
                {r.score.toFixed(2)}
              </span>
            </div>
            <p>{r.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ───────── Theme toggle ───────── */
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
    if (theme) root.setAttribute("data-theme", theme);
    try {
      theme ? localStorage.setItem("vp-theme", theme) : localStorage.removeItem("vp-theme");
    } catch {}
  }, [theme]);
  const isDark = () =>
    theme ? theme === "dark" : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return [isDark, () => setTheme(isDark() ? "light" : "dark")];
}

function Nav() {
  const [isDark, toggle] = useTheme();
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <a href="#top" className="logo" aria-label="Back to top">
          VP<span className="dot" />
        </a>
        <nav className="nav-links" aria-label="Sections">
          <a href="#what">What I do</a>
          <a href="#work">Work</a>
          <a href="#projects">Projects</a>
          <a href="#skills">Skills</a>
          <a href="#education">Education</a>
          <a href="#contact">Contact</a>
        </nav>
        <button
          className="theme-btn"
          onClick={toggle}
          aria-label="Toggle dark mode"
        >
          <span className="sun-moon" data-dark={isDark() ? "1" : "0"} />
        </button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero wrap" id="top">
      <div className="hero-copy">
        <p className="eyebrow mono" data-reveal>
          <span className="pulse" aria-hidden="true" /> {profile.currently} · {profile.location}
        </p>
        <h1 data-reveal>
          Hi, I’m <span className="hl">{profile.firstName}</span>.
          <br />
          {profile.headline}
        </h1>
        <ul className="roles" aria-label="Roles" data-reveal>
          {profile.roles.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="lede" data-reveal>{profile.summary}</p>
        <div className="cta-row" data-reveal>
          <a className="btn primary" href="#projects">See projects</a>
          <a className="btn" href="#contact">Get in touch</a>
          {profile.links.map((l) => (
            <a key={l.label} className="btn ghost" href={l.url} target="_blank" rel="noreferrer">
              {l.label} ↗
            </a>
          ))}
        </div>
        <p className="hint mono small" aria-hidden="true" data-reveal>
          <span className="hint-dot" /> move your cursor around · click anywhere
        </p>
      </div>
      <figure className="portrait" data-reveal="zoom">
        <img src={photo} alt={`Portrait of ${profile.name}`} width="480" height="600" />
      </figure>
      <aside className="model-card" aria-label="Model card" data-reveal="right">
        <div className="mc-head mono">
          <span>MODEL CARD</span>
          <span className="mc-dots" aria-hidden="true"><i /><i /><i /></span>
        </div>
        <dl>
          {profile.modelCard.map((row) => (
            <div className="mc-row" key={row.k}>
              <dt className="mono">{row.k}</dt>
              <dd>{row.v}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </section>
  );
}

function WhatIDo() {
  return (
    <section className="wrap section pillars-section">
      <SectionTitle id="what" kicker="What I do" title="One engineer, three hats" note="Each claim below comes from a system I shipped." />
      <div className="pillars">
        {pillars.map((p) => (
          <article className="pillar" key={p.role} data-reveal="pop">
            <h3>{p.role}</h3>
            <p className="pillar-line">{p.line}</p>
            <ul>
              {p.proof.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <div className="tags">
              {p.stack.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metrics() {
  return (
    <section className="metrics" aria-label="Results">
      <div className="wrap metrics-row">
        {metrics.map((m) => (
          <div className="metric" key={m.label} data-reveal="pop">
            <div className="metric-val">{m.value}</div>
            <div className="metric-label">{m.label}</div>
            <div className="mono small muted">{m.where}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionTitle({ id, kicker, title, note }) {
  return (
    <div className="section-title" id={id} data-reveal="left">
      <p className="mono small kicker">{kicker}</p>
      <h2>{title}</h2>
      {note && <p className="muted">{note}</p>}
    </div>
  );
}

const lit = (tags, active) => (!active ? "" : tags.includes(active) ? "is-lit" : "is-dim");

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Adds `in` to an element the first time it scrolls into view. */
function useInView() {
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
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

/* Decodes text from random glyphs when `play` turns true. */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[]#*+=";
function Scramble({ text, play }) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (!play || reduceMotion()) {
      setOut(text);
      return;
    }
    let frame = 0;
    const total = 26;
    let raf;
    const tick = () => {
      frame += 1;
      const done = Math.floor((frame / total) * text.length);
      setOut(
        text
          .split("")
          .map((ch, i) => (i < done || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
          .join("")
      );
      if (frame < total) raf = requestAnimationFrame(tick);
      else setOut(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, text]);
  return (
    <span aria-label={text}>
      <span aria-hidden="true">{out}</span>
    </span>
  );
}

/* Cursor spotlight for cards. */
const spot = (ev) => {
  const r = ev.currentTarget.getBoundingClientRect();
  ev.currentTarget.style.setProperty("--mx", `${ev.clientX - r.left}px`);
  ev.currentTarget.style.setProperty("--my", `${ev.clientY - r.top}px`);
};

function Job({ e, i, active, open, onToggle }) {
  const [ref, inView] = useInView();
  return (
    <li ref={ref} className={`job reveal ${inView ? "in" : ""} ${lit(e.tags, active)}`} style={{ "--i": i }}>
      <div className="job-when mono small">
        <span className="node" aria-hidden="true" />
        {e.start} – {e.end}
      </div>
      <div className="job-body holo" onPointerMove={spot}>
        <span className="scanline" aria-hidden="true" />
        <button className="job-head" onClick={onToggle} aria-expanded={open}>
          <span>
            <span className="job-role"><Scramble text={e.role} play={inView} /></span>
            <span className="job-co">
              {e.company} · {e.location}
            </span>
            <span className="job-blurb muted">{e.blurb}</span>
          </span>
          <span className={`plus ${open ? "open" : ""}`} aria-hidden="true" />
        </button>
        <div className={`job-more ${open ? "open" : ""}`}>
          <div>
            <ul className="job-bullets">
              {e.bullets.map((b, j) => (
                <li key={b} style={{ "--j": j }}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="tags">
          {e.tags.map((t, j) => (
            <span key={t} className={`tag ${t === active ? "on" : ""}`} style={{ "--j": j }}>{t}</span>
          ))}
        </div>
      </div>
    </li>
  );
}

function Experience({ active }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="wrap section">
      <SectionTitle id="work" kicker="Experience" title="Where I’ve shipped" note="Tap a role to expand it." />
      <ol className="timeline">
        <span className="beam" aria-hidden="true" />
        {experience.map((e, i) => (
          <Job key={e.company} e={e} i={i} active={active} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
        ))}
      </ol>
    </section>
  );
}

function ProjectCard({ p, i, active }) {
  const [ref, inView] = useInView();
  const onMove = (ev) => {
    spot(ev);
    if (reduceMotion()) return;
    const r = ev.currentTarget.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width - 0.5;
    const y = (ev.clientY - r.top) / r.height - 0.5;
    ev.currentTarget.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
    ev.currentTarget.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
  };
  const onLeave = (ev) => {
    ev.currentTarget.style.setProperty("--rx", "0deg");
    ev.currentTarget.style.setProperty("--ry", "0deg");
  };
  const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return (
    <article
      ref={ref}
      className={`project holo reveal ${inView ? "in" : ""} ${lit(p.tags, active)}`}
      style={{ "--i": i % 2 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <span className="scanline" aria-hidden="true" />
      <div className="term mono small">
        <span className="term-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="term-path">~/projects/{slug}</span>
        <span className="term-date">{p.date}</span>
      </div>
      <h3><Scramble text={p.name} play={inView} /></h3>
      <p className="project-kicker">{p.kicker}</p>
      <ul>
        {p.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <div className="project-foot">
        <div className="tags">
          {p.stack.map((t, j) => (
            <span key={t} className={`tag ${p.tags.includes(active) && t.includes(active) ? "on" : ""}`} style={{ "--j": j }}>{t}</span>
          ))}
        </div>
        {p.url && (
          <a className="repo" href={p.url} target="_blank" rel="noreferrer">
            View code ↗
          </a>
        )}
      </div>
    </article>
  );
}

function Projects({ active }) {
  return (
    <section className="wrap section">
      <SectionTitle id="projects" kicker="Projects" title="Things I built on my own time" />
      <div className="projects">
        {projects.map((p, i) => (
          <ProjectCard key={p.name} p={p} i={i} active={active} />
        ))}
      </div>
    </section>
  );
}

function Skills({ active, setActive }) {
  const usedIn = useMemo(() => {
    if (!active) return [];
    return [
      ...experience.filter((e) => e.tags.includes(active)).map((e) => `${e.role} at ${e.company}`),
      ...projects.filter((p) => p.tags.includes(active)).map((p) => p.name),
    ];
  }, [active]);
  return (
    <section className="wrap section">
      <SectionTitle id="skills" kicker="Skills" title="The toolbox" note="Tap a skill to light up where I’ve used it on this page." />
      <div className="skill-groups">
        {skills.map((g) => (
          <div className="skill-group" key={g.group} data-reveal>
            <h3 className="mono small">{g.group}</h3>
            <div className="chips">
              {g.items.map((s) => (
                <button key={s} className={`chip skill ${active === s ? "on" : ""}`} onClick={() => setActive(active === s ? "" : s)} aria-pressed={active === s}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={`used-in ${active ? "show" : ""}`} aria-live="polite" data-reveal>
        {active ? (
          <>
            <strong>{active}</strong>
            {usedIn.length ? (
              <span> · used in {usedIn.join(", ")}. Scroll up to see them highlighted.</span>
            ) : (
              <span> · part of my toolkit, not tied to a specific entry here yet.</span>
            )}
            <button className="link-btn" onClick={() => setActive("")}>Clear</button>
          </>
        ) : (
          <span className="muted">No skill selected.</span>
        )}
      </div>
    </section>
  );
}

function Education() {
  return (
    <section className="wrap section">
      <SectionTitle id="education" kicker="Education" title="Where I trained" />
      <div className="edu-list">
        {education.map((ed) => (
          <div className="edu" key={ed.school + ed.degree} data-reveal="left">
            <div className="edu-cap mono" aria-hidden="true">{ed.end.slice(-2)}’</div>
            <div>
              <h3>{ed.school}</h3>
              <p>{ed.degree}</p>
              <p className="mono small muted">
                {ed.location} · {ed.start ? `${ed.start} – ` : ""}{ed.end}
              </p>
              {ed.notes?.length > 0 && (
                <ul>
                  {ed.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    };
    try {
      navigator.clipboard.writeText(profile.email).then(done, () => selectEmail());
    } catch {
      selectEmail();
    }
  };
  const selectEmail = () => {
    const el = document.getElementById("email-text");
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };
  return (
    <section className="contact" id="contact">
      <div className="wrap contact-inner">
        <p className="mono small kicker" data-reveal>Contact</p>
        <h2 data-reveal>Hiring for backend, automation or AI engineering? Let’s talk.</h2>
        <div className="email-row" data-reveal>
          <span id="email-text" className="email">{profile.email}</span>
          <button className="btn primary" onClick={copy}>{copied ? "Copied" : "Copy email"}</button>
        </div>
        <div className="cta-row" data-reveal>
          {profile.links.map((l) => (
            <a key={l.label} className="btn" href={l.url} target="_blank" rel="noreferrer">
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Reveals every [data-reveal] element as it scrolls into view.
   Uses a data attribute so React re-renders never undo it. */
function useScrollReveal() {
  useEffect(() => {
    const els = [...document.querySelectorAll("[data-reveal]")];
    const show = (el) => el.setAttribute("data-shown", "");
    if (!("IntersectionObserver" in window)) {
      els.forEach(show);
      return;
    }
    els.forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => c.hasAttribute("data-reveal"));
      el.style.setProperty("--rv-d", `${Math.min(sibs.indexOf(el), 8) * 110}ms`);
    });
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            show(en.target);
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function App() {
  const [active, setActive] = useState("");
  useScrollReveal();
  return (
    <>
      <div className="bg-layer" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        <span className="bg-grid" />
        <Field />
      </div>
      <Nav />
      <main>
        <Hero />
        <WhatIDo />
        <div className="wrap">
          <AskMyResume />
        </div>
        <div className="lab">
          <div className="lab-grid" aria-hidden="true" />
          <Field className="lab-field" density={0.75} />
          <Metrics />
          <Experience active={active} />
          <Projects active={active} />
        </div>
        <Skills active={active} setActive={setActive} />
        <Education />
        <Contact />
      </main>
      <footer className="wrap footer mono small muted" data-reveal>
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>Built with React</span>
      </footer>
    </>
  );
}
