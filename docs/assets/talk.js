(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const fmt = (t) => {
    t = Math.floor(t);
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0");
  };

  // ---------- player ----------
  const holder = $("#yt");
  const vid = holder?.dataset.video;
  let player = null, pending = null;
  if (vid) {
    window.onYouTubeIframeAPIReady = () => {
      player = new YT.Player("yt", {
        videoId: vid,
        playerVars: { rel: 0, playsinline: 1 },
        events: { onReady: () => { if (pending != null) seek(pending); } },
      });
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  }
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

  // ---------- slides strip ----------
  const strip = $("#slideStrip");
  if (strip) {
    const step = () => (strip.querySelector(".slide")?.getBoundingClientRect().width || 300) + 14;
    $("#slidePrev").onclick = () => strip.scrollBy({ left: -step(), behavior: "smooth" });
    $("#slideNext").onclick = () => strip.scrollBy({ left: step(), behavior: "smooth" });
  }

  // ---------- toc highlight ----------
  const tocItems = $$("#toc li");
  if (tocItems.length) {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        const i = +en.target.id.split("-")[1] - 1;
        tocItems.forEach((li, j) => li.classList.toggle("active", j === i));
      }
    }, { rootMargin: "-20% 0px -70% 0px" });
    $$(".section").forEach((el) => io.observe(el));
  }

  // ---------- transcript search ----------
  const tl = $("#transcriptList");
  const tlines = tl ? [...tl.children] : [];
  const orig = tlines.map((el) => el.querySelector(".tx").textContent);
  const escH = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  $("#tSearch")?.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    const re = q ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi") : null;
    tlines.forEach((el, i) => {
      const hit = !q || orig[i].toLowerCase().includes(q);
      el.classList.toggle("hidden", !hit);
      el.querySelector(".tx").innerHTML = re && hit ? escH(orig[i]).replace(re, (m) => `<mark>${m}</mark>`) : escH(orig[i]);
    });
  });

  // ---------- sync with video ----------
  const chapEls = $$("#chapterList li");
  const chapT = chapEls.map((el) => +el.dataset.t);
  const lineT = tlines.map((el) => +el.dataset.t);
  const lastIdx = (arr, t) => {
    let lo = 0, hi = arr.length - 1, ans = -1;
    while (lo <= hi) { const mid = (lo + hi) >> 1; if (arr[mid] <= t) { ans = mid; lo = mid + 1; } else hi = mid - 1; }
    return ans;
  };
  let lastChap = -1, lastLine = -1;
  setInterval(() => {
    if (!player || !player.getCurrentTime) return;
    const t = player.getCurrentTime() || 0;
    $("#clock").textContent = fmt(t);
    const ci = lastIdx(chapT, t);
    if (ci !== lastChap && ci >= 0) {
      chapEls[lastChap]?.classList.remove("active");
      chapEls[ci].classList.add("active");
      chapEls[ci].scrollIntoView({ block: "nearest", behavior: "smooth" });
      $("#nowTitle").textContent = chapEls[ci].lastElementChild.textContent;
      lastChap = ci;
    }
    const li = lastIdx(lineT, t);
    if (li !== lastLine && li >= 0) {
      tlines[lastLine]?.classList.remove("active");
      tlines[li].classList.add("active");
      if ($("#follow")?.checked && player.getPlayerState?.() === 1)
        tl.scrollTo({ top: tlines[li].offsetTop - tl.clientHeight / 3, behavior: "smooth" });
      lastLine = li;
    }
  }, 500);

  // ---------- lightbox ----------
  const gallery = $$("img[data-lb]").map((img) => ({ src: img.src, cap: img.dataset.cap }));
  const lb = $("#lightbox");
  let cur = 0;
  const show = (src, cap) => { $("#lbImg").src = src; $("#lbCap").textContent = cap; lb.hidden = false; };
  const showIdx = (i) => {
    if (!gallery.length) return;
    cur = (i + gallery.length) % gallery.length;
    show(gallery[cur].src, `${cur + 1} / ${gallery.length} · ${gallery[cur].cap}`);
  };
  document.addEventListener("click", (e) => {
    const img = e.target.closest("img[data-lb], img.zoom");
    if (!img) return;
    if (img.dataset.lb != null) showIdx(+img.dataset.lb);
    else {
      const i = gallery.findIndex((g) => g.src === img.src);
      i >= 0 ? showIdx(i) : show(img.src, img.alt);
    }
  });
  $("#lbClose").onclick = () => (lb.hidden = true);
  $("#lbPrev").onclick = () => showIdx(cur - 1);
  $("#lbNext").onclick = () => showIdx(cur + 1);
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.hidden = true; });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") lb.hidden = true;
    if (e.key === "ArrowLeft") showIdx(cur - 1);
    if (e.key === "ArrowRight") showIdx(cur + 1);
  });
})();
