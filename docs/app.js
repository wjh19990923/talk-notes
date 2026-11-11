(() => {
  const D = window.TALK;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const inline = (s) =>
    esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  const fmt = (t) => {
    t = Math.floor(t);
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0");
  };

  // ---------- header ----------
  document.title = D.title;
  $("#title").textContent = D.title;
  $("#articleTitle").textContent = D.title.replace(/ - .*$/, "");
  $("#summary").innerHTML = inline(D.summary);
  const yt = "https://www.youtube.com/watch?v=" + D.videoId;
  for (const [id, href] of [["#sourceLink", D.source], ["#footSource", D.source], ["#footVideo", yt]]) $(id).href = href;
  $("#copyMd").onclick = async (e) => {
    try {
      const txt = await (await fetch("talk.md")).text();
      await navigator.clipboard.writeText(txt);
      e.target.textContent = "Copied ✓";
    } catch { e.target.textContent = "Copy failed"; }
    setTimeout(() => (e.target.textContent = "Copy markdown"), 1600);
  };

  // ---------- player ----------
  let player = null, pending = null;
  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player("yt", {
      videoId: D.videoId,
      playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
      events: { onReady: () => { if (pending != null) seek(pending); } },
    });
  };
  const s = document.createElement("script");
  s.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(s);

  function seek(t) {
    if (!player || !player.seekTo) { pending = t; return; }
    player.seekTo(t, true);
    player.playVideo();
    $(".player").scrollIntoView({ behavior: "smooth", block: "center" });
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-t]");
    if (b && !e.target.closest("a")) seek(+b.dataset.t);
  });

  // ---------- chapters ----------
  const chapters = D.sections.map((s) => ({ t: s.t, ts: s.ts, title: s.title }));
  $("#chapCount").textContent = chapters.length + " total";
  $("#chapterList").innerHTML = chapters
    .map((c, i) => `<li data-t="${c.t}" data-i="${i}"><span class="ts">${c.ts}</span><span>${esc(c.title)}</span></li>`)
    .join("");
  $("#nowTitle").textContent = chapters[0]?.title || "";

  // ---------- slides ----------
  $("#slideCount").textContent = D.slides.length;
  $("#slideStrip").innerHTML = D.slides
    .map(
      (sl, i) => `<article class="slide">
        <img src="${sl.src}" alt="${esc(sl.alt)}" loading="lazy" data-lb="${i}" />
        <div class="body">
          <h3>${esc(sl.title)}</h3>
          <p>${esc(sl.alt)}</p>
          ${sl.text ? `<details><summary>Text in image</summary><pre>${esc(sl.text)}</pre></details>` : ""}
          <button class="ts" data-t="${sl.t}">▶ ${sl.ts}</button>
        </div>
      </article>`
    )
    .join("");
  const strip = $("#slideStrip");
  const step = () => strip.querySelector(".slide").getBoundingClientRect().width + 14;
  $("#slidePrev").onclick = () => strip.scrollBy({ left: -step(), behavior: "smooth" });
  $("#slideNext").onclick = () => strip.scrollBy({ left: step(), behavior: "smooth" });

  // ---------- article ----------
  $("#toc").innerHTML = D.sections.map((s, i) => `<li data-sec="${i}"><a href="#sec-${i + 1}">${esc(s.title)}</a></li>`).join("");
  $("#sections").innerHTML = D.sections
    .map(
      (s, i) => `<section class="section" id="sec-${i + 1}">
        <div class="section-head"><span class="num">${String(i + 1).padStart(2, "0")}</span>
          <button class="seek" data-t="${s.t}">▶ ${s.ts}</button></div>
        <h3>${esc(s.title)}</h3>
        ${s.blocks
          .map((b) =>
            b.type === "img"
              ? `<figure><img src="${b.src}" alt="${esc(b.alt)}" loading="lazy" data-src="${b.src}" /><figcaption>${esc(b.caption || b.alt)}</figcaption></figure>`
              : `<p>${inline(b.text)}</p>`
          )
          .join("")}
      </section>`
    )
    .join("");
  const tocItems = [...document.querySelectorAll("#toc li")];
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        const i = +en.target.id.split("-")[1] - 1;
        tocItems.forEach((li, j) => li.classList.toggle("active", j === i));
      }
    },
    { rootMargin: "-20% 0px -70% 0px" }
  );
  document.querySelectorAll(".section").forEach((el) => io.observe(el));

  // ---------- takeaways ----------
  $("#takeawayList").innerHTML = D.takeaways.map((t) => `<li>${inline(t)}</li>`).join("");

  // ---------- transcript ----------
  const tl = $("#transcriptList");
  tl.innerHTML = D.transcript
    .map((l, i) => `<div class="tline" data-t="${l.t}" data-i="${i}"><span class="ts">${l.ts}</span><span class="tx">${esc(l.text)}</span></div>`)
    .join("");
  const tlines = [...tl.children];
  $("#tSearch").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    const re = q ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi") : null;
    D.transcript.forEach((l, i) => {
      const hit = !q || l.text.toLowerCase().includes(q);
      tlines[i].classList.toggle("hidden", !hit);
      tlines[i].querySelector(".tx").innerHTML = re && hit ? esc(l.text).replace(re, (m) => `<mark>${m}</mark>`) : esc(l.text);
    });
  });

  // ---------- sync loop ----------
  const lastIdx = (arr, t) => {
    let lo = 0, hi = arr.length - 1, ans = 0;
    while (lo <= hi) { const mid = (lo + hi) >> 1; if (arr[mid].t <= t) { ans = mid; lo = mid + 1; } else hi = mid - 1; }
    return ans;
  };
  let lastChap = -1, lastLine = -1;
  const chapEls = [...document.querySelectorAll("#chapterList li")];
  setInterval(() => {
    if (!player || !player.getCurrentTime) return;
    const t = player.getCurrentTime() || 0;
    $("#clock").textContent = fmt(t);
    const ci = lastIdx(chapters, t);
    if (ci !== lastChap) {
      chapEls[lastChap]?.classList.remove("active");
      chapEls[ci]?.classList.add("active");
      chapEls[ci]?.scrollIntoView({ block: "nearest", behavior: "smooth", inline: "nearest" });
      $("#nowTitle").textContent = chapters[ci].title;
      lastChap = ci;
    }
    const li = lastIdx(D.transcript, t);
    if (li !== lastLine) {
      tlines[lastLine]?.classList.remove("active");
      tlines[li]?.classList.add("active");
      if ($("#follow").checked && player.getPlayerState?.() === 1) {
        const el = tlines[li];
        tl.scrollTo({ top: el.offsetTop - tl.clientHeight / 3, behavior: "smooth" });
      }
      lastLine = li;
    }
  }, 500);

  // ---------- lightbox ----------
  const gallery = D.slides.map((s) => ({ src: s.src, cap: s.title }));
  let cur = 0;
  const lb = $("#lightbox");
  const show = (i) => {
    cur = (i + gallery.length) % gallery.length;
    $("#lbImg").src = gallery[cur].src;
    $("#lbCap").textContent = `${cur + 1} / ${gallery.length} · ${gallery[cur].cap}`;
    lb.hidden = false;
  };
  document.addEventListener("click", (e) => {
    const img = e.target.closest("img[data-lb], img[data-src]");
    if (!img) return;
    const i = img.dataset.lb != null ? +img.dataset.lb : gallery.findIndex((g) => g.src === img.dataset.src);
    show(i < 0 ? 0 : i);
  });
  $("#lbClose").onclick = () => (lb.hidden = true);
  $("#lbPrev").onclick = () => show(cur - 1);
  $("#lbNext").onclick = () => show(cur + 1);
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.hidden = true; });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") lb.hidden = true;
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
})();
