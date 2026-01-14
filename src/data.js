// ─────────────────────────────────────────────────────────────
// ALL SITE CONTENT LIVES HERE. Edit this file to update the site.
// `tags` on jobs and projects must match skill names in `skills`
// exactly — that's what lights them up when a visitor taps a skill.
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: "Vipul Patil",
  firstName: "Vipul",
  title: "Applied AI/ML Engineer",
  location: "Boston, MA",
  currently: "AI Engineer at Centene",
  headline: "I ship ML systems that hold up on messy, real-world data.",
  summary:
    "M.S. in Computer Science from Northeastern. I take ML and AI systems from raw financial and healthcare data all the way to production, and I pick the right tool for each problem: classical ML, retrieval and similarity search, LLM applications, or agentic systems. I build evaluations tied to what users actually need, and I care about the tradeoffs between quality, cost, latency and reliability.",
  email: "patil.vipu.2001@gmail.com",
  links: [
    { label: "LinkedIn", url: "https://linkedin.com/in/vipulpat02" },
    { label: "GitHub", url: "https://github.com/Vipu-Patil" },
  ],
  // Shown in the hero "model card". Keep it playful.
  modelCard: [
    { k: "model", v: "vipul-patil · v2026.10" },
    { k: "task", v: "Turn messy data into production ML" },
    { k: "training data", v: "M.S. CS, Northeastern ’25" },
    { k: "best eval", v: "+28% PR-AUC over baseline" },
    { k: "serving", v: "AWS · 99.7% uptime" },
    { k: "known limitation", v: "Will build an eval suite for anything" },
  ],
};

// Headline numbers. `value` is shown big; `label` explains it.
export const metrics = [
  { value: "+28%", label: "PR-AUC lift on claims fraud detection", where: "Centene" },
  { value: "40%", label: "smaller review queue for 12 adjudicators", where: "Centene" },
  { value: "99.7%", label: "uptime on real-time scoring endpoints", where: "Centene" },
  { value: "<200ms", label: "risk scoring at 10K+ transactions/min", where: "Capgemini" },
  { value: "2w → 3d", label: "release cycle with MLOps pipelines", where: "Capgemini" },
];

