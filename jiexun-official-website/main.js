/* ============================================================
   傑訊科技開發有限公司 — main.js
   最終整合引擎：
     1  注入導覽列與頁尾（頁尾含已核定地址；統編仍待確認）
     2  目前頁高亮、行動漢堡選單
     3  ?svc=0X 跨頁預選（services 展開高亮／contact 回填，含 09；非法值安全）
     4  mailto 詢盤表單
     5  商務提案表下載（Blob .txt，含 01–09 勾選欄）
     6  案例渲染（CASES=[] 時優雅降級；tags 限 01–09）
     7  Canvas 節點連線＋滑鼠排斥／三層視差／游標光暈／卡片 tilt／滾動 reveal
     8  HUD 自我渲染監測：真實 FPS／NODES／SCROLL／MODE（不寫死不編造）
     9  prefers-reduced-motion 降級：停動態，保內容，SCROLL 仍真實更新
   ============================================================ */
(function(){
  "use strict";

  var COMPANY = "傑訊科技開發有限公司";                       /* A1 已核定 */
  var ADDRESS = "台北市萬華區西園路二段322號12樓之1";           /* A4 已核定 */
  var EMAIL   = "Kris071120@icloud.com";
  var PHONE_DISPLAY = "+886-989-958-223";
  var PHONE_TEL     = "+886989958223";
  var LINE_ID = "kris122382";

  var NAV = [
    {id:"index",    href:"index.html",    label:"首頁"},
    {id:"services", href:"services.html", label:"服務"},
    {id:"process",  href:"process.html",  label:"流程"},
    {id:"about",    href:"about.html",    label:"簡介"},
    {id:"contact",  href:"contact.html",  label:"聯絡"},
    {id:"legal",    href:"legal.html",    label:"法務"}
    /* cases 採方案甲：素材未核定，暫不入導覽。cases.html 仍可直接開啟且 noindex */
  ];

  var SERVICES = [
    {id:"01", t:"AI 人工智慧"},
    {id:"02", t:"Blockchain 區塊鏈"},
    {id:"03", t:"Web3 應用"},
    {id:"04", t:"Cloud 雲端運算"},
    {id:"05", t:"IoT 物聯網"},
    {id:"06", t:"Security 資安防護"},
    {id:"07", t:"Big Data 大數據"},
    {id:"08", t:"Smart 智慧製造"},
    {id:"09", t:"商品服務｜品牌設計 × 網站製作 × App 開發"}
  ];

  /* 案例資料：僅收 authorized:true 且欄位完整者；tags 限 01–09。
     未填入前為空陣列，cases.html 顯示「即將公開」骨架，絕不虛構客戶。 */
  var CASES = [];

  function $(sel, root){ return (root||document).querySelector(sel); }
  function $$(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }
  function svcName(id){
    var s = SERVICES.filter(function(x){ return x.id === id; })[0];
    return s ? s.t : "未指定";
  }
  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(m){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m];
    });
  }

  var page = document.body.getAttribute("data-page") || "index";
  var fileMap = {
    index:"index.html", services:"services.html", process:"process.html",
    cases:"cases.html", about:"about.html", contact:"contact.html", legal:"legal.html"
  };

  /* ---------- 1. 注入導覽列與頁尾 ---------- */
  function injectChrome(){
    var headerMount = $("#site-header");
    if(headerMount){
      headerMount.innerHTML =
        '<a class="skip" href="#main">跳至主要內容</a>' +
        '<header class="nav" role="banner">' +
          '<div class="wrap nav-in">' +
            '<a class="brand" href="index.html" aria-label="回到首頁">' +
              '<svg class="brand-logo" viewBox="0 0 40 40" aria-hidden="true">' +
                '<path d="M4 30 L14 10 L22 24 L30 8 L36 30" fill="none" stroke="url(#brandGrad)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
                '<defs><linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">' +
                  '<stop offset="0" stop-color="#37e6ff"/><stop offset=".5" stop-color="#d8b46a"/><stop offset="1" stop-color="#9d6bff"/>' +
                '</linearGradient></defs>' +
              '</svg>' +
              '<span>' + COMPANY + '<small>OBSIDIAN · HOLOGRAM</small></span>' +
            '</a>' +
            '<button class="burger" id="burger" aria-expanded="false" aria-controls="menu">MENU</button>' +
            '<ul class="menu" id="menu">' +
              NAV.map(function(item){
                return '<li><a href="' + item.href + '">' + item.label + '</a></li>';
              }).join("") +
            '</ul>' +
          '</div>' +
        '</header>';
    }

    var footerMount = $("#site-footer");
    if(footerMount){
      footerMount.innerHTML =
        '<footer role="contentinfo">' +
          '<div class="wrap foot-in">' +
            '<div>© <span id="yr"></span> ' + COMPANY + '<br/>' + ADDRESS +
              '｜統一編號 <span class="pending">核定中</span></div>' +
            '<div class="foot-links">' +
              '<a href="about.html">簡介</a>' +
              '<a href="services.html">服務</a>' +
              '<a href="contact.html">聯絡</a>' +
              '<a href="legal.html">法務</a>' +
            '</div>' +
          '</div>' +
        '</footer>';
    }

    var yr = $("#yr");
    if(yr) yr.textContent = new Date().getFullYear();
  }

  /* ---------- 2. 導覽列功能 ---------- */
  function bindNav(){
    $$(".menu a").forEach(function(a){
      var href = a.getAttribute("href") || "";
      var isCur = href === fileMap[page] ||
                  (page === "index" && (href === "./" || href === "index.html" || href === "/"));
      if(isCur) a.setAttribute("aria-current", "page");
    });

    var burger = $("#burger"), menu = $("#menu");
    if(burger && menu){
      burger.addEventListener("click", function(){
        var open = menu.classList.toggle("open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
      });
      $$(".menu a", menu).forEach(function(a){
        a.addEventListener("click", function(){
          menu.classList.remove("open");
          burger.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  /* ---------- 3. ?svc=0X 預選（含 09，邊界防護） ---------- */
  function getSvc(){
    var m = /[?&]svc=(\d{1,2})/i.exec(location.search);
    return m ? m[1].padStart(2, "0") : null;
  }

  function bindSvcPreselect(){
    var svc = getSvc();
    if(!svc) return;

    if(page === "services"){
      var det = document.getElementById("svc-" + svc);   /* 非法 id → null，不高亮不報錯 */
      if(det){
        det.open = true;
        det.classList.add("hl");
        det.scrollIntoView({block:"center",
          behavior: document.body.classList.contains("rm") ? "auto" : "smooth"});
      }
    }

    if(page === "contact"){
      var sel = $("#f-svc");
      if(sel){
        var has = $$("option", sel).some(function(o){ return o.value === svc; });
        if(has) sel.value = svc;                          /* 不存在則不回填 */
      }
    }
  }

  /* ---------- 4. mailto 詢盤表單 ---------- */
  function bindForm(){
    var form = $("#inq"), status = $("#inq-status");
    if(!form || !status) return;

    form.addEventListener("submit", function(e){
      e.preventDefault();
      if(!form.checkValidity()){ form.reportValidity(); return; }

      var d = new FormData(form);
      var sv = d.get("service") || "";
      var nm = svcName(sv);
      var subj = "【專案詢盤】" + nm + " - " + (d.get("company") || d.get("name") || "");
      var body =
        "姓名: " + (d.get("name") || "") + "\n" +
        "公司: " + (d.get("company") || "") + "\n" +
        "職稱: " + (d.get("title") || "") + "\n" +
        "Email: " + (d.get("email") || "") + "\n" +
        "電話: " + (d.get("tel") || "") + "\n" +
        "LINE: " + (d.get("line") || "") + "\n" +
        "期望服務: " + sv + " " + nm + "\n\n" +
        "專案摘要:\n" + (d.get("message") || "") + "\n\n" +
        "（本信由官網 mailto 表單組裝；附件請另行補寄。）";

      status.textContent = "正在開啟 Email 草稿…若未自動開啟，請手動寄至 " + EMAIL + "。";
      location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subj) +
                      "&body=" + encodeURIComponent(body);
    });
  }

  /* ---------- 5. 商務提案表下載（含 01–09） ---------- */
  function bindProposalDownload(){
    var btn = $("#btn-proposal");
    if(!btn) return;

    btn.addEventListener("click", function(){
      var text =
COMPANY + " 商務提案表模板\n" +
"營業地址：" + ADDRESS + "\n" +
"====================================\n\n" +
"一、客戶基本資料\n" +
"公司名稱：\n聯絡人：\n職稱：\nEmail：\n電話：\nLINE：\n\n" +
"二、需求概述\n" +
"業務痛點：\n期望目標：\n既有系統／技術棧：\n資料來源與大致量體：\n\n" +
"三、期望服務（可複選）\n" +
"[ ] 01 AI 人工智慧\n" +
"[ ] 02 Blockchain 區塊鏈\n" +
"[ ] 03 Web3 應用\n" +
"[ ] 04 Cloud 雲端運算\n" +
"[ ] 05 IoT 物聯網\n" +
"[ ] 06 Security 資安防護\n" +
"[ ] 07 Big Data 大數據\n" +
"[ ] 08 Smart 智慧製造\n" +
"[ ] 09 商品服務｜品牌設計 × 網站製作 × App 開發\n\n" +
"四、預算與時程\n" +
"預算區間：\n期望時程：\n是否有硬性截止日：\n\n" +
"五、預期交付形式\n" +
"[ ] 顧問與架構設計\n[ ] 系統開發與整合\n[ ] 部署與維運\n[ ] 教育訓練與技術轉移\n[ ] 其他：\n\n" +
"六、備註\n\n\n" +
"送件方式：填寫後透過官網聯絡頁 mailto 表單或 Email 送達 " + EMAIL + "\n" +
"說明：本模板為商務提案前置資料，最終範圍與報價以需求盤點及合約（SOW）為準。";

      var blob = new Blob([text], {type:"text/plain;charset=utf-8"});
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = "business-proposal-template.txt";
      document.body.appendChild(a); a.click();
      setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
    });
  }

  /* ---------- 6. 案例渲染（空陣列 → 優雅骨架） ---------- */
  function renderCases(){
    var mount = $("#cases-grid");
    if(!mount) return;

    var list = CASES.filter(function(c){ return c && c.authorized === true; });

    if(!list.length){
      mount.innerHTML =
        '<div class="empty">案例素材待確認｜即將公開。<br/>' +
        '<span class="pending">TODO A7：可公開之客戶授權素材</span></div>';
      return;
    }

    mount.innerHTML = list.map(function(c){
      return '<article class="card reveal">' +
        '<span class="no">' + esc((c.tags || []).join(" / ")) + '</span>' +
        '<h3>' + esc(c.label) + '</h3>' +
        '<p><b>產業：</b>' + esc(c.industry) + '</p>' +
        '<p><b>挑戰：</b>' + esc(c.challenge) + '</p>' +
        '<p><b>解法：</b>' + esc(c.solution) + '</p>' +
        '<p><b>交付物：</b>' + esc(c.deliverables) + '</p>' +
        (c.outcome ? '<p><b>成果：</b>' + esc(c.outcome) + '</p>' : '') +
        '<p class="note">' + esc(c.period) + '｜' + esc(c.stack) + '｜經客戶書面授權公開</p>' +
      '</article>';
    }).join("");
  }

  /* ---------- 7. reduce-motion 偵測 ---------- */
  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var hoverMq = window.matchMedia("(hover:hover) and (pointer:fine)");
  var RM = mq.matches;
  function applyRM(){ RM = mq.matches; document.body.classList.toggle("rm", RM); }
  applyRM();

  /* ---------- 8. 游標光暈 ---------- */
  var glow = null;
  var canvas = $("#fx");
  var ctx = null, pts = [], W = 0, H = 0, DPR = 1;
  var mouse = {x:-9999, y:-9999, active:false};
  var raf = null, running = false, frames = 0, fpsT = 0, fps = 0;

  var hudFps = $("#hud-fps"), hudNodes = $("#hud-nodes"), hudScroll = $("#hud-scroll"),
      hudMode = $("#hud-mode"), hudBar = $("#hud-bar");
  var layers = $$(".layer");

  function initCursor(){
    if(RM || !hoverMq.matches) return;                 /* 觸控裝置不啟用 */
    glow = $("#cursor-glow");
    if(!glow){
      glow = document.createElement("div");
      glow.id = "cursor-glow";
      glow.setAttribute("aria-hidden", "true");
      document.body.appendChild(glow);
    }
    document.body.classList.add("has-pointer");
    window.addEventListener("mousemove", function(e){
      if(glow) glow.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
      if(canvas){
        var r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.active = true;
      }
    });
  }

  /* ---------- 9. Canvas FX／HUD／視差 ---------- */
  function sizeCanvas(){
    if(!canvas) return;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    var r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.floor(W * DPR); canvas.height = Math.floor(H * DPR);
    ctx = canvas.getContext("2d");
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildPoints();
  }

  function buildPoints(){
    pts = [];
    if(!W || !H) return;
    var density = Math.round((W * H) / 16000);
    var n = Math.max(28, Math.min(density, 140));      /* 上下限控效能 */
    for(var i=0;i<n;i++){
      pts.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
        r: Math.random() * 1.6 + .6
      });
    }
    if(hudNodes && !RM) hudNodes.textContent = pts.length;
  }

  function draw(){
    if(!ctx) return;
    ctx.clearRect(0, 0, W, H);
    var LINK = 120, i, j, a, b, dx, dy, dist;

    for(i=0;i<pts.length;i++){
      a = pts[i];
      if(mouse.active){                                 /* 滑鼠排斥力學 */
        dx = a.x - mouse.x; dy = a.y - mouse.y; dist = Math.hypot(dx, dy);
        if(dist < 140 && dist > 0){
          var f = (140 - dist) / 140 * .6;
          a.x += dx / dist * f; a.y += dy / dist * f;
        }
      }
      a.x += a.vx; a.y += a.vy;
      if(a.x < 0 || a.x > W) a.vx *= -1;
      if(a.y < 0 || a.y > H) a.vy *= -1;
      a.x = Math.max(0, Math.min(W, a.x));
      a.y = Math.max(0, Math.min(H, a.y));
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283);
      ctx.fillStyle = "rgba(55,230,255,.85)"; ctx.fill();
    }

    for(i=0;i<pts.length;i++){
      for(j=i+1;j<pts.length;j++){
        a = pts[i]; b = pts[j];
        dx = a.x - b.x; dy = a.y - b.y; dist = Math.hypot(dx, dy);
        if(dist < LINK){
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = "rgba(55,230,255," + (0.18 * (1 - dist / LINK)).toFixed(3) + ")";
          ctx.lineWidth = .6; ctx.stroke();
        }
      }
    }
  }

  function loop(t){
    if(!running) return;
    draw();
    frames++;
    if(t - fpsT >= 1000){                               /* 每秒更新 HUD（真實計算） */
      fps = Math.round(frames * 1000 / (t - fpsT));
      frames = 0; fpsT = t; updateHud();
    }
    raf = requestAnimationFrame(loop);
  }

  function updateHud(){
    if(hudFps)   hudFps.textContent   = RM ? "PAUSED" : fps;
    if(hudNodes) hudNodes.textContent = RM ? "0" : pts.length;
    if(hudMode)  hudMode.textContent  = RM ? "REDUCED" : "FULL";
  }

  function setHudReduced(){
    if(hudFps) hudFps.textContent = "PAUSED";
    if(hudNodes) hudNodes.textContent = "0";
    if(hudMode) hudMode.textContent = "REDUCED";
  }

  function scrollDepth(){
    var de = document.documentElement;
    var max = de.scrollHeight - de.clientHeight;
    return max > 0 ? Math.min(100, Math.round(de.scrollTop / max * 100)) : 0;
  }

  function onScroll(){
    var d = scrollDepth();
    if(hudScroll) hudScroll.textContent = d + "%";      /* reduce-motion 下仍真實更新 */
    if(hudBar) hudBar.style.width = d + "%";
    if(!RM && layers.length){                           /* 三層視差 */
      for(var k=0;k<layers.length;k++){
        var sp = parseFloat(layers[k].getAttribute("data-speed") || 0);
        layers[k].style.transform = "translate3d(0," + (window.scrollY * sp * -0.4) + "px,0)";
      }
    }
  }

  function initScroll(){
    if(hudScroll || hudBar || layers.length){
      window.addEventListener("scroll", onScroll, {passive:true});
      onScroll();
    }
  }

  function initFX(){
    if(!canvas) return;
    if(RM){ setHudReduced(); return; }
    if(running) return;
    sizeCanvas();
    running = true; fpsT = performance.now();
    raf = requestAnimationFrame(loop);
    updateHud();
    window.addEventListener("resize", sizeCanvas);
    document.addEventListener("visibilitychange", function(){
      if(document.hidden){ running = false; if(raf) cancelAnimationFrame(raf); }
      else if(!RM){ running = true; fpsT = performance.now(); raf = requestAnimationFrame(loop); }
    });
  }

  function stopFX(){
    running = false;
    if(raf) cancelAnimationFrame(raf);
    if(ctx) ctx.clearRect(0, 0, W, H);
    setHudReduced();
  }

  if(mq.addEventListener){
    mq.addEventListener("change", function(){
      applyRM();
      if(RM) stopFX(); else initFX();
    });
  }

  /* ---------- 10. 卡片 tilt ---------- */
  function bindTilt(){
    $$(".card,.step").forEach(function(c){
      c.addEventListener("mousemove", function(e){
        if(RM || !hoverMq.matches) return;
        var r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - .5;
        var py = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(800px) rotateY(" + (px * 7).toFixed(2) +
                            "deg) rotateX(" + (-py * 7).toFixed(2) + "deg) translateY(-3px)";
      });
      c.addEventListener("mouseleave", function(){ c.style.transform = ""; });
    });
  }

  /* ---------- 11. 滾動 reveal ---------- */
  function bindReveal(){
    var els = $$(".reveal");
    if(!els.length) return;
    if(RM || !("IntersectionObserver" in window)){
      els.forEach(function(x){ x.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, {threshold:.12});
    els.forEach(function(x){ io.observe(x); });
  }

  /* ---------- 初始化（renderCases 必須在 bindReveal 之前） ---------- */
  injectChrome();
  bindNav();
  bindSvcPreselect();
  bindForm();
  bindProposalDownload();
  renderCases();
  bindReveal();
  bindTilt();
  initCursor();
  initFX();
  initScroll();
})();