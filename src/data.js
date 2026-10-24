// ─────────────────────────────────────────────────────────────
// ALL SITE CONTENT LIVES HERE. Edit this file to update the site.
// `tags` on jobs and projects must match skill names in `skills`
// exactly — that's what lights them up when a visitor taps a skill.
// Content merges the Software Engineer, AI Engineer and
// Forward-Deployed Engineer versions of the resume.
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: "Vipul Patil",
  firstName: "Vipul",
  title: "Software, Automation & AI Engineer",
  location: "Boston, MA",
  currently: "Software Engineer, AI at Centene",
  headline: "I build backends, automation and AI that run in production.",
  summary:
    "Software engineer building high-throughput backend services, automation and AI systems for healthcare and financial services. I write Python, C++ and TypeScript, ship APIs and data pipelines with tests and CI/CD, and add LLMs, RAG, agents and ML where they change the outcome. I embed with the teams who use what I build and measure success in their numbers: 40% smaller review queues, half the documentation time, 99.7% uptime.",
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
    { k: "languages", v: "Python · C++ · Java · TypeScript · SQL" },
    { k: "ships", v: "APIs, pipelines, agents, ML models" },
    { k: "throughput", v: "10K+ tx/min · <200 ms at peak" },
    { k: "serving", v: "AWS · 99.7% uptime" },
    { k: "training data", v: "M.S. Northeastern ’25 · B.S. Pune ’23" },
    { k: "known limitation", v: "Automates anything done twice" },
  ],
};

// "What I do" — one card per role. Every proof point comes from the resumes.
export const pillars = [
  {
    role: "Backend Software",
    line: "Fast, secure, well-tested services that other teams build on.",
    proof: [
      "Real-time risk scoring at 10K+ transactions/min, under 200 ms (Python, C++)",
      "REST APIs secured with OAuth 2.0 and role-based access control",
      "Kafka + Spark streaming platform ingesting 100K+ events/hour",
      "Testing standards with pytest at 85%+ coverage; led code reviews",
    ],
    stack: ["Python", "C++", "FastAPI", "Kafka", "PostgreSQL"],
  },
  {
    role: "Automation",
    line: "Pipelines and agents that take repetitive work off people’s plates.",
    proof: [
      "CI/CD for 6 Docker microservices: releases from 2 weeks to 3 days",
      "Spark and SQL pipelines: batch analytics from 8 hours to under 90 minutes",
      "Python ETL: data processing from 2 hours to under 10 minutes",
      "Browser agent that runs banking workflows in legacy apps with no APIs",
    ],
    stack: ["GitHub Actions", "Docker", "Apache Spark", "Playwright", "AWS"],
  },
  {
    role: "AI / ML",
    line: "LLMs, RAG, agents and ML, measured against business outcomes.",
    proof: [
      "Fraud model +28% PR-AUC; scoring service cut a 12-person review queue 40%",
      "LLaMA app that halved analysts’ compliance documentation time",
      "RAG tools that made case research 40% faster than keyword search",
      "Anomaly detection 34% more accurate than the rule-based system",
    ],
    stack: ["LangChain", "LangGraph", "RAG", "XGBoost", "PyTorch"],
  },
];

// Headline numbers. `value` is shown big; `label` explains it.
export const metrics = [
  { value: "<200ms", label: "risk scoring at 10K+ transactions/min", where: "Backend · Capgemini" },
  { value: "99.7%", label: "uptime on real-time scoring endpoints", where: "Backend · Centene" },
  { value: "2w → 3d", label: "release cycle with CI/CD pipelines", where: "Automation · Capgemini" },
  { value: "8h → 90m", label: "batch analytics with Spark and SQL", where: "Automation · Centene" },
  { value: "+28%", label: "PR-AUC lift on claims fraud detection", where: "AI · Centene" },
  { value: "50%", label: "less documentation time with an LLM app", where: "AI · Capgemini" },
];

