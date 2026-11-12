// Generate the Chinese static site into docs/ from data/talks.json, data/parsed/*.json and
// the translation overlays data/zh/*.json (any string not yet translated falls back to English).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(ROOT, "data");
const OUT = path.join(ROOT, "docs");
const SRC_ASSETS = path.join(ROOT, "site-src");

const readJSON = (f, d = {}) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : d);
const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const inline = (s = "") =>
  esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
// Render a multi-paragraph markdown block (paragraphs + standalone images)
const mdBlock = (s = "") =>
  s.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p) => {
    const im = p.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    return im ? `<figure><img src="${esc(im[2])}" alt="${esc(im[1])}" loading="lazy" class="zoom" referrerpolicy="no-referrer" /></figure>` : `<p>${inline(p)}</p>`;
  }).join("");
const firstPara = (s = "") => (s.split(/\n{2,}/).find((p) => p.trim() && !p.trim().startsWith("![")) || "").trim();
const fmtDur = (ms) => {
  const t = Math.round(ms / 1000), h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0");
};

const talks = readJSON(path.join(DATA, "talks.json"), []);
const cat = readJSON(path.join(DATA, "zh", "_catalog.json"));
const keyOf = (t) => new URL(t.url).pathname.split("/").pop();

// ---------- shared shell ----------
const shell = ({ title, desc = "", body, depth = 0, extraHead = "" }) => {
  const up = "../".repeat(depth);
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc.slice(0, 160))}" />
<link rel="stylesheet" href="${up}assets/style.css" />
${extraHead}
</head>
<body>
<header class="topbar">
  <a class="brand" href="${up}index.html">AI 工程师 · 中文版</a>
  <nav class="topnav"><a href="${up}index.html">全部演讲</a></nav>
</header>
${body}
<footer class="foot wrap">
  中文版内容经授权翻译自 <a href="https://ai.engineer/talks" target="_blank" rel="noopener">AI Engineer</a> 的演讲库；视频版权归原作者所有。翻译仅供参考，如有出入以英文原文为准。
