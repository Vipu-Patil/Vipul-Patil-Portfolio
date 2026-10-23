// ─────────────────────────────────────────────────────────────
// ALL SITE CONTENT LIVES HERE. Edit this file to update the site.
// `tags` on jobs and projects must match skill names in `skills`
// exactly — that's what lights them up when a visitor taps a skill.
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: "Vipul Patil",
  firstName: "Vipul",
  title: "Software, Automation & AI Engineer",
  location: "Boston, MA",
  currently: "AI Engineer at Centene",
  headline: "I build backends, automation and AI that run in production.",
  summary:
    "Software engineer with an M.S. in Computer Science from Northeastern. I design low-latency APIs and services in Python and C++, automate the work around them with CI/CD, data pipelines and browser agents, and add ML and LLMs where they earn their place. My systems run in healthcare and financial services, and I care about the same things in all of them: correctness, latency, uptime and cost.",
  email: "patil.vipu.2001@gmail.com",
  links: [
    { label: "LinkedIn", url: "https://linkedin.com/in/vipulpat02" },
    { label: "GitHub", url: "https://github.com/Vipu-Patil" },
  ],
  // The three roles shown under the headline.
  roles: ["Backend Software", "Automation", "AI / ML"],
  // Shown in the hero "model card". Keep it playful.
  modelCard: [
    { k: "model", v: "vipul-patil · v2026.10" },
    { k: "roles", v: "Backend · Automation · AI engineering" },
    { k: "languages", v: "Python · TypeScript · C++ · SQL" },
    { k: "ships", v: "APIs, pipelines, agents, ML models" },
    { k: "serving", v: "AWS · 99.7% uptime · <200 ms at peak" },
    { k: "training data", v: "M.S. CS, Northeastern ’25" },
    { k: "known limitation", v: "Automates anything done twice" },
  ],
};

// "What I do" — one card per role. Every proof point comes from the resume.
export const pillars = [
  {
    role: "Backend Software",
    line: "Fast, reliable services and APIs that other teams build on.",
    proof: [
      "Real-time risk scoring at 10K+ transactions/min, under 200 ms (Python, C++)",
      "FastAPI scoring service on AWS with health checks and automated rollback: 99.7% uptime",
      "PostgreSQL, REST APIs and React for full-stack agent tooling",
    ],
    stack: ["Python", "C++", "FastAPI", "PostgreSQL", "AWS"],
  },
  {
    role: "Automation",
    line: "Pipelines and agents that take repetitive work off people’s plates.",
    proof: [
      "CI/CD and MLOps pipelines that cut release cycles from 2 weeks to 3 days",
      "Python ETL that took data processing from 2 hours to under 10 minutes",
      "Browser agent (Playwright) that runs multi-step banking workflows with audit replay",
    ],
    stack: ["GitHub Actions", "Docker", "Playwright", "MLflow", "Kubernetes"],
  },
  {
    role: "AI / ML",
    line: "Models, retrieval and LLM agents, measured against real outcomes.",
    proof: [
      "Claims fraud detection with +28% PR-AUC, shrinking a 12-person review queue by 40%",
      "RAG over financial case data: research 40% faster than keyword search",
      "LangGraph agent with an eval suite for accuracy and prompt-injection robustness",
    ],
    stack: ["XGBoost", "RAG", "LangGraph", "pgvector", "LLM Apps"],
  },
];


// Headline numbers. `value` is shown big; `label` explains it.
export const metrics = [
  { value: "<200ms", label: "risk scoring at 10K+ transactions/min", where: "Backend · Capgemini" },
  { value: "99.7%", label: "uptime on real-time scoring endpoints", where: "Backend · Centene" },
  { value: "2w → 3d", label: "release cycle with CI/CD pipelines", where: "Automation · Capgemini" },
  { value: "−92%", label: "data processing time, 2 hrs to under 10 min", where: "Automation · PharmaPro" },
  { value: "+28%", label: "PR-AUC lift on claims fraud detection", where: "AI · Centene" },
  { value: "40%", label: "smaller review queue for 12 adjudicators", where: "AI · Centene" },
];

