import React, { useState } from "react";

/* Contact form that works on a static host.
   Messages go through FormSubmit (free, no account): the first message
   sends an activation email to the inbox below; click "Activate" once.
   If the service can't be reached, visitors get a pre-filled email instead. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ContactForm({ to, handle }) {
  const [f, setF] = useState({ name: "", email: "", subject: "", message: "", honey: "" });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle"); // idle | sending | sent | failed
  const set = (k) => (e) => {
    setF({ ...f, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: "" });
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
    if (f.honey) return; // bot trap
    if (!validate()) return;
    setState("sending");
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${to}`, {
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
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && String(data.success) === "true") {
        setState("sent");
      } else {
        setState("failed");
      }
    } catch {
      setState("failed");
    }
  };

  if (state === "sent") {
    return (
      <div className="cf-card cf-done" role="status">
        <p className="cf-to mono"><span>to</span> {handle}</p>
        <div className="cf-check" aria-hidden="true">✓</div>
        <h3>Message sent</h3>
        <p>Thanks, {f.name.split(" ")[0]}. I’ll reply to <strong>{f.email}</strong>.</p>
        <button
          type="button"
          className="cf-again mono"
          onClick={() => {
            setF({ name: "", email: "", subject: "", message: "", honey: "" });
            setState("idle");
          }}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="cf-card" onSubmit={submit} noValidate>
      <p className="cf-to mono"><span>to</span> {handle}</p>
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
          <span className="mono">data</span>
          <textarea id="cf-message" name="message" rows="5" placeholder="Tell me what you’re building…" value={f.message} onChange={set("message")} aria-invalid={!!errors.message} aria-describedby="cf-message-err" />
          {errors.message && <em id="cf-message-err">{errors.message}</em>}
        </label>
        <input className="cf-honey" tabIndex="-1" autoComplete="off" name="_honey" value={f.honey} onChange={set("honey")} aria-hidden="true" />
      </div>
      <button className="cf-send mono" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Sign & send"} <span aria-hidden="true">↗</span>
      </button>
      {state === "failed" && (
        <p className="cf-fail" role="alert">
          The message didn’t go through. <a href={mailto()}>Open it in your email app</a> instead, or write to <span className="mono">{to}</span>.
        </p>
      )}
    </form>
  );
}