</footer>
</body>
</html>`;
};

// ---------- talk pages ----------
const lib = [];
let pages = 0;
for (const t of talks) {
  const key = keyOf(t);
  const pf = path.join(DATA, "parsed", key + ".json");
  if (!fs.existsSync(pf)) continue;
  const p = readJSON(pf);
  const zh = readJSON(path.join(DATA, "zh", key + ".json"));
  const tr = (k, en) => zh[k] || en || "";
  const trCount = Object.keys(zh).length;

  const title = tr("title", p.title);
  const speakers = (t.speakers || []).map((s) => s.name).join("、");
  const dur = t.durationMs ? fmtDur(t.durationMs) : "";
  const topics = (t.topics || []).map((x) => ({ slug: x.slug, name: cat["topic." + x.slug] || x.name }));
  const summary = cat["summary." + key] || tr("article.summary", p.article?.summary) || t.summary || "";
  const vid = p.videoId || t.videoId;

  const secs = p.article?.sections || [];
  const chapters = secs.filter((s) => s.t != null).map((s, i) => ({ t: s.t, ts: s.ts, title: tr(`article.sections.${secs.indexOf(s)}.title`, s.title) }));

  const slidesHtml = p.slides
    .map((s, i) => `<article class="slide">
      <img src="${esc(s.src || "")}" alt="${esc(tr(`slides.${i}.alt`, s.alt))}" loading="lazy" data-lb="${i}" data-cap="${esc(tr(`slides.${i}.title`, s.title))}" referrerpolicy="no-referrer" />
      <div class="body">
        <h3>${esc(tr(`slides.${i}.title`, s.title))}</h3>
        <p>${esc(tr(`slides.${i}.alt`, s.alt))}</p>
        ${s.text ? `<details><summary>幻灯片原文</summary><pre>${esc(s.text)}</pre></details>` : ""}
        ${s.t != null ? `<button class="ts" data-t="${s.t}">▶ ${s.ts}</button>` : ""}
      </div></article>`)
    .join("");

  const sectionsHtml = secs
    .map((s, i) => `<section class="section" id="sec-${i + 1}">
      <div class="section-head"><span class="num">${String(i + 1).padStart(2, "0")}</span>
      ${s.t != null ? `<button class="seek" data-t="${s.t}">▶ ${s.ts}</button>` : ""}</div>
      <h3>${esc(tr(`article.sections.${i}.title`, s.title))}</h3>
      ${s.blocks
        .map((b, j) =>
          b.type === "img"
            ? `<figure><img src="${esc(b.src)}" alt="${esc(tr(`article.sections.${i}.blocks.${j}.alt`, b.alt))}" loading="lazy" class="zoom" referrerpolicy="no-referrer" /><figcaption>${esc(tr(`article.sections.${i}.blocks.${j}.caption`, b.caption) || tr(`article.sections.${i}.blocks.${j}.alt`, b.alt))}</figcaption></figure>`
            : `<p>${inline(tr(`article.sections.${i}.blocks.${j}.text`, b.text))}</p>`
        )
        .join("\n")}
    </section>`)
    .join("\n");

  const body = `<main class="wrap">
  <section class="hero">
    <a class="back" href="../../index.html">← 全部演讲</a>
    <h1>${esc(title)}</h1>
    ${title !== p.title ? `<div class="orig-title">${esc(p.title)}</div>` : ""}
    <div class="meta"><span class="speaker">${esc(speakers)}</span>${t.event ? ` · ${esc(t.event)}` : ""}${dur ? ` · ${dur}` : ""}</div>
    <div class="tags">${topics.map((x) => `<a class="tag" href="../../index.html#topic=${x.slug}">${esc(x.name)}</a>`).join("")}</div>
    <div class="actions">
      ${p.article ? `<a class="btn primary" href="#article">阅读全文</a>` : ""}
      ${p.slides.length ? `<a class="btn" href="#slides">幻灯片</a>` : ""}
      ${p.transcript.length ? `<a class="btn" href="#transcript">逐字稿</a>` : ""}
      <a class="btn" href="${esc(t.url)}" target="_blank" rel="noopener">英文原页 ↗</a>
    </div>
  </section>

  <section class="player-wrap">
    <div class="player"><div id="yt" data-video="${esc(vid || "")}"></div>
      <a class="yt-fallback" href="https://www.youtube.com/watch?v=${esc(vid || "")}" target="_blank" rel="noopener">在 YouTube 打开 ↗</a></div>
    <aside class="chapters">
      <div class="now"><div class="label">正在播放 <span id="clock">0:00</span></div><div id="nowTitle" class="now-title">${esc(chapters[0]?.title || "")}</div></div>
      <div class="label row">章节跳转 <span>共 ${chapters.length} 节</span></div>
      <ol id="chapterList" class="chapter-list">${chapters.map((c) => `<li data-t="${c.t}"><span class="ts">${c.ts}</span><span>${esc(c.title)}</span></li>`).join("")}</ol>
    </aside>
  </section>

  ${p.slides.length ? `<section id="slides" class="block">
    <div class="block-head"><h2>幻灯片章节</h2><div class="slide-nav"><button class="icon" id="slidePrev">←</button><button class="icon" id="slideNext">→</button></div></div>
    <p class="muted">共 ${p.slides.length} 组幻灯片与演示 · 时间戳为近似值</p>
    <div id="slideStrip" class="slide-strip">${slidesHtml}</div>
  </section>` : ""}

  ${p.article ? `<section id="article" class="block article"><div class="article-grid">
    <nav class="toc"><div class="label">本文目录</div><ol id="toc">${secs.map((s, i) => `<li><a href="#sec-${i + 1}">${esc(tr(`article.sections.${i}.title`, s.title))}</a></li>`).join("")}</ol></nav>
    <div>
      <div class="label accent">阅读全文</div>
      <h2 class="article-title">${esc(tr("article.title", p.article.title))}</h2>
      <div class="lede">${mdBlock(tr("article.summary", p.article.summary))}</div>
      ${sectionsHtml}
    </div></div></section>` : ""}

  ${p.takeaways.length ? `<section id="takeaways" class="block"><h2>要点总结</h2><ul class="takeaways">${p.takeaways.map((x, i) => `<li>${inline(tr(`takeaways.${i}`, x))}</li>`).join("")}</ul></section>` : ""}

  ${(p.resources || []).length ? `<section id="resources" class="block"><h2>延伸阅读</h2><ul class="resources">${p.resources.map((r, i) => `<li>${inline(tr(`resources.${i}`, r))}</li>`).join("")}</ul></section>` : ""}

  ${p.transcript.length ? `<section id="transcript" class="block">
    <div class="block-head"><h2>完整逐字稿</h2>
      <div class="tools"><input id="tSearch" type="search" placeholder="搜索逐字稿…" /><label class="follow"><input type="checkbox" id="follow" checked /> 跟随视频</label></div></div>
    <div id="transcriptList" class="transcript">${p.transcript.map((l, i) => `<div class="tline" data-t="${l.t}"><span class="ts">${l.ts}</span><span class="tx">${esc(tr(`transcript.${i}.text`, l.text))}</span></div>`).join("")}</div>
  </section>` : ""}
