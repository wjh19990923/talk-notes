// Build script: turns the talk's markdown export into a static site in ./docs
// Usage: node build.mjs <path-to-talk.md>
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const src = process.argv[2];
if (!src) throw new Error("usage: node build.mjs <talk.md>");
const md = fs.readFileSync(src, "utf8").replace(/\r\n/g, "\n");
const OUT = path.resolve("docs");
const IMG = path.join(OUT, "img");
fs.mkdirSync(IMG, { recursive: true });

const lines = md.split("\n");
const title = lines[0].replace(/^# /, "").trim();
const VIDEO_ID = (md.match(/youtube\.com\/watch\?v=([\w-]{11})/) || [])[1];

// Split into level-2 blocks
const h2 = {};
let cur = null;
for (const l of lines.slice(1)) {
  const m = l.match(/^## (.+)$/);
  if (m) { cur = m[1].trim(); h2[cur] = []; continue; }
  if (cur) h2[cur].push(l);
}
const keys = Object.keys(h2);
const articleKey = keys[0];
const tsRe = /^\[([\d:]+)\]\(https:\/\/www\.youtube\.com\/watch\?v=[\w-]+&t=(\d+)s\)\s*/;

const localImg = (url) => {
  const hash = (url.match(/([0-9a-f]{64})/) || [])[1];
  if (!hash) return url;
  const file = path.join(IMG, hash + ".webp");
  if (!fs.existsSync(file)) {
    process.stdout.write(`download ${hash.slice(0, 8)}…\n`);
    execFileSync("curl", ["-sSL", "--fail", "-o", file, url]);
  }
  return `img/${hash}.webp`;
};

const splitH3 = (block) => {
  const out = [];
  let s = null;
  for (const l of block) {
    const m = l.match(/^### (.+)$/);
    if (m) { s = { title: m[1].trim(), body: [] }; out.push(s); continue; }
    if (s) s.body.push(l);
  }
  return out;
};
const paragraphs = (body) =>
  body.join("\n").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

// Article
const articleBody = h2[articleKey];
const firstH3 = articleBody.findIndex((l) => l.startsWith("### "));
const summary = paragraphs(articleBody.slice(0, firstH3)).join("\n\n");
const sections = splitH3(articleBody).map((s) => {
  const ps = paragraphs(s.body);
  let t = 0, ts = "0:00";
  const blocks = [];
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i];
    const tm = p.match(tsRe);
    if (tm && p.replace(tsRe, "") === "") { ts = tm[1]; t = +tm[2]; continue; }
    const im = p.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (im) {
      const caption = ps[i + 1] && !/^!\[/.test(ps[i + 1]) && ps[i + 1].length < 140 ? ps[++i] : "";
      blocks.push({ type: "img", alt: im[1], src: localImg(im[2]), caption });
      continue;
    }
    blocks.push({ type: "p", text: p });
  }
  return { title: s.title, ts, t, blocks };
});

// Takeaways
const takeaways = (h2["Key takeaways"] || [])
  .filter((l) => l.startsWith("- ")).map((l) => l.slice(2).trim());

// Slides
const slideRe = /^\[([\d:]+)\]\([^)]*&t=(\d+)s\)\s*\[([^\]]*)\]\(([^)]+)\)/;
const slides = splitH3(h2["Slides"] || []).map((s) => {
  const ps = paragraphs(s.body);
  const m = (ps[0] || "").match(slideRe);
  return {
    title: s.title,
    ts: m ? m[1] : "",
    t: m ? +m[2] : 0,
    alt: m ? m[3] : "",
    src: m ? localImg(m[4]) : "",
    text: ps.slice(1).join("\n\n"),
  };
});

// Transcript
const transcript = (h2["Full transcript"] || [])
  .map((l) => l.match(/^\[([\d:]+)\]\([^)]*&t=(\d+)s\)\s*(.*)$/))
  .filter(Boolean)
  .map((m) => ({ ts: m[1], t: +m[2], text: m[3] }));

const data = { title, videoId: VIDEO_ID, source: `https://ai.engineer/talks/${VIDEO_ID}-your-old-prompts-are-making-claude-worse`, summary, sections, takeaways, slides, transcript };
fs.writeFileSync(path.join(OUT, "data.js"), "window.TALK = " + JSON.stringify(data) + ";\n");
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
console.log(`sections=${sections.length} takeaways=${takeaways.length} slides=${slides.length} transcript=${transcript.length} images=${fs.readdirSync(IMG).length}`);
