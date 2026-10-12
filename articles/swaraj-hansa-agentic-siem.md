---
id: swaraj-hansa
title: "Inside Swaraj Hansa: Designing an Agentic, Multi-Tenant SIEM You Can Actually Trust"
category: Engineering
date: October 2026
readTime: 9 min read
excerpt: How I architected an LLM-assisted SIEM for a multi-client MSSP — where the model never gets to decide on its own, every tenant is isolated at four layers, and no log data ever leaves the environment.
featured: true
author: Kumar Abhinav
authorInitials: KA
---

Most "AI SIEM" demos put a language model in the critical path and hope for the best. In a managed security service, where one platform watches many clients at once, that is not good enough. The question is not "can an LLM summarise an alert" — it clearly can. The question is: **can you put one into a production detection pipeline without letting it leak data across tenants, invent verdicts, or be talked out of its job by a crafted log line?**

Swaraj Hansa is ESDS's answer to that, and I architected and led the build of it. This is how the system is put together and, more importantly, where the model is deliberately *not* trusted.

![Swaraj Hansa architecture: Wazuh agents over mTLS into Logstash and Kafka, a normaliser, deterministic risk scoring that gates a local LLM triage layer, then PostgreSQL and OpenSearch feeding a FastAPI and React analyst console, over a four-layer tenant isolation band.](/assets/swaraj-hansa-architecture.svg)

## The pipeline

Telemetry flows through a deliberately boring, auditable path:

- **Collection.** Wazuh agents ship endpoint and log data to a central Logstash over **mutual TLS** — the client's identity is its certificate, not a header it can forge.
- **Streaming.** Kafka gives the system a durable buffer, so a burst of events or a slow downstream never drops data on the floor.
- **Normalisation.** Events are coerced into a common schema and enriched with threat intelligence (AbuseIPDB, VirusTotal) before anything looks at them.
- **Dual store.** Incidents and verdicts live in **PostgreSQL 16**; raw, searchable events live in **OpenSearch**, with one index per tenant.
- **Console.** Analysts work in a FastAPI + React application with a tenant-scoped chat assistant.

Nothing above is novel on its own. The design work is in the two places the AI touches: the triage path and the chat assistant.

## The model does not decide — a risk score does

A language model is expensive, slow, and non-deterministic. You do not want it running on every alert, and you do not want its opinion to be the final word. So before any model is invoked, a **deterministic risk score** runs: severity, threat-intel reputation, and MITRE ATT&CK weighting combine into a number. Only high-risk alerts are handed to the LLM at all.

When the model does run, its authority is boxed in:

- It receives untrusted log data inside explicitly labelled, untrusted prompt blocks — sanitised first (control characters stripped, known injection phrases neutralised, fields truncated to 2,000 characters).
- It must answer in a **fixed JSON verdict schema**. Anything malformed, uncertain, or out of range fails safe to `NEEDS_REVIEW` rather than being guessed.
- Every verdict lands in an **analyst review queue** that records the human decision. The model proposes; a person disposes.

> [!TIP]
> This is the single most important design choice in the system: the LLM is a fast first-pass analyst with a deterministic gate in front of it and a human behind it — never an autonomous authority. It maps directly onto the OWASP Top 10 for LLM Applications risks of *prompt injection*, *improper output handling*, and *excessive agency*.

## The chat assistant is scoped, not clever

The analyst-facing assistant is where "excessive agency" usually sneaks in. Here it is constrained on every side:

- Its tools are **tenant-scoped and enforced server-side** via the Model Context Protocol — the model cannot reach another client's data even if it is asked to.
- A **topic filter** runs before the model does, so off-scope requests never reach it.
- Answers are grounded in tool results, it does not disclose detection rules, and it **cannot override a stored verdict**.

## Four layers of tenant isolation

In a multi-client MSSP, a cross-tenant leak is the worst thing that can happen. So isolation is not one control, it is four, each independent of the others:

1. **Ingress identity** from mTLS certificates — unknown clients are dead-lettered, not guessed at.
2. **Per-tenant OpenSearch indices** — separate data stores, not a shared index with a filter.
3. **PostgreSQL row-level security (RLS)** — the database itself refuses cross-tenant reads.
4. **Application-level scoping**, with any cross-tenant action dual-logged.

And because inference runs **locally via Ollama**, no prompt data — no logs, no customer telemetry — ever leaves the environment to reach a third-party API.

## Did it actually work?

A design is a hypothesis until you test it. End to end, the pipeline took **105 raw alerts down to ~18 deduplicated incidents**, and routed **7 out of 7 seeded attack scenarios to the correct queue**. A load-test harness exercises it from 100 up to 5,000 EPS against a 100–1,000 EPS per-tenant design target, and tiered retention (Kafka 24h–14d, OpenSearch 30–180 days, incidents ~1 year) keeps storage honest.

## What I would tell anyone building one

If you take one thing from this: **decide what your model is allowed to be wrong about before you write a line of prompt.** In security, the answer is usually "very little." Put a deterministic gate in front of it, a human behind it, a strict schema around it, and hard tenant boundaries underneath it — then the LLM becomes a genuine force multiplier instead of a liability you have to apologise for later.

*Swaraj Hansa is a managed SIEM product at ESDS. You can read the official product overview [on the ESDS site](https://www.esds.co.in/security-information-and-event-management).*