export const experience = [
  {
    company: "Centene Corporation",
    role: "Software Engineer, AI",
    location: "Boston, MA",
    start: "Jun 2025",
    end: "Present",
    blurb: "Real-time scoring services, data pipelines, RAG and ML for healthcare claims.",
    bullets: [
      "Embedded with a 12-person claims adjudication team to map their fraud-review workflow, then designed, built and tested a real-time claim-scoring microservice (Python, FastAPI) that cut their manual review queue by 40%.",
      "Raised the production XGBoost fraud model’s precision-recall AUC by 28% over baseline by turning claims domain knowledge (ICD/CPT codes, claim frequency, provider billing behavior) into features and tuning with Scikit-learn.",
      "Built a RAG research tool (LangChain, embeddings, FAISS, Pinecone, custom retrievers) over siloed claims and policy databases, returning relevant claim history in seconds instead of manual searches.",
      "Architected Apache Spark and SQL pipelines for large-scale member and claims datasets, cutting batch analytics turnaround from 8 hours to under 90 minutes.",
      "Owned production rollout on AWS (EC2, Lambda, S3) with automated health checks and rollback, keeping real-time scoring endpoints at 99.7% uptime.",
      "Set automated unit and integration testing standards (pytest, 85%+ coverage) and led code reviews in the backend engineering pod.",
    ],
    tags: ["Python", "FastAPI", "Microservices", "XGBoost", "Scikit-learn", "Feature Engineering", "PR-AUC Evaluation", "RAG", "LangChain", "Embeddings", "FAISS", "Pinecone", "Apache Spark", "SQL", "AWS", "Automated Rollback", "pytest", "Workflow Discovery"],
  },
  {
    company: "Capgemini",
    role: "AI Software Engineer",
    location: "Pune, India",
    start: "Jan 2023",
    end: "Aug 2023",
    blurb: "Low-latency backends, secure APIs, CI/CD and LLM apps for a financial-services client.",
    bullets: [
      "Built high-throughput backends in Python and C++ for real-time transaction validation and risk scoring, handling 10K+ transactions/min at sub-200 ms during peak load.",
      "Designed and secured REST APIs with OAuth 2.0 and role-based access control as the data layer between front-end dashboards and core processing engines.",
      "Built CI/CD and MLOps pipelines (GitHub Actions, Docker, MLflow) for 6 containerized microservices, cutting release cycles from 2 weeks to 3 days.",
      "Deployed a LLaMA-based LLM app into the client’s regulatory audit workflow to draft risk summaries and compliance reports with human oversight, halving analysts’ documentation time.",
      "Replaced investigators’ manual keyword searches across siloed case systems with a RAG solution, making case-history research 40% faster.",
      "Optimized legacy SQL queries and data workflows (Pandas, NumPy), cutting report-generation time by 60% and eliminating recurring timeouts.",
      "Integrated anomaly-detection models (Scikit-learn, XGBoost) into the transaction pipeline, improving suspicious-activity detection accuracy by 34% over the rule-based system.",
    ],
    tags: ["Python", "C++", "REST APIs", "OAuth 2.0", "Microservices", "CI/CD", "GitHub Actions", "Docker", "MLflow", "LLM Apps", "Human-in-the-Loop", "RAG", "Embeddings", "SQL", "Pandas", "Scikit-learn", "XGBoost"],
  },
  {
    company: "PharmaPro",
    role: "Data Science Intern",
    location: "Mumbai, India",
    start: "Feb 2022",
    end: "May 2022",
    blurb: "Python ETL automation that turned scattered medical data into clean datasets.",
    bullets: [
      "Unified medical data scattered across PDFs, web sources and internal records with Python ETL pipelines, cutting extraction-to-clean-data time from 2 hours to under 10 minutes (~92%).",
      "Worked on REST API integrations and cloud security, and presented results directly to the CEO.",
    ],
    tags: ["Python", "ETL Pipelines", "REST APIs", "Stakeholder Communication"],
  },
];

