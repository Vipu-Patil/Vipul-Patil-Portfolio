import React, { useEffect, useRef, useState } from "react";

/* "Sign & send" contact console.
   Left: the form. Right: a live preview of the request being composed.
   Messages go through FormSubmit (free, no account). The first message
   sends an activation email to the inbox below; click "Activate" once.
   If delivery fails, visitors get a pre-filled email instead. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const STEPS = ["validating fields", "signing as sender", "routing to inbox"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const blank = { name: "", email: "", subject: "", message: "", honey: "" };

function Val({ v, ph }) {
  return v ? <span className="j-str">"{v}"</span> : <span className="j-ph">{ph}</span>;
}

export default function ContactForm({ to, handle }) {
  const [f, setF] = useState(blank);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle"); // idle | sending | sent | failed
  const [step, setStep] = useState(-1);
  const [plane, setPlane] = useState(false);
  const [reason, setReason] = useState("");
  const timer = useRef(null);
  useEffect(() => () => clearInterval(timer.current), []);

  const set = (k) => (e) => {
    setF({ ...f, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: "" });
    if (state === "failed") setState("idle");
  };

  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = "Add your name.";
    if (!EMAIL_RE.test(f.email.trim())) e.email = "Use a valid email, like you@company.com.";
    if (f.message.trim().length < 10) e.message = "Write at least a sentence so I know what it’s about.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const mailto = () =>
    `mailto:${to}?subject=${encodeURIComponent(f.subject || `Hello from ${f.name || "your portfolio"}`)}&body=${encodeURIComponent(
      `${f.message}\n\n— ${f.name}${f.email ? ` (${f.email})` : ""}`
    )}`;

  const submit = async (e) => {
    e.preventDefault();
    if (f.honey || state === "sending") return;
    if (!validate()) return;
    setState("sending");
    setStep(0);
    clearInterval(timer.current);
    timer.current = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 520);
    const send = fetch(`https://formsubmit.co/ajax/${to}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: f.name.trim(),
        email: f.email.trim(),
        _replyto: f.email.trim(),
        _subject: `Portfolio: ${f.subject.trim() || "New message"}`,
        subject: f.subject.trim(),
        message: f.message.trim(),
        _template: "table",
        _captcha: "false",
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok && String(data.success) === "true", msg: data.message || (res.ok ? "" : `HTTP ${res.status}`) };
      })
      .catch(() => ({ ok: false, msg: "network error: the form service couldn’t be reached" }));
    const [{ ok, msg }] = await Promise.all([send, sleep(1700)]);
    setReason(msg || "");
    clearInterval(timer.current);
    setStep(STEPS.length);
    if (ok) {
      setPlane(true);
      await sleep(1100);
      setState("sent");
      setPlane(false);
    } else {
      setState("failed");
    }
  };

  const bytes = new Blob([JSON.stringify({ n: f.name, e: f.email, s: f.subject, m: f.message })]).size;
  const first = f.name.trim().split(" ")[0];

  if (state === "sent") {
    return (
      <div className="cf-shell">
        <div className="cf-card cf-done" role="status">
          <span className="cf-stamp mono" aria-hidden="true">DELIVERED</span>
          <p className="cf-to mono"><span>to</span> {handle}</p>
          <div className="cf-check" aria-hidden="true">✓</div>
          <h3>Message sent{first ? `, ${first}` : ""}.</h3>
          <p>I’ll reply to <strong>{f.email}</strong>.</p>
          <p className="cf-sig-done">{f.name}</p>
          <button type="button" className="cf-again mono" onClick={() => { setF(blank); setState("idle"); setStep(-1); }}>
            Write another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`cf-shell ${state === "sending" ? "busy" : ""}`}>
      <form className="cf-card" onSubmit={submit} noValidate>
        <p className="cf-to mono"><span>to</span> {handle}<span className="cf-online"><i /> inbox online</span></p>
        <div className="cf-grid">
          <label className="cf-field" htmlFor="cf-name">
            <span className="mono">from.name</span>
            <input id="cf-name" name="name" autoComplete="name" placeholder="Your name" value={f.name} onChange={set("name")} aria-invalid={!!errors.name} aria-describedby="cf-name-err" />
            {errors.name && <em id="cf-name-err">{errors.name}</em>}
          </label>
          <label className="cf-field" htmlFor="cf-email">
            <span className="mono">from.email</span>
            <input id="cf-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" value={f.email} onChange={set("email")} aria-invalid={!!errors.email} aria-describedby="cf-email-err" />
            {errors.email && <em id="cf-email-err">{errors.email}</em>}
          </label>
          <label className="cf-field wide" htmlFor="cf-subject">
            <span className="mono">subject</span>
            <input id="cf-subject" name="subject" placeholder="Role, project or automation" value={f.subject} onChange={set("subject")} />
          </label>
          <label className="cf-field wide" htmlFor="cf-message">
            <span className="mono">data <b className="cf-bytes">{bytes} B</b></span>
            <textarea id="cf-message" name="message" rows="5" placeholder="Tell me what you’re building…" value={f.message} onChange={set("message")} aria-invalid={!!errors.message} aria-describedby="cf-message-err" />
            {errors.message && <em id="cf-message-err">{errors.message}</em>}
          </label>
          <input className="cf-honey" tabIndex="-1" autoComplete="off" name="_honey" value={f.honey} onChange={set("honey")} aria-hidden="true" />
        </div>
        <div className="cf-sign" aria-hidden="true">
          <span className="mono">signed</span>
          <span className={`cf-sig ${f.name ? "on" : ""}`} key={f.name.length > 0 ? "y" : "n"}>{f.name || "your signature"}</span>
        </div>
        <button className="cf-send mono" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Sign & send"} <span aria-hidden="true">↗</span>
        </button>
        {state === "failed" && /activat/i.test(reason) && (
          <p className="cf-fail" role="alert">
            This form is still being set up, so the message wasn’t delivered. <a href={mailto()}>Send it from your email app</a> instead, or write to <span className="mono">{to}</span>.
          </p>
        )}
        {state === "failed" && !/activat/i.test(reason) && (
          <p className="cf-fail" role="alert">
            The message didn’t go through. <a href={mailto()}>Open it in your email app</a> instead, or write to <span className="mono">{to}</span>.
          </p>
        )}
        {plane && (
          <svg className="cf-plane" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M4 22 44 6 34 42 24 28Z" fill="#e3b866" />
            <path d="M24 28 44 6 18 25Z" fill="#b98b3a" />
            <path d="M24 28 22 38 28 31" fill="#8a6624" />
          </svg>
        )}
      </form>

      <aside className="cf-preview mono" aria-hidden="true">
        <div className="cf-pv-bar"><i /><i /><i /><span>request preview</span></div>
        <pre className="cf-code">
          <span className="j-verb">POST</span> <span className="j-url">/inbox/{handle}</span>{"\n"}
          <span className="j-key">content-type</span>: application/json{"\n\n"}
          {"{"}{"\n"}
          {"  "}<span className="j-key">"from"</span>: {"{"}{"\n"}
          {"    "}<span className="j-key">"name"</span>: <Val v={f.name} ph="null" />,{"\n"}
          {"    "}<span className="j-key">"email"</span>: <Val v={f.email} ph="null" />{"\n"}
          {"  "}{"}"},{"\n"}
          {"  "}<span className="j-key">"subject"</span>: <Val v={f.subject} ph='"(optional)"' />,{"\n"}
          {"  "}<span className="j-key">"data"</span>: <Val v={f.message.length > 90 ? `${f.message.slice(0, 90)}…` : f.message} ph='"…"' />,{"\n"}
          {"  "}<span className="j-key">"bytes"</span>: <span className="j-num">{bytes}</span>,{"\n"}
          {"  "}<span className="j-key">"signed"</span>: <span className="j-bool">{f.name ? "true" : "false"}</span>{"\n"}
          {"}"}
          <span className="cf-caret" />
        </pre>
        <ol className="cf-log">
          {state === "idle" && step < 0 && <li className="dim">› draft · waiting for “Sign &amp; send”</li>}
          {STEPS.map((s, i) =>
            step >= i ? (
              <li key={s} className={step > i ? "ok" : "run"}>
                {step > i ? "✓" : "›"} {s}
                {step === i && <span className="cf-dots" />}
              </li>
            ) : null
          )}
          {state === "sending" && step >= STEPS.length && !plane && <li className="run">› awaiting response<span className="cf-dots" /></li>}
          {plane && <li className="win">✓ 200 OK · delivered</li>}
          {state === "failed" && <li className="bad">✕ couldn’t deliver{reason ? ` · ${reason}` : ""}</li>}
        </ol>
      </aside>
    </div>
  );
}
