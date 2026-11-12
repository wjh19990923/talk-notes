(() => {
  const L = window.LIB, T = window.TOPICS, $ = (s) => document.querySelector(s);
  const esc = (s = "") => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  $("#total").textContent = L.length;
  const events = [...new Set(L.map((x) => x.ev).filter(Boolean))].sort().reverse();
  $("#ev").innerHTML += events.map((e) => `<option>${esc(e)}</option>`).join("");
  const tcount = {};
  L.forEach((x) => x.tp.forEach((t) => (tcount[t] = (tcount[t] || 0) + 1)));
  $("#tp").innerHTML += Object.keys(tcount).sort((a, b) => tcount[b] - tcount[a]).map((t) => `<option value="${t}">${esc(T[t] || t)} (${tcount[t]})</option>`).join("");
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.get("topic")) $("#tp").value = h.get("topic");
  let list = [], shown = 0;
  const PAGE = 48;
  const card = (x) => `<a class="card" href="talks/${x.k}/index.html">
    <div class="thumb" style="background-image:url(https://i.ytimg.com/vi/${x.v}/mqdefault.jpg)"><span>${x.d}</span></div>
    <div class="cb"><div class="ev">${esc(x.ev)}${x.zh ? '<span class="badge">中文</span>' : ""}</div>
    <h3>${esc(x.ti)}</h3><div class="sp">${esc(x.sp)}</div><p>${esc(x.s)}</p></div></a>`;
  function render(reset) {
    if (reset) {
      const q = $("#q").value.trim().toLowerCase(), ev = $("#ev").value, tp = $("#tp").value, oz = $("#onlyZh").checked;
      list = L.filter((x) => (!ev || x.ev === ev) && (!tp || x.tp.includes(tp)) && (!oz || x.zh) &&
        (!q || (x.ti + " " + x.en + " " + x.sp + " " + x.s).toLowerCase().includes(q)));
      list.sort((a, b) => b.zh - a.zh);
      shown = 0; $("#grid").innerHTML = "";
    }
    $("#grid").insertAdjacentHTML("beforeend", list.slice(shown, shown + PAGE).map(card).join(""));
    shown = Math.min(list.length, shown + PAGE);
    $("#count").textContent = `找到 ${list.length} 场演讲`;
    $("#more").style.display = shown < list.length ? "" : "none";
  }
  ["#q", "#ev", "#tp", "#onlyZh"].forEach((s) => $(s).addEventListener("input", () => render(true)));
  $("#more").onclick = () => render(false);
  render(true);
})();