</main>
<div id="lightbox" class="lightbox" hidden><button class="icon close" id="lbClose">✕</button><button class="icon" id="lbPrev">←</button><figure><img id="lbImg" alt="" referrerpolicy="no-referrer" /><figcaption id="lbCap"></figcaption></figure><button class="icon" id="lbNext">→</button></div>
<script src="../../assets/talk.js"></script>`;

  const dir = path.join(OUT, "talks", key);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), shell({ title: `${title} | AI 工程师中文版`, desc: firstPara(summary), body, depth: 2 }));
  pages++;

  lib.push({
    k: key, ti: title, en: p.title, ev: t.event || "", sp: speakers, d: dur, v: vid,
    tp: (t.topics || []).map((x) => x.slug),
    s: firstPara(summary).replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").slice(0, 220), zh: trCount > 0 ? 1 : 0,
  });
}

// ---------- library ----------
const topicNames = {};
for (const t of talks) for (const x of t.topics || []) topicNames[x.slug] = cat["topic." + x.slug] || x.name;
fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
fs.writeFileSync(path.join(OUT, "assets", "library-data.js"), "window.LIB=" + JSON.stringify(lib) + ";window.TOPICS=" + JSON.stringify(topicNames) + ";\n");
const libBody = `<main class="wrap">
  <section class="hero">
    <h1>AI 工程师大会 · 演讲库中文版</h1>
    <p class="lede">收录 AI Engineer 历届大会的 <span id="total"></span> 场演讲：中文文章、幻灯片解读与逐字稿。</p>
    <div class="filters">
      <input id="q" type="search" placeholder="搜索标题、讲者、公司…" />
      <select id="ev"><option value="">全部大会</option></select>
      <select id="tp"><option value="">全部主题</option></select>
      <label class="follow"><input type="checkbox" id="onlyZh" /> 仅显示已翻译</label>
    </div>
    <p class="muted" id="count"></p>
  </section>
  <section id="grid" class="grid"></section>
  <div class="more"><button class="btn" id="more">加载更多</button></div>
</main>
<script src="assets/library-data.js"></script>
<script src="assets/library.js"></script>`;
fs.writeFileSync(path.join(OUT, "index.html"), shell({ title: "AI 工程师大会演讲库 · 中文版", desc: "AI Engineer 大会演讲的中文翻译：文章、幻灯片与逐字稿。", body: libBody }));

for (const f of fs.readdirSync(SRC_ASSETS)) fs.copyFileSync(path.join(SRC_ASSETS, f), path.join(OUT, "assets", f));
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
console.log(`pages=${pages} translated=${lib.filter((x) => x.zh).length}`);
