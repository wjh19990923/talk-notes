// Parse every data/raw/*.md into structured JSON (data/parsed/<key>.json).
// Also writes data/stats.json with character counts per part, to size translation work.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(ROOT, "data", "raw");
const OUT = path.join(ROOT, "data", "parsed");
fs.mkdirSync(OUT, { recursive: true });

const tsRe = /^\[([\d:]+)\]\(https:\/\/www\.youtube\.com\/watch\?v=[\w-]+&t=(\d+)s\)\s*/;
const slideRe = /^\[([\d:]+)\]\([^)]*&t=(\d+)s\)\s*\[([^\]]*)\]\(([^)]+)\)/;

const paragraphs = (lines) => lines.join("\n").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
function splitBy(lines, re) {
  const out = [];
  let s = null;
  const pre = [];
  for (const l of lines) {
    const m = l.match(re);
    if (m) { s = { title: m[1].trim(), body: [] }; out.push(s); continue; }
    (s ? s.body : pre).push(l);
  }
  return { pre, out };
}

export function parseTalk(md) {
  md = md.replace(/\r\n/g, "\n");
  const lines = md.split("\n");
  const title = lines[0].replace(/^# /, "").trim();
  const videoId = (md.match(/youtube\.com\/watch\?v=([\w-]{11})/) || [])[1] || null;
  // Only the first H2 (the article) and the known fixed sections start a block; any other
  // "## X" line belongs to the content it sits in (e.g. a prompt quoted inside an article).
  const fixed = new Set(["Key takeaways", "Slides", "Full transcript", "Transcript", "Summary", "Resources"]);
  const headLines = [], h2 = [];
  let curBlock = null;
  for (const l of lines.slice(1)) {
    const m = l.match(/^## (.+)$/);
    if (m && (!h2.length || fixed.has(m[1].trim()))) { curBlock = { title: m[1].trim(), body: [] }; h2.push(curBlock); continue; }
    if (m) { curBlock.body.push("", `**${m[1].trim()}**`, ""); continue; }
    (curBlock ? curBlock.body : headLines).push(l);
  }
  const byName = Object.fromEntries(h2.map((b) => [b.title, b.body]));
  const byline = paragraphs(headLines)[0] || "";
  const art = h2.find((b) => !fixed.has(b.title));
  let article = null;
  if (art) {
    const { pre, out } = splitBy(art.body, /^### (.+)$/);
    article = {
      title: art.title,
      summary: paragraphs(pre).join("\n\n"),
      sections: out.map((s) => {
        const ps = paragraphs(s.body);
        let t = null, ts = null;
        const blocks = [];
        for (let i = 0; i < ps.length; i++) {
          const p = ps[i];
          const tm = p.match(tsRe);
          if (tm && p.replace(tsRe, "") === "") { ts = tm[1]; t = +tm[2]; continue; }
          const im = p.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
          if (im) {
            const caption = ps[i + 1] && !/^!\[/.test(ps[i + 1]) && ps[i + 1].length < 160 ? ps[++i] : "";
            blocks.push({ type: "img", alt: im[1], src: im[2], caption });
            continue;
          }
          blocks.push({ type: "p", text: p });
        }
        return { title: s.title, ts, t, blocks };
      }),
    };
  }

  const takeaways = (byName["Key takeaways"] || []).filter((l) => l.startsWith("- ")).map((l) => l.slice(2).trim());

  const slides = splitBy(byName["Slides"] || [], /^### (.+)$/).out.map((s) => {
    const ps = paragraphs(s.body);
    const m = (ps[0] || "").match(slideRe);
    return {
      title: s.title,
      ts: m ? m[1] : null,
      t: m ? +m[2] : null,
      alt: m ? m[3] : "",
      src: m ? m[4] : null,
      text: (m ? ps.slice(1) : ps).join("\n\n"),
    };
  });

  const tBody = byName["Full transcript"] || byName["Transcript"] || [];
  const transcript = tBody
    .map((l) => l.match(/^\[([\d:]+)\]\([^)]*&t=(\d+)s\)\s*(.*)$/))
    .filter(Boolean)
    .map((m) => ({ ts: m[1], t: +m[2], text: m[3] }));

  const resources = (byName["Resources"] || []).map((l) => l.replace(/^[-*]\s+/, "").trim()).filter(Boolean);

  return { title, byline, videoId, article, takeaways, slides, transcript, resources, otherSections: h2.map((b) => b.title).filter((t) => t !== art?.title && !fixed.has(t)) };
}

if (process.argv[1] && process.argv[1].endsWith("parse.mjs")) {
  const files = fs.readdirSync(RAW).filter((f) => f.endsWith(".md"));
  const stats = { talks: 0, chars: { meta: 0, article: 0, takeaways: 0, slideTitlesAlt: 0, slideText: 0, transcript: 0 }, noArticle: 0, noTranscript: 0, unknownSections: {} };
  for (const f of files) {
    const p = parseTalk(fs.readFileSync(path.join(RAW, f), "utf8"));
    fs.writeFileSync(path.join(OUT, f.replace(/\.md$/, ".json")), JSON.stringify(p));
    stats.talks++;
    const c = stats.chars;
    c.meta += p.title.length;
    if (p.article) {
      c.article += p.article.title.length + p.article.summary.length;
      for (const s of p.article.sections) {
        c.article += s.title.length;
        for (const b of s.blocks) c.article += b.type === "p" ? b.text.length : b.alt.length + b.caption.length;
      }
    } else stats.noArticle++;
    c.takeaways += p.takeaways.join("").length;
    for (const s of p.slides) { c.slideTitlesAlt += s.title.length + s.alt.length; c.slideText += s.text.length; }
    c.transcript += p.transcript.reduce((a, l) => a + l.text.length, 0);
    if (!p.transcript.length) stats.noTranscript++;
    for (const o of p.otherSections) stats.unknownSections[o] = (stats.unknownSections[o] || 0) + 1;
  }
  fs.writeFileSync(path.join(ROOT, "data", "stats.json"), JSON.stringify(stats, null, 1));
  console.log(JSON.stringify(stats, null, 1));
}
