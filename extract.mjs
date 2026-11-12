// Build translation work files: data/todo/<key>.json = { "<path>": "<English>" } for the
// requested scopes, skipping strings already present in data/zh/<key>.json.
// Usage: node extract.mjs <scopes> [keys...]
//   scopes: comma list of meta,article,takeaways,resources,slides,transcript (default meta)
//   keys:   talk keys (file names without .json); default all
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PARSED = path.join(ROOT, "data", "parsed");
const ZH = path.join(ROOT, "data", "zh");
const TODO = path.join(ROOT, "data", "todo");
fs.mkdirSync(ZH, { recursive: true });
fs.mkdirSync(TODO, { recursive: true });

export function strings(p, scopes) {
  const out = {};
  const put = (k, v) => { if (v && v.trim()) out[k] = v; };
  if (scopes.has("meta")) {
    put("title", p.title);
    if (p.article) {
      put("article.title", p.article.title);
      put("article.summary", p.article.summary);
      p.article.sections.forEach((s, i) => put(`article.sections.${i}.title`, s.title));
    }
    p.slides.forEach((s, i) => put(`slides.${i}.title`, s.title));
  }
  if (scopes.has("takeaways")) p.takeaways.forEach((t, i) => put(`takeaways.${i}`, t));
  if (scopes.has("article") && p.article)
    p.article.sections.forEach((s, i) =>
      s.blocks.forEach((b, j) => {
        if (b.type === "p") put(`article.sections.${i}.blocks.${j}.text`, b.text);
        else { put(`article.sections.${i}.blocks.${j}.alt`, b.alt); put(`article.sections.${i}.blocks.${j}.caption`, b.caption); }
      })
    );
  if (scopes.has("slides")) p.slides.forEach((s, i) => put(`slides.${i}.alt`, s.alt));
  if (scopes.has("resources")) (p.resources || []).forEach((r, i) => put(`resources.${i}`, r));
  if (scopes.has("transcript")) p.transcript.forEach((l, i) => put(`transcript.${i}.text`, l.text));
  return out;
}

if (process.argv[1] && process.argv[1].endsWith("extract.mjs")) {
  const scopes = new Set((process.argv[2] || "meta").split(","));
  let keys = process.argv.slice(3);
  if (!keys.length) keys = fs.readdirSync(PARSED).map((f) => f.replace(/\.json$/, ""));
  let n = 0, chars = 0;
  for (const k of keys) {
    const p = JSON.parse(fs.readFileSync(path.join(PARSED, k + ".json"), "utf8"));
    const zhFile = path.join(ZH, k + ".json");
    const have = fs.existsSync(zhFile) ? JSON.parse(fs.readFileSync(zhFile, "utf8")) : {};
    const todo = Object.fromEntries(Object.entries(strings(p, scopes)).filter(([key]) => !have[key]));
    if (!Object.keys(todo).length) continue;
    fs.writeFileSync(path.join(TODO, k + ".json"), JSON.stringify(todo, null, 1));
    n++; chars += Object.values(todo).join("").length;
  }
  console.log(`todo files=${n} chars=${chars}`);
}
