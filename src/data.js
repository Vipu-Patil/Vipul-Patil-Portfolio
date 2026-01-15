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

export const experience = [
  {
    company: "Centene Corporation",
    role: "AI Engineer",
    location: "Boston, MA",
    start: "Jun 2025",
    end: "Present",
    blurb: "Fraud detection and retrieval for healthcare claims.",
    bullets: [
      "Shipped a classical ML fraud-detection system end to end, from noisy claims data through feature engineering (ICD/CPT codes, claim frequency, provider billing behavior) and evaluation, raising precision-recall AUC by 28% over baseline.",
      "Took the model to production as a real-time scoring service (Python, FastAPI) with the adjudication team, taking manual work off 12 adjudicators and cutting their review queue by 40%.",
      "Built retrieval and similarity search (embeddings, FAISS, Pinecone, custom retrievers) over claims and policy records, giving adjusters historical context in seconds instead of manual searches across siloed systems.",
      "Balanced latency and reliability on AWS (EC2, Lambda, S3) with health checks and automated rollback, sustaining 99.7% uptime for real-time scoring endpoints.",
    ],
    tags: ["XGBoost", "Feature Engineering", "PR-AUC Evaluation", "Python", "FastAPI", "REST APIs", "Embeddings", "FAISS", "Pinecone", "AWS"],
  },
  {
    company: "Capgemini",
    role: "AI Software Engineer",
    location: "Pune, India",
    start: "Jan 2023",
    end: "Aug 2023",
    blurb: "LLM apps, RAG and real-time risk scoring for financial services.",
    bullets: [
      "Built a LLaMA-based LLM application for a financial-services client that drafts risk summaries and compliance reports from case data with human oversight, halving analysts’ documentation time on regulatory audits.",
      "Built a RAG system over fragmented financial case data using embeddings and a vector database, making fraud investigators’ case-history research 40% faster than keyword search.",
      "Built latency-critical ML serving backends in Python and C++ for real-time transaction risk scoring, handling 10K+ transactions/min at sub-200 ms during peak load.",
      "Built MLOps pipelines (MLflow, Docker, GitHub Actions CI/CD) for training, validation, versioning and deployment, cutting release cycles from 2 weeks to 3 days.",
    ],
    tags: ["LLM Apps", "RAG", "Embeddings", "Human-in-the-Loop", "Python", "C++", "MLflow", "Docker", "GitHub Actions", "Git"],
  },
  {
    company: "PharmaPro",
    role: "Data Science Intern",
    location: "Mumbai, India",
    start: "Feb 2022",
    end: "May 2022",
    blurb: "ETL pipelines that turned unstructured data into clean datasets.",
    bullets: [
      "Turned messy, unstructured data from PDFs, web sources and internal records into clean datasets with Python ETL pipelines, cutting processing time from 2 hours to under 10 minutes (~92%), and presented the results directly to the CEO.",
    ],
    tags: ["Python"],
  },
];

export const projects = [
  {
    name: "IncidentIQ",
    kicker: "Agentic investigation system + evaluation suite",
    date: "Sep 2026",
    url: "https://github.com/Vipu-Patil",
    stack: ["Python", "LangGraph", "LangSmith", "FastAPI", "PostgreSQL/pgvector", "Ollama", "Docker", "AWS"],
    bullets: [
      "An agent that retrieves runbooks with embeddings and pgvector similarity search, then calls tools for logs, metrics and deployment data to write evidence-backed root-cause reports.",
      "An evaluation benchmark for root-cause accuracy and robustness to adversarial prompt injection, with error analysis on LangSmith traces to find and fix failures across retrieval, prompts and tools.",
      "Runs on a self-hosted model stack (Ollama) to weigh cost and data control against hosted-API quality.",
    ],
    tags: ["LangGraph", "LangSmith", "Tool Calling", "Embeddings", "RAG", "pgvector", "PostgreSQL", "Offline Evals", "Adversarial Testing", "Error Analysis", "FastAPI", "Python", "Docker", "AWS"],
    color: "accent",
  },
  {
    name: "AI Banking Workflow Agent",
    kicker: "LLM agent for multi-step finance operations",
    date: "Aug 2026",
    url: "https://github.com/Vipu-Patil",
    stack: ["Python", "TypeScript", "React", "FastAPI", "Gemini API", "Playwright", "LangChain", "PostgreSQL"],
    bullets: [
      "Executes multi-step financial operations workflows end to end, grounding every action in verified page elements so it can’t hallucinate steps.",
      "Built-in finance controls: deterministic replay for auditability, checkpoints, and human approval for sensitive actions.",
      "Hardened against real failures in error handling and rate-limit recovery.",
    ],
    tags: ["LLM Apps", "Tool Calling", "Human-in-the-Loop", "Auditability", "Python", "TypeScript", "React", "FastAPI", "PostgreSQL", "REST APIs"],
    color: "highlight",
  },
];

