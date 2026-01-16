import React, { useEffect, useMemo, useState } from "react";
import { profile, metrics, experience, projects, skills, education } from "./data.js";

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
    ...education.map((ed) => ({ source: "Education", text: `${ed.degree}, ${ed.school} (${ed.location}), ${ed.end}.`, extra: "masters degree school university graduated study" })),
    ...skills.map((g) => ({ source: `Skills · ${g.group}`, text: `${g.group}: ${g.items.join(", ")}` })),
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

const SUGGESTIONS = ["fraud detection", "RAG and vector search", "agents with human approval", "MLOps and deployment", "latency at scale", "education"];

function AskMyResume() {
  const search = useMemo(buildIndex, []);
  const [q, setQ] = useState("fraud detection");
  const results = useMemo(() => (q.trim() ? search(q) : []), [q, search]);

  return (
    <section className="ask" aria-labelledby="ask-title">
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
        <p className="eyebrow mono">
          <span className="pulse" aria-hidden="true" /> {profile.currently} · {profile.location}
        </p>
        <h1>
          Hi, I’m <span className="hl">{profile.firstName}</span>.
          <br />
          {profile.headline}
        </h1>
        <p className="lede">{profile.summary}</p>
        <div className="cta-row">
          <a className="btn primary" href="#projects">See projects</a>
          <a className="btn" href="#contact">Get in touch</a>
          {profile.links.map((l) => (
            <a key={l.label} className="btn ghost" href={l.url} target="_blank" rel="noreferrer">
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
      <aside className="model-card" aria-label="Model card">
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

function Metrics() {
  return (
    <section className="metrics" aria-label="Results">
      <div className="wrap metrics-row">
        {metrics.map((m) => (
          <div className="metric" key={m.label}>
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
    <div className="section-title" id={id}>
      <p className="mono small kicker">{kicker}</p>
      <h2>{title}</h2>
      {note && <p className="muted">{note}</p>}
    </div>
  );
}

const lit = (tags, active) => (!active ? "" : tags.includes(active) ? "is-lit" : "is-dim");

function Experience({ active }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="wrap section">
      <SectionTitle id="work" kicker="Experience" title="Where I’ve shipped" />
      <ol className="timeline">
        {experience.map((e, i) => {
          const isOpen = open === i;
          return (
            <li key={e.company} className={`job ${lit(e.tags, active)}`}>
              <div className="job-when mono small">
                {e.start} – {e.end}
              </div>
              <div className="job-body">
                <button className="job-head" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
                  <span>
                    <span className="job-role">{e.role}</span>
                    <span className="job-co">
                      {e.company} · {e.location}
                    </span>
                    <span className="job-blurb muted">{e.blurb}</span>
                  </span>
                  <span className={`plus ${isOpen ? "open" : ""}`} aria-hidden="true" />
                </button>
                {isOpen && (
                  <ul className="job-bullets">
                    {e.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
                <div className="tags">
                  {e.tags.map((t) => (
                    <span key={t} className={`tag ${t === active ? "on" : ""}`}>{t}</span>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function ProjectCard({ p, active }) {
  const onMove = (ev) => {
    const r = ev.currentTarget.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width - 0.5;
    const y = (ev.clientY - r.top) / r.height - 0.5;
    ev.currentTarget.style.setProperty("--rx", `${(-y * 5).toFixed(2)}deg`);
    ev.currentTarget.style.setProperty("--ry", `${(x * 6).toFixed(2)}deg`);
  };
  const onLeave = (ev) => {
    ev.currentTarget.style.setProperty("--rx", "0deg");
    ev.currentTarget.style.setProperty("--ry", "0deg");
  };
  return (
    <article className={`project ${p.color} ${lit(p.tags, active)}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="project-top mono small">
        <span>{p.date}</span>
        <a href={p.url} target="_blank" rel="noreferrer">GitHub ↗</a>
      </div>
      <h3>{p.name}</h3>
      <p className="project-kicker">{p.kicker}</p>
      <ul>
        {p.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <div className="tags">
        {p.stack.map((t) => (
          <span key={t} className={`tag ${p.tags.includes(active) && t.includes(active) ? "on" : ""}`}>{t}</span>
        ))}
      </div>
    </article>
  );
}

function Projects({ active }) {
  return (
    <section className="wrap section">
      <SectionTitle id="projects" kicker="Projects" title="Things I built on my own time" />
      <div className="projects">
        {projects.map((p) => (
          <ProjectCard key={p.name} p={p} active={active} />
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
          <div className="skill-group" key={g.group}>
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
      <div className={`used-in ${active ? "show" : ""}`} aria-live="polite">
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
          <div className="edu" key={ed.school + ed.degree}>
            <div className="edu-cap mono" aria-hidden="true">{ed.end.slice(-2)}’</div>
            <div>
              <h3>{ed.school}</h3>
              <p>{ed.degree}</p>
              <p className="mono small muted">
                {ed.location} · {ed.end}
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
        <p className="mono small kicker">Contact</p>
        <h2>Building something with ML or agents? Let’s talk.</h2>
        <div className="email-row">
          <span id="email-text" className="email">{profile.email}</span>
          <button className="btn primary" onClick={copy}>{copied ? "Copied" : "Copy email"}</button>
        </div>
        <div className="cta-row">
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

export default function App() {
  const [active, setActive] = useState("");
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <div className="wrap">
          <AskMyResume />
        </div>
        <Metrics />
        <Experience active={active} />
        <Projects active={active} />
        <Skills active={active} setActive={setActive} />
        <Education />
        <Contact />
      </main>
      <footer className="wrap footer mono small muted">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>Built with React</span>
      </footer>
    </>
  );
}