// `url: null` hides the GitHub link on that card.
export const projects = [
  {
    name: "IncidentIQ",
    kicker: "Autonomous incident investigation agent with an evaluation suite",
    date: "Sep 2026",
    url: "https://github.com/Vipu-Patil/IncidentIQ",
    stack: ["Python", "LangGraph", "LangSmith", "FastAPI", "PostgreSQL/pgvector", "Ollama", "Docker", "AWS"],
    bullets: [
      "A LangGraph agent that investigates production incidents: it retrieves runbooks with RAG over pgvector and calls tools for logs, metrics and deployment data to write evidence-backed root-cause reports.",
      "A benchmark for root-cause accuracy and resilience to prompt injection hidden in incident data, with error analysis on LangSmith traces to fix failures across retrieval, prompts and tools.",
      "Runs on a local-LLM stack (Ollama) suited to data-sensitive environments.",
    ],
    tags: ["LangGraph", "LangSmith", "Tool Calling", "Embeddings", "RAG", "pgvector", "PostgreSQL", "Offline Evals", "Adversarial Testing", "FastAPI", "Python", "Docker", "AWS"],
  },
  {
    name: "AI Banking Computer-Use Agent",
    kicker: "Browser automation agent for legacy banking apps with no APIs",
    date: "Aug 2026",
    url: "https://github.com/Vipu-Patil/AI-Banking-Computer-Use-Agent",
    stack: ["Python", "TypeScript", "FastAPI", "Gemini API", "Playwright", "LangChain", "PostgreSQL", "React"],
    bullets: [
      "Automates multi-step banking workflows end to end in legacy, frameset-based web apps, grounding every action in verified page elements instead of hallucinated selectors.",
      "Safe for real operations: layered controls, checkpoints, human-in-the-loop escalation, and reusable workflows with deterministic replay for auditability.",
      "Hardened by fixing real failures in locator resolution, error handling and rate-limit recovery.",
    ],
    tags: ["LLM Apps", "Tool Calling", "Human-in-the-Loop", "Auditability", "Guardrails", "Playwright", "LangChain", "Python", "TypeScript", "React", "FastAPI", "PostgreSQL", "REST APIs"],
  },
  {
    name: "AI Healthcare Knowledge Platform",
    kicker: "Full-stack conversational search over medical literature",
    date: "Jan 2026",
    url: null,
    stack: ["FastAPI", "React", "PostgreSQL", "LangChain", "FAISS", "OpenAI API"],
    bullets: [
      "FastAPI backend, React front end and PostgreSQL datastore that let clinicians query medical literature through a conversational interface.",
      "RAG pipeline (LangChain, FAISS, OpenAI) that retrieves and ranks passages, reaching 92% answer relevance on an internal evaluation set.",
    ],
    tags: ["FastAPI", "React", "PostgreSQL", "RAG", "LangChain", "FAISS", "LLM Apps", "Offline Evals", "Python"],
  },
  {
    name: "Real-Time Fraud Event Processing",
    kicker: "Event-driven streaming platform for transaction events",
    date: "Nov 2025",
    url: null,
    stack: ["Kafka", "Python", "Spark Structured Streaming", "Prometheus"],
    bullets: [
      "Event-driven architecture with Kafka, Python consumers and Spark Structured Streaming that ingests, validates and enriches 100K+ simulated transaction events per hour.",
      "Modular processing components with clear interfaces, structured logging, and Prometheus dashboards for throughput and error rates.",
    ],
    tags: ["Kafka", "Apache Spark", "Python", "Prometheus", "Microservices"],
  },
];

export const skills = [
  { group: "Backend & APIs", items: ["Python", "Java", "C++", "TypeScript", "SQL", "FastAPI", "REST APIs", "OAuth 2.0", "Microservices", "pytest", "React"] },
  { group: "Data & Infrastructure", items: ["PostgreSQL", "MongoDB", "Redis", "Kafka", "Apache Spark", "ETL Pipelines", "Pandas"] },
  { group: "Automation & DevOps", items: ["CI/CD", "GitHub Actions", "Docker", "Kubernetes", "AWS", "Linux", "Playwright", "Automated Rollback", "MLflow", "Prometheus", "Git"] },
  { group: "AI & LLMs", items: ["LLM Apps", "RAG", "LangChain", "LangGraph", "Tool Calling", "Embeddings", "FAISS", "Pinecone", "pgvector", "Guardrails", "OpenAI · Anthropic · Gemini"] },
  { group: "Machine Learning", items: ["XGBoost", "Scikit-learn", "PyTorch", "Feature Engineering", "PR-AUC Evaluation", "Hugging Face"] },
  { group: "Quality & Delivery", items: ["Offline Evals", "Adversarial Testing", "LangSmith", "Human-in-the-Loop", "Auditability", "Workflow Discovery", "Stakeholder Communication"] },
];

export const education = [
  {
    school: "Northeastern University",
    degree: "Master of Science, Computer Science",
    location: "Boston, MA",
    start: "Sep 2023",
    end: "May 2025",
    sheet: "modern", // blueprint drawing: "modern" or "tower"
    notes: [],
  },
  {
    school: "Pune University",
    degree: "Bachelor of Science, Computer Science",
    location: "Pune, India",
    start: "Aug 2019",
    end: "May 2023",
    sheet: "tower",
    notes: [],
  },
];
