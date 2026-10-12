---
id: owasp-llm
title: OWASP Top 10 for LLMs - A Practitioner's Breakdown
category: OWASP
date: May 31, 2026
readTime: 10 min read
excerpt: The 2025 LLM risk list translated into examples, severity thinking, and mitigation choices for builders.
featured: false
---

The OWASP GenAI Security Project's 2025 LLM Top 10 reframes AI application security around systems, not just models. The risk is rarely "the model is bad" in isolation. It is the model plus retrieval, tools, permissions, data flows, and people trusting the output.

## Severity Matrix

| Risk | Typical Impact | Priority | Primary Control |
| --- | --- | --- | --- |
| LLM01 Prompt Injection | Instruction override, tool misuse | Critical | Trust boundaries and tool gates |
| LLM02 Sensitive Information Disclosure | Data leakage | High | Data minimization and redaction |
| LLM03 Supply Chain | Compromised models, plugins, datasets | High | SBOM/AIBOM and provenance |
| LLM04 Data and Model Poisoning | Corrupted behavior or retrieval | High | Dataset validation and monitoring |
| LLM05 Improper Output Handling | XSS, command injection, unsafe execution | Critical | Output validation |
| LLM06 Excessive Agency | Unintended state-changing actions | Critical | Least privilege and approvals |
| LLM07 System Prompt Leakage | Policy and internal logic disclosure | Medium | Secret hygiene and policy design |
| LLM08 Vector and Embedding Weaknesses | RAG manipulation, data poisoning | High | Retrieval controls |
| LLM09 Misinformation | Unsafe decisions from false output | High | Grounding and verification |
| LLM10 Unbounded Consumption | Cost blowout or resource exhaustion | Medium | Rate limits and budgets |

## LLM01: Prompt Injection

Attackers craft input that changes model behavior. Direct injection arrives from a user; indirect injection hides in retrieved content.

> [!WARNING]
> Real-world case: a web page included hidden text telling a browser assistant to ignore its task and reveal data from the session context.

Mitigation: label untrusted content, restrict tools, validate actions, and treat model output as untrusted until checked.

## LLM02: Sensitive Information Disclosure

Models can expose secrets through chat responses, logs, traces, embeddings, or overly broad retrieval.

> [!WARNING]
> Real-world case: an internal assistant answered a query with ticket data the user was not authorized to view because retrieval ignored ACLs.

Mitigation: enforce authorization at retrieval time, redact secrets, and avoid placing sensitive data in prompts unless necessary.

## LLM03: Supply Chain

AI apps depend on models, packages, prompt templates, datasets, plugins, and external services. Any of them can be compromised.

> [!WARNING]
> Real-world case: a dependency update changed a helper library used by an AI workflow, silently altering request handling.

Mitigation: pin dependencies, review model provenance, scan packages, and maintain an AI bill of materials.

## LLM04: Data and Model Poisoning

Attackers manipulate training, fine-tuning, or embedding data to bias outputs or create triggers.

> [!WARNING]
> Real-world case: a poisoned knowledge article made the assistant prefer an attacker-controlled domain in answers.

Mitigation: validate dataset sources, monitor drift, separate trusted and untrusted corpora, and review high-impact documents.

## LLM05: Improper Output Handling

Model output becomes dangerous when it is rendered, executed, queried, or passed to tools without validation.

> [!WARNING]
> Real-world case: an assistant generated HTML that was inserted into an admin page without sanitization.

Mitigation: escape output, validate against schemas, sandbox generated code, and never pass raw model output to privileged interpreters.

## LLM06: Excessive Agency

Agents become risky when they can take actions beyond what the user intended or what the application can safely supervise.

> [!WARNING]
> Real-world case: an autonomous workflow closed and reassigned tickets because it over-interpreted a summary instruction.

Mitigation: use least privilege, per-action approvals, dry-run modes, and small bounded tool scopes.

## LLM07: System Prompt Leakage

System prompts often reveal architecture hints, policy logic, hidden tool names, or operational assumptions.

> [!WARNING]
> Real-world case: a jailbreak asked for the hidden instruction block and exposed internal routing rules.

Mitigation: avoid secrets in prompts, assume policy text can leak, and keep security controls outside the prompt when possible.

## LLM08: Vector and Embedding Weaknesses

RAG systems can retrieve the wrong content, leak neighbor data, or rank malicious content highly.

> [!WARNING]
> Real-world case: a malicious document used repeated semantic phrases to dominate retrieval results.

Mitigation: enforce ACLs in vector queries, add source reputation, detect duplicate stuffing, and cap per-source retrieval.

## LLM09: Misinformation

Incorrect output becomes a security issue when users rely on it for operational, legal, medical, financial, or safety decisions.

> [!WARNING]
> Real-world case: a support bot invented a security exception process that users followed.

Mitigation: ground answers in cited sources, require confidence thresholds, and route high-impact answers to human review.

## LLM10: Unbounded Consumption

Attackers can drive token, compute, storage, or tool-use costs through oversized inputs, loops, or repeated requests.

> [!WARNING]
> Real-world case: a public endpoint accepted long recursive prompts and exhausted daily inference budget.

Mitigation: set token budgets, rate limits, recursion caps, timeouts, and per-user cost controls.
