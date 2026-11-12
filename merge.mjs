// Merge translated work files back: data/done/<key>.json ({path: 中文}) -> data/zh/<key>.json.
// Only keys that exist in the matching todo file are accepted; untranslated keys stay in todo.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const dir = (d) => path.join(ROOT, "data", d);
const DONE = dir("done"), TODO = dir("todo"), ZH = dir("zh");
fs.mkdirSync(DONE, { recursive: true });
fs.mkdirSync(ZH, { recursive: true });

let files = 0, keys = 0, rejected = 0;
for (const f of fs.readdirSync(DONE).filter((f) => f.endsWith(".json"))) {
  const done = JSON.parse(fs.readFileSync(path.join(DONE, f), "utf8"));
  const todoFile = path.join(TODO, f);
  const todo = fs.existsSync(todoFile) ? JSON.parse(fs.readFileSync(todoFile, "utf8")) : {};
  const zhFile = path.join(ZH, f);
  const zh = fs.existsSync(zhFile) ? JSON.parse(fs.readFileSync(zhFile, "utf8")) : {};
  for (const [k, v] of Object.entries(done)) {
    if (!(k in todo) || typeof v !== "string" || !v.trim()) { rejected++; continue; }
    zh[k] = v.trim();
    delete todo[k];
    keys++;
  }
  fs.writeFileSync(zhFile, JSON.stringify(zh, null, 1));
  if (Object.keys(todo).length) fs.writeFileSync(todoFile, JSON.stringify(todo, null, 1));
  else if (fs.existsSync(todoFile)) fs.unlinkSync(todoFile);
  fs.unlinkSync(path.join(DONE, f));
  files++;
}
console.log(`merged files=${files} keys=${keys} rejected=${rejected}`);
