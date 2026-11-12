// Compact batching for hand translation.
//   node batch.mjs next <maxChars> [keyRegex] [talkKey]  -> prints "id|English" lines, saves id map
//   node batch.mjs apply <file>                          -> reads "id|中文" lines, writes data/zh, trims data/todo
//   node batch.mjs status [keyRegex]                     -> remaining strings/chars
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const dir = (d) => path.join(ROOT, "data", d);
const TODO = dir("todo"), ZH = dir("zh"), MAP = path.join(ROOT, "data", "batch-map.json");
fs.mkdirSync(ZH, { recursive: true });
const rj = (f, d = {}) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : d);
const [cmd, a1, a2, a3] = process.argv.slice(2);

function* pending(re, only) {
  const files = only ? [only + ".json"] : fs.readdirSync(TODO).filter((f) => f.endsWith(".json")).sort();
  for (const f of files) {
    const todo = rj(path.join(TODO, f));
    for (const [k, v] of Object.entries(todo)) if (!re || re.test(k)) yield [f.replace(/\.json$/, ""), k, v];
  }
}

if (cmd === "next") {
  const max = +a1 || 12000, re = a2 && a2 !== "-" ? new RegExp(a2) : null;
  const map = {}, out = [];
  let n = 0, chars = 0;
  for (const [talk, k, v] of pending(re, a3)) {
    const urls = [];
    const masked = v.replace(/\]\((https?:[^)\s]+)\)/g, (_, u) => `](@${urls.push(u) - 1})`);
    if (chars + masked.length > max && n) break;
    map[n] = urls.length ? [talk, k, urls] : [talk, k];
    out.push(`${n}|${masked.replace(/\n/g, "\\n")}`);
    chars += masked.length; n++;
  }
  fs.writeFileSync(MAP, JSON.stringify(map));
  console.log(out.join("\n"));
  console.error(`[${n} strings, ${chars} chars]`);
} else if (cmd === "apply") {
  const map = rj(MAP);
  const lines = fs.readFileSync(a1, "utf8").replace(/\r\n/g, "\n").split("\n").filter((l) => /^\d+\|/.test(l));
  const byTalk = {};
  let ok = 0, bad = 0;
  for (const l of lines) {
    const i = l.indexOf("|"), id = l.slice(0, i), zh = l.slice(i + 1).replace(/\\n/g, "\n").trim();
    if (!map[id] || !zh) { bad++; continue; }
    const [talk, k, urls] = map[id];
    let out = zh;
    if (urls) {
      out = zh.replace(/\]\(@(\d+)\)/g, (m, j) => (urls[+j] ? `](${urls[+j]})` : m));
      if (/\]\(@\d+\)/.test(out)) { bad++; continue; }
    }
    (byTalk[talk] ||= {})[k] = out;
  }
  for (const [talk, kv] of Object.entries(byTalk)) {
    const zf = path.join(ZH, talk + ".json"), tf = path.join(TODO, talk + ".json");
    const zh = rj(zf), todo = rj(tf);
    for (const [k, v] of Object.entries(kv)) { zh[k] = v; delete todo[k]; ok++; }
    fs.writeFileSync(zf, JSON.stringify(zh, null, 1));
    if (Object.keys(todo).length) fs.writeFileSync(tf, JSON.stringify(todo, null, 1));
    else if (fs.existsSync(tf)) fs.unlinkSync(tf);
  }
  const missing = Object.keys(map).length - ok;
  console.log(`applied=${ok} bad=${bad} missingFromBatch=${missing}`);
  fs.unlinkSync(MAP);
} else if (cmd === "status") {
  const re = a1 ? new RegExp(a1) : null;
  let n = 0, c = 0;
  for (const [, , v] of pending(re)) { n++; c += v.length; }
  console.log(`remaining strings=${n} chars=${c}`);
}