export const experience = [
  {
    company: "Centene Corporation",
    role: "AI Engineer",
    location: "Boston, MA",
    start: "Jun 2025",
    end: "Present",
    blurb: "Real-time scoring APIs, retrieval and ML for healthcare claims.",
    bullets: [
      "Shipped a classical ML fraud-detection system end to end, from noisy claims data through feature engineering (ICD/CPT codes, claim frequency, provider billing behavior) and evaluation, raising precision-recall AUC by 28% over baseline.",
      "Took the model to production as a real-time scoring service (Python, FastAPI) with the adjudication team, taking manual work off 12 adjudicators and cutting their review queue by 40%.",
      "Built retrieval and similarity search (embeddings, FAISS, Pinecone, custom retrievers) over claims and policy records, giving adjusters historical context in seconds instead of manual searches across siloed systems.",
      "Balanced latency and reliability on AWS (EC2, Lambda, S3) with health checks and automated rollback, sustaining 99.7% uptime for real-time scoring endpoints.",
    ],
    tags: ["XGBoost", "Feature Engineering", "PR-AUC Evaluation", "Python", "FastAPI", "REST APIs", "Embeddings", "FAISS", "Pinecone", "AWS", "Automated Rollback"],
  },
  {
    company: "Capgemini",
    role: "AI Software Engineer",
    location: "Pune, India",
    start: "Jan 2023",
    end: "Aug 2023",
    blurb: "Low-latency backends, CI/CD automation and LLM apps for financial services.",
    bullets: [
      "Built a LLaMA-based LLM application for a financial-services client that drafts risk summaries and compliance reports from case data with human oversight, halving analysts’ documentation time on regulatory audits.",
      "Built a RAG system over fragmented financial case data using embeddings and a vector database, making fraud investigators’ case-history research 40% faster than keyword search.",
      "Built latency-critical ML serving backends in Python and C++ for real-time transaction risk scoring, handling 10K+ transactions/min at sub-200 ms during peak load.",
      "Built MLOps pipelines (MLflow, Docker, GitHub Actions CI/CD) for training, validation, versioning and deployment, cutting release cycles from 2 weeks to 3 days.",
    ],
    tags: ["LLM Apps", "RAG", "Embeddings", "Human-in-the-Loop", "Python", "C++", "MLflow", "Docker", "GitHub Actions", "CI/CD", "Git"],
  },
  {
    company: "PharmaPro",
    role: "Data Science Intern",
    location: "Mumbai, India",
    start: "Feb 2022",
    end: "May 2022",
    blurb: "Python ETL automation that turned unstructured data into clean datasets.",
    bullets: [
      "Turned messy, unstructured data from PDFs, web sources and internal records into clean datasets with Python ETL pipelines, cutting processing time from 2 hours to under 10 minutes (~92%), and presented the results directly to the CEO.",
    ],
    tags: ["Python", "ETL Pipelines"],
  },
];

export const projects = [
  {
    name: "IncidentIQ",
    kicker: "Automated incident investigation for on-call engineers, with an eval suite",
    date: "Sep 2026",
    url: "https://github.com/Vipu-Patil/IncidentIQ",
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
    kicker: "Browser automation agent for multi-step banking operations",
    date: "Aug 2026",
    url: "https://github.com/Vipu-Patil/AI-Banking-Computer-Use-Agent",
    stack: ["Python", "TypeScript", "React", "FastAPI", "Gemini API", "Playwright", "LangChain", "PostgreSQL"],
    bullets: [
      "Executes multi-step financial operations workflows end to end, grounding every action in verified page elements so it can’t hallucinate steps.",
      "Built-in finance controls: deterministic replay for auditability, checkpoints, and human approval for sensitive actions.",
      "Hardened against real failures in error handling and rate-limit recovery.",
    ],
    tags: ["LLM Apps", "Tool Calling", "Human-in-the-Loop", "Auditability", "Python", "TypeScript", "React", "FastAPI", "PostgreSQL", "REST APIs", "Playwright"],
    color: "highlight",
  },
];

export const skills = [
  { group: "Backend & APIs", items: ["Python", "TypeScript", "C++", "SQL", "FastAPI", "REST APIs", "PostgreSQL", "MongoDB", "React"] },
  { group: "Automation & DevOps", items: ["CI/CD", "GitHub Actions", "Docker", "Kubernetes", "AWS", "Playwright", "ETL Pipelines", "Automated Rollback", "MLflow", "Prometheus", "Git"] },
  { group: "AI & LLMs", items: ["LLM Apps", "RAG", "Embeddings", "LangGraph", "Tool Calling", "Prompt Engineering", "FAISS", "Pinecone", "pgvector"] },
  { group: "Machine Learning & Data", items: ["XGBoost", "Feature Engineering", "PR-AUC Evaluation", "Error Analysis", "Hugging Face", "Apache Spark"] },
  { group: "Quality & Reliability", items: ["Offline Evals", "Adversarial Testing", "LangSmith", "Human-in-the-Loop", "Auditability"] },
];

export const education = [
  {
    school: "Northeastern University",
    degree: "Master of Science, Computer Science",
    location: "Boston, MA",
    end: "May 2025",
    notes: [],
  },
  // Add your undergraduate degree here, e.g.
  // { school: "…", degree: "Bachelor of …", location: "…", end: "…", notes: [] },
];
