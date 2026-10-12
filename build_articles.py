"""Build static, search-engine-indexable pages for every article.

Reads articles/index.json and the Markdown files it lists, then writes:
  - research/<file-name>.html  (one page per article)
  - sitemap.xml

Run it after adding or editing an article, then commit the output:
    python build_articles.py

The Markdown subset mirrors markdownToHtml() in research.html so both views match.
"""

import html
import json
import re
from datetime import date
from pathlib import Path
from urllib.parse import quote

SITE_URL = "https://kumar-abhinav17.vercel.app"
AUTHOR = "Kumar Abhinav"
ROOT = Path(__file__).resolve().parent
ARTICLES_DIR = ROOT / "articles"
OUT_DIR = ROOT / "research"

TABLE_DIVIDER = re.compile(r"^\|?\s*:?-{3,}")


def esc(value):
    return html.escape(str(value), quote=True)


# ---------- Markdown (same subset as research.html) ----------

def parse_front_matter(markdown):
    match = re.match(r"^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?", markdown)
    if not match:
        return {}, markdown.strip()
    meta = {}
    for line in re.split(r"\r?\n", match.group(1)):
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        meta[key.strip()] = re.sub(r"^['\"]|['\"]$", "", value.strip())
    return meta, markdown[match.end():].strip()


def inline_markdown(text):
    out = esc(text)
    out = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", out)
    out = re.sub(r"`([^`]+)`", r"<code>\1</code>", out)
    out = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)",
                 r'<img src="\2" alt="\1" loading="lazy" class="article-figure">', out)
    out = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)",
                 r'<a href="\2" target="_blank" rel="noopener">\1</a>', out)
    return out


def table_to_html(lines):
    rows = [[c.strip() for c in re.sub(r"^\||\|$", "", l).split("|")]
            for idx, l in enumerate(lines) if idx != 1]
    header = rows.pop(0) if rows else []
    head = "".join(f"<th>{inline_markdown(c)}</th>" for c in header)
    body = "".join("<tr>" + "".join(f"<td>{inline_markdown(c)}</td>" for c in r) + "</tr>" for r in rows)
    return f'<table class="risk-table"><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table>'


def quote_to_html(lines):
    kind = ""
    if lines and re.match(r"^\[!TIP\]", lines[0], re.I):
        kind = " tip"
        lines = lines[1:]
    elif lines and re.match(r"^\[!WARNING\]", lines[0], re.I):
        lines = lines[1:]
    return f'<div class="callout{kind}">{inline_markdown(" ".join(lines))}</div>'


def is_table_start(lines, i):
    return lines[i].startswith("|") and i + 1 < len(lines) and TABLE_DIVIDER.match(lines[i + 1])


def markdown_to_html(markdown):
    lines = markdown.replace("\r\n", "\n").split("\n")
    out, i = [], 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        if line.startswith("```"):
            code, i = [], i + 1
            while i < len(lines) and not lines[i].startswith("```"):
                code.append(lines[i])
                i += 1
            i += 1
            out.append(f"<pre><code>{esc(chr(10).join(code))}</code></pre>")
            continue
        heading = re.match(r"^(#{2,4})\s+(.+)$", line)
        if heading:
            level = len(heading.group(1))
            out.append(f"<h{level}>{inline_markdown(heading.group(2))}</h{level}>")
            i += 1
            continue
        if is_table_start(lines, i):
            table = []
            while i < len(lines) and lines[i].startswith("|"):
                table.append(lines[i])
                i += 1
            out.append(table_to_html(table))
            continue
        if line.startswith(">"):
            quote = []
            while i < len(lines) and lines[i].startswith(">"):
                quote.append(re.sub(r"^>\s?", "", lines[i]))
                i += 1
            out.append(quote_to_html(quote))
            continue
        if re.match(r"^[-*]\s+", line):
            items = []
            while i < len(lines) and re.match(r"^[-*]\s+", lines[i]):
                items.append(re.sub(r"^[-*]\s+", "", lines[i]))
                i += 1
            out.append("<ul>" + "".join(f"<li>{inline_markdown(it)}</li>" for it in items) + "</ul>")
            continue
        if re.match(r"^\d+\.\s+", line):
            items = []
            while i < len(lines) and re.match(r"^\d+\.\s+", lines[i]):
                items.append(re.sub(r"^\d+\.\s+", "", lines[i]))
                i += 1
            out.append("<ol>" + "".join(f"<li>{inline_markdown(it)}</li>" for it in items) + "</ol>")
            continue
        para = []
        while (i < len(lines) and lines[i].strip()
               and not re.match(r"^(#{2,4})\s+", lines[i])
               and not lines[i].startswith("```")
               and not lines[i].startswith(">")
               and not re.match(r"^[-*]\s+", lines[i])
               and not re.match(r"^\d+\.\s+", lines[i])
               and not is_table_start(lines, i)):
            para.append(lines[i])
            i += 1
        out.append(f"<p>{inline_markdown(' '.join(para))}</p>")
    return "\n".join(out)


def estimate_read_time(text):
    return f"{max(1, round(len(text.split()) / 180))} min read"


# ---------- Page template ----------

PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | {author}</title>
    <meta name="description" content="{excerpt}">
    <meta name="author" content="{author}">
    <meta name="theme-color" content="#030712">
    <link rel="canonical" href="{url}">
    <link rel="icon" href="../favicon.ico" sizes="32x32">
    <link rel="icon" href="../favicon.svg" type="image/svg+xml">

    <meta property="og:type" content="article">
    <meta property="og:site_name" content="{author}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{excerpt}">
    <meta property="og:url" content="{url}">
    <meta property="og:image" content="{site}/og-image.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="article:author" content="{author}">
    <meta name="twitter:card" content="summary_large_image">

    <script type="application/ld+json">
{json_ld}
    </script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="../research.css">
</head>
<body data-page="research" class="reader-open article-page">
    <a href="#main-content" class="skip-link">Skip to content</a>

    <div class="bg-effects" aria-hidden="true">
        <div class="bg-gradient-orb orb-1"></div>
        <div class="bg-gradient-orb orb-2"></div>
        <div class="bg-noise"></div>
    </div>

    <nav class="navbar scrolled" id="navbar">
        <div class="nav-container">
            <a href="../index.html" class="nav-logo" aria-label="Kumar Abhinav portfolio home">
                <span class="logo-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <path d="M9 12l2 2 4-5"/>
                    </svg>
                </span>
                <span class="logo-text">K<span class="logo-dot">.</span>Abhinav</span>
            </a>
            <div class="nav-links" id="nav-links">
                <a href="../index.html#about" class="nav-link">About</a>
                <a href="../index.html#projects" class="nav-link">Projects</a>
                <a href="../index.html#experience" class="nav-link">Experience</a>
                <a href="../research.html" class="nav-link active-link">Research</a>
                <a href="../index.html#contact" class="nav-link nav-cta">Let's Talk</a>
            </div>
            <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-links">
                <span class="toggle-line"></span>
                <span class="toggle-line"></span>
                <span class="toggle-line"></span>
            </button>
        </div>
    </nav>

    <main id="main-content">
        <section class="research-page-shell">
            <div class="container">
                <article class="reader-view">
                    <div class="reader-shell">
                        <div class="reader-top">
                            <a class="back-btn" href="../research.html">&lt;- All Research</a>
                            <div class="share-toolbar">{share}</div>
                        </div>
                        <header class="reader-header">
                            <span class="article-category">{category}</span>
                            <h1>{title}</h1>
                            <div class="article-meta">
                                <span>{author}</span>
                                <span>{date_text}</span>
                                <span>{read_time}</span>
                            </div>
                        </header>
                        <div class="reader-body">
{body}
                        </div>
                        <div class="reader-bottom-actions">
                            <a class="back-btn" href="../research.html">&lt;- All Research</a>
                            <div class="share-toolbar">{share}</div>
                        </div>
                    </div>
                </article>
            </div>
        </section>
    </main>

    <script src="../script.js"></script>
</body>
</html>
"""


def share_links(title, url):
    q_url, q_text = quote(url, safe=""), quote(f"{title} {url}", safe="")
    return (
        f'<a class="share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url={q_url}" target="_blank" rel="noopener">LinkedIn</a>'
        f'<a class="share-btn" href="https://twitter.com/intent/tweet?text={q_text}" target="_blank" rel="noopener">X</a>'
        f'<a class="share-btn" href="https://wa.me/?text={q_text}" target="_blank" rel="noopener">WhatsApp</a>'
    )


def build():
    files = [item["file"] for item in json.loads((ARTICLES_DIR / "index.json").read_text(encoding="utf-8")) if item.get("file")]
    OUT_DIR.mkdir(exist_ok=True)
    pages = []

    for file in files:
        meta, body = parse_front_matter((ARTICLES_DIR / file).read_text(encoding="utf-8"))
        slug = file[:-3] if file.endswith(".md") else file
        title = meta.get("title") or slug.replace("-", " ").title()
        excerpt = meta.get("excerpt") or re.sub(r"[#>*_`|-]", "", body.split("\n\n")[0])[:150]
        author = meta.get("author") or AUTHOR
        url = f"{SITE_URL}/research/{slug}.html"

        json_ld = json.dumps({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": title,
            "description": excerpt,
            "author": {"@type": "Person", "name": author, "url": f"{SITE_URL}/"},
            "mainEntityOfPage": url,
            "image": f"{SITE_URL}/og-image.jpg",
            "articleSection": meta.get("category") or "Research",
        }, indent=2, ensure_ascii=False)
        json_ld = "\n".join("    " + line for line in json_ld.replace("</", "<\\/").splitlines())

        page = PAGE.format(
            title=esc(title), excerpt=esc(excerpt), author=esc(author), url=esc(url), site=SITE_URL,
            json_ld=json_ld, category=esc(meta.get("category") or "Research"),
            date_text=esc(meta.get("date", "")),
            read_time=esc(meta.get("readTime") or meta.get("readtime") or estimate_read_time(body)),
            body=markdown_to_html(body), share=share_links(title, url),
        )
        (OUT_DIR / f"{slug}.html").write_text(page, encoding="utf-8", newline="\n")
        pages.append(f"research/{slug}.html")
        print(f"built research/{slug}.html")

    today = date.today().isoformat()
    urls = ["", "research.html", *pages]
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>',
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for path in urls:
        sitemap.append(f"  <url><loc>{SITE_URL}/{path}</loc><lastmod>{today}</lastmod></url>")
    sitemap.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(sitemap) + "\n", encoding="utf-8", newline="\n")
    print(f"built sitemap.xml ({len(urls)} urls)")


if __name__ == "__main__":
    build()
