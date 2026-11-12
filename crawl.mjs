// Download every talk's markdown edition from ai.engineer into data/raw/.
// Resumable: files already on disk are skipped. Usage: node crawl.mjs [concurrency]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(ROOT, "data");
const RAW = path.join(DATA, "raw");
fs.mkdirSync(RAW, { recursive: true });

const CONC = +process.argv[2] || 4;
const UA = "talk-translation-crawler/1.0 (authorized)";

async function getJSON(url, file) {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const txt = await res.text();
  fs.writeFileSync(file, txt);
  return JSON.parse(txt);
}

const talks = await getJSON("https://ai.engineer/api/data/talks?format=json", path.join(DATA, "talks.json"));
const key = (t) => new URL(t.url).pathname.split("/").pop(); // e.g. ys6YQ2yfBpM-your-old-prompts...
const todo = talks.filter((t) => !fs.existsSync(path.join(RAW, key(t) + ".md")));
console.log(`catalog=${talks.length} already=${talks.length - todo.length} todo=${todo.length}`);

let done = 0, failed = [];
async function worker() {
  while (todo.length) {
    const t = todo.shift();
    const url = t.url + ".md";
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const res = await fetch(url, { headers: { "user-agent": UA, accept: "text/markdown" } });
        if (res.status === 429 || res.status >= 500) throw new Error("retryable " + res.status);
        if (!res.ok) { failed.push(`${res.status} ${url}`); break; }
        const body = await res.text();
        fs.writeFileSync(path.join(RAW, key(t) + ".md"), body);
        break;
      } catch (e) {
        if (attempt === 4) failed.push(`${e.message} ${url}`);
        else await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
    }
    if (++done % 50 === 0) console.log(`${done} done`);
    await new Promise((r) => setTimeout(r, 250));
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
fs.writeFileSync(path.join(DATA, "crawl-failures.txt"), failed.join("\n"));
console.log(`finished: ${done} fetched, ${failed.length} failed`);
