// Crawl → pick talks → dump English → (Claude translates) → apply → publish.
//   node pipeline.mjs sync              crawl new talks from ai.engineer, re-parse
//   node pipeline.mjs queue [n]         list next n talks still needing translation (new talks first)
//   node pipeline.mjs dump <key>        write data/work/<key>.src.txt  ("path|English" lines)
//   node pipeline.mjs apply <key>       read  data/work/<key>.zh.txt   ("path|中文" lines), validate, merge
//   node pipeline.mjs publish [msg]     regenerate docs/, commit data/zh + docs, push
// Translation scope per talk: title, article title/summary, section titles, article paragraphs,
// takeaways, slide titles. Style rules live in translation-style.md.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const D = (...p) => path.join(ROOT, "data", ...p);
const WORK = D("work");
fs.mkdirSync(WORK, { recursive: true });
const rj = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : d);
const run = (cmd, args) => execFileSync(cmd, args, { cwd: ROOT, stdio: "inherit" });
const keyOf = (t) => new URL(t.url).pathname.split("/").pop();

function sourceStrings(p) {
  const out = {};
  const put = (k, v) => { if (v && v.trim()) out[k] = v; };
  put("title", p.title);
  if (p.article) {
    put("article.title", p.article.title);
    put("article.summary", p.article.summary);
    p.article.sections.forEach((s, i) => {
      put(`article.sections.${i}.title`, s.title);
      s.blocks.forEach((b, j) => { if (b.type === "p") put(`article.sections.${i}.blocks.${j}.text`, b.text); });
    });
  }
  p.takeaways.forEach((t, i) => put(`takeaways.${i}`, t));
  p.slides.forEach((s, i) => put(`slides.${i}.title`, s.title));
  return out;
}
function missing(key) {
  const p = rj(D("parsed", key + ".json"));
  if (!p) return null;
  const zh = rj(D("zh", key + ".json"), {});
  return Object.fromEntries(Object.entries(sourceStrings(p)).filter(([k]) => !zh[k]));
}

const [cmd, arg, ...rest] = process.argv.slice(2);

if (cmd === "sync") {
  run("node", ["crawl.mjs"]);
  run("node", ["parse.mjs"]);
} else if (cmd === "queue") {
  const n = +arg || 3;
  const talks = rj(D("talks.json"), []);
  const rows = [];
  for (const t of talks) {
    const k = keyOf(t), m = missing(k);
    if (!m || !Object.keys(m).length) continue;
    const isNew = !fs.existsSync(D("zh", k + ".json"));
    rows.push({ k, isNew, n: Object.keys(m).length, chars: Object.values(m).join("").length });
  }
  rows.sort((a, b) => b.isNew - a.isNew); // stable: new talks first, then homepage order
  console.log(`pending talks=${rows.length}`);
  for (const r of rows.slice(0, n)) console.log(`${r.k}\t${r.isNew ? "NEW" : "backlog"}\tstrings=${r.n}\tchars=${r.chars}`);
} else if (cmd === "dump") {
  const m = missing(arg);
  if (!m) throw new Error("unknown talk " + arg);
  const lines = Object.entries(m).map(([k, v]) => `${k}|${v.replace(/\r?\n/g, "\\n")}`);
  fs.writeFileSync(path.join(WORK, arg + ".src.txt"), lines.join("\n") + "\n");
  console.log(`dumped ${lines.length} strings, ${Object.values(m).join("").length} chars → data/work/${arg}.src.txt`);
} else if (cmd === "apply") {
  const m = missing(arg) || {};
  const f = path.join(WORK, arg + ".zh.txt");
  const zhFile = D("zh", arg + ".json");
  const zh = rj(zhFile, {});
  const urls = (s) => (s.match(/\]\(([^)\s]+)\)/g) || []).sort().join(" ");
  const ticks = (s) => (s.match(/`/g) || []).length;
  let ok = 0; const bad = [];
  for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const i = line.indexOf("|");
    if (i < 0) continue;
    const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim().replace(/\\n/g, "\n");
    const en = m[k];
    if (en === undefined) { if (!zh[k]) bad.push(`${k}: not a pending key`); continue; }
    if (!/[一-鿿]/.test(v) && en.length > 20) { bad.push(`${k}: no Chinese`); continue; }
    if (urls(v) !== urls(en)) { bad.push(`${k}: links changed`); continue; }
    if (ticks(v) !== ticks(en)) { bad.push(`${k}: backticks changed`); continue; }
    zh[k] = v; ok++;
  }
  fs.writeFileSync(zhFile, JSON.stringify(zh, null, 1));
  const left = Object.keys(missing(arg)).length;
  console.log(`applied=${ok} rejected=${bad.length} stillMissing=${left}`);
  bad.slice(0, 20).forEach((b) => console.log("  ✗ " + b));
  if (!bad.length && !left) for (const s of [".src.txt", ".zh.txt"]) fs.rmSync(path.join(WORK, arg + s), { force: true });
} else if (cmd === "publish") {
  run("node", ["gen.mjs"]);
  run("git", ["add", "data/zh", "docs"]);
  try { execFileSync("git", ["diff", "--cached", "--quiet"], { cwd: ROOT }); console.log("nothing to publish"); process.exit(0); } catch {}
  run("git", ["commit", "-q", "-m", (arg ? [arg, ...rest].join(" ") : "Translate more talks to Chinese") + "\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"]);
  run("git", ["push", "-q", "origin", "main"]);
  console.log("published");
} else {
  console.log("usage: node pipeline.mjs sync | queue [n] | dump <key> | apply <key> | publish [msg]");
}
