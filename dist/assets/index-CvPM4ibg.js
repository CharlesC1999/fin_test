(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const p of a.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&r(p)}).observe(document,{childList:!0,subtree:!0});function n(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(o){if(o.ep)return;o.ep=!0;const a=n(o);fetch(o.href,a)}})();const e={allQuestions:[],questions:[],started:!1,finished:!1,currentIndex:0,selectedAnswers:[],submitted:!1,score:0,correctCount:0,wrongCount:0,loading:!0,error:"",selectedCategories:[],returningHome:!1,filterExpanded:!0,wrongQuestionIds:[],playMode:"all"},g=document.querySelector("#app"),S="quiz_wrong_questions";function L(t){return t.filter(s=>{const n=typeof s.question=="string"&&s.question.trim(),r=Array.isArray(s.options)&&s.options.length>1,o=Array.isArray(s.answer)&&s.answer.length>0;return n&&r&&o}).map(s=>({...s,id:String(s.id),question:s.question.trim(),options:s.options.map(n=>String(n).trim()),answer:s.answer.map(n=>Number(n)).sort((n,r)=>n-r),answer_type:s.answer_type||(s.answer.length>1?"複選":"單選")}))}function h(){return e.questions[e.currentIndex]}function O(){const t=new Set;return e.allQuestions.forEach(s=>{t.add(s.type||"未分類")}),[...t]}function A(){const t=e.selectedCategories.length===0?[...e.allQuestions]:e.allQuestions.filter(n=>e.selectedCategories.includes(n.type||"未分類"));if(e.playMode!=="wrong")return t;if(e.wrongQuestionIds.length===0)return[];const s=new Set(e.wrongQuestionIds);return t.filter(n=>s.has(n.id))}function N(t){return[...t].map(s=>({question:s,random:Math.random()})).sort((s,n)=>s.random-n.random).map(s=>s.question)}function z(){e.currentIndex=0,e.selectedAnswers=[],e.submitted=!1,e.finished=!1,e.started=!1,e.score=0,e.correctCount=0,e.wrongCount=0}function c(){return{windowY:window.scrollY,panelScrollTop:document.querySelector(".filter-list")instanceof HTMLElement?document.querySelector(".filter-list").scrollTop:0}}function u(t){if(!t)return;window.scrollTo({top:t.windowY});const s=document.querySelector(".filter-list");s instanceof HTMLElement&&(s.scrollTop=t.panelScrollTop)}function d(){e.questions=A(),z()}function _(t){if(t==="全部"){e.selectedCategories=[],d();return}e.selectedCategories=e.selectedCategories.includes(t)?e.selectedCategories.filter(s=>s!==t):[...e.selectedCategories,t],d()}function W(){e.selectedCategories=[],d()}function j(){try{const t=window.localStorage.getItem(S);if(!t)return[];const s=JSON.parse(t);return Array.isArray(s)?s.map(n=>String(n)):[]}catch{return[]}}function y(){window.localStorage.setItem(S,JSON.stringify(e.wrongQuestionIds))}function G(t){e.wrongQuestionIds.includes(t)||(e.wrongQuestionIds=[...e.wrongQuestionIds,t],y())}function P(t){e.wrongQuestionIds.includes(t)&&(e.wrongQuestionIds=e.wrongQuestionIds.filter(s=>s!==t),y())}function k(){e.wrongQuestionIds=[],y(),e.playMode==="wrong"&&d()}function v(t){e.playMode=t,d()}function R(){return e.selectedCategories.length===0?"全部":e.selectedCategories.length===1?e.selectedCategories[0]:`已選 ${e.selectedCategories.length} 類`}function Y(){return e.playMode==="wrong"?"歷史錯題":"全部題庫"}function q(t){return t.answer_type==="複選"||t.answer.length>1}function F(t){const s=h();e.submitted||(q(s)?e.selectedAnswers=e.selectedAnswers.includes(t)?e.selectedAnswers.filter(n=>n!==t):[...e.selectedAnswers,t].sort((n,r)=>n-r):e.selectedAnswers=[t],i())}function J(t,s){return t.length!==s.length?!1:t.every((n,r)=>n===s[r])}function K(){if(e.submitted||e.selectedAnswers.length===0)return;const t=h(),s=[...e.selectedAnswers].sort((r,o)=>r-o),n=J(s,t.answer);e.submitted=!0,n?(e.score+=10,e.correctCount+=1,P(t.id)):(e.wrongCount+=1,G(t.id)),i()}function B(){if(e.currentIndex>=e.questions.length-1){e.finished=!0,i();return}e.currentIndex+=1,e.selectedAnswers=[],e.submitted=!1,i()}function w(){const t=N(A());t.length!==0&&(e.questions=t,e.started=!0,e.finished=!1,e.currentIndex=0,e.selectedAnswers=[],e.submitted=!1,e.score=0,e.correctCount=0,e.wrongCount=0,i())}function D(){w()}function U(){e.returningHome||(e.returningHome=!0,i(),window.setTimeout(()=>{e.returningHome=!1,e.started=!1,e.finished=!1,e.currentIndex=0,e.selectedAnswers=[],e.submitted=!1,e.score=0,e.correctCount=0,e.wrongCount=0,i()},420))}function l(t){return String(t).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function V(){const t=e.questions.length,s=e.wrongQuestionIds.length,n=`
    <label class="filter-row ${e.selectedCategories.length===0?"is-active":""}">
      <input
        type="checkbox"
        data-action="filter"
        data-category="全部"
        ${e.selectedCategories.length===0?"checked":""}
      />
      <span class="filter-box"></span>
      <span class="filter-label">全部</span>
    </label>
    ${O().map(a=>`
          <label class="filter-row ${e.selectedCategories.includes(a)?"is-active":""}">
            <input
              type="checkbox"
              data-action="filter"
              data-category="${l(a)}"
              ${e.selectedCategories.includes(a)?"checked":""}
            />
            <span class="filter-box"></span>
            <span class="filter-label">${l(a)}</span>
          </label>
        `).join("")}
  `,r=e.filterExpanded?"is-expanded":"is-collapsed",o=e.filterExpanded?"收起分類":"展開分類";g.innerHTML=`
    <main class="shell">
      <section class="hero-card">
        <p class="eyebrow">Mobile Quiz Game</p>
        <div class="top-utility">
          <button
            class="btn btn-ghost btn-compact ${e.playMode==="wrong"?"is-mode-active":""}"
            data-action="toggle-wrong-mode"
            ${s===0&&e.playMode!=="wrong"?"disabled":""}
          >
            ${e.playMode==="wrong"?"目前：歷史錯題":`歷史錯題 ${s} 題`}
          </button>
          ${e.playMode==="wrong"?'<button class="btn btn-ghost btn-compact" data-action="set-mode" data-mode="all">回全部題庫</button>':""}
          <button class="btn btn-ghost btn-compact" data-action="clear-wrong" ${s===0?"disabled":""}>清空錯題</button>
        </div>
        <h1>題庫練習站</h1>
        <p class="hero-copy">
          以手機操作為主，支援單選、複選、即時判斷與分數累計。現在題庫共有
          <strong>${t}</strong> 題。
        </p>
        <section class="filter-panel ${r}">
          <div class="filter-head">
            <strong>題目分類</strong>
            <span>${l(Y())} · ${l(R())} · ${t} 題</span>
          </div>
          <div class="filter-toolbar">
            <button class="btn btn-ghost btn-compact" data-action="toggle-filter-panel">${o}</button>
            <button class="btn btn-ghost btn-compact" data-action="clear-filters" ${e.selectedCategories.length===0?"disabled":""}>清空選項</button>
          </div>
          <div class="filter-list" role="group" aria-label="題目分類篩選">${n}</div>
        </section>
        <div class="hero-actions">
          <button class="btn btn-primary" data-action="start" ${e.loading||t===0?"disabled":""}>開始作答</button>
          <button class="btn btn-secondary" data-action="shuffle" ${e.loading||t===0?"disabled":""}>重新抽題</button>
        </div>
        <p class="status-text">
          ${e.loading?"題庫載入中...":e.error?l(e.error):`題庫已就緒，可直接開始。歷史錯題 ${s} 題。`}
        </p>
      </section>
    </main>
  `}function X(){const t=e.questions.length,s=e.wrongQuestionIds.length,n=t===0?0:Math.round(e.correctCount/(e.correctCount+e.wrongCount||1)*100);g.innerHTML=`
    <main class="shell ${e.returningHome?"is-returning":""}">
      <section class="hero-card result-card">
        <p class="eyebrow">Completed</p>
        <h1>本次作答完成</h1>
        <div class="score-ring">
          <span>${e.score}</span>
          <small>分</small>
        </div>
        <div class="result-grid">
          <article>
            <strong>${e.correctCount}</strong>
            <span>答對</span>
          </article>
          <article>
            <strong>${e.wrongCount}</strong>
            <span>答錯</span>
          </article>
          <article>
            <strong>${n}%</strong>
            <span>正確率</span>
          </article>
          <article>
            <strong>${t}</strong>
            <span>總題數</span>
          </article>
        </div>
        <div class="hero-actions">
          <button class="btn btn-ghost" data-action="home">回到首頁</button>
          <button class="btn btn-primary" data-action="restart">重新挑戰</button>
          <button class="btn btn-secondary" data-action="shuffle">重洗題目</button>
        </div>
        <p class="status-text">歷史錯題累積：${s} 題</p>
      </section>
    </main>
  `}function Z(){const t=h(),s=e.currentIndex+1,n=e.questions.length,r=t.answer,o=q(t),a=t.options.map((b,f)=>{const $=b.split(`
`).map(m=>m.trim()).filter(Boolean),I=$.length>1?"option-text bilingual":"option-text",C=e.selectedAnswers.includes(f),Q=r.includes(f),x=e.submitted&&Q,M=e.submitted&&C&&!Q,H=x?"is-correct":M?"is-wrong":C?"is-selected":"",E=f+1;return`
        <button class="option-card ${H}" data-option-index="${f}">
          <span class="option-badge">${E}</span>
          <span class="${I}">
            ${$.map((m,T)=>`<span class="${T===0?"option-zh":"option-en"}">${l(m)}</span>`).join("")}
          </span>
        </button>
      `}).join(""),p=e.submitted?`正確答案：${r.map(b=>b+1).join("、")}`:o?"此題可複選":"此題為單選";g.innerHTML=`
    <main class="shell ${e.returningHome?"is-returning":""}">
      <section class="quiz-card">
        <header class="quiz-topbar">
          <div>
            <p class="eyebrow">Question ${s}</p>
            <h1>手機答題模式</h1>
          </div>
          <div class="score-pill">${e.score} 分</div>
        </header>

        <div class="progress-meta">
          <span>${s} / ${n}</span>
          <span>${o?"複選題":"單選題"}</span>
        </div>
        <div class="progress-track">
          <span style="width: ${s/n*100}%"></span>
        </div>

        <article class="question-panel">
          <div class="question-tags">
            <span>${l(t.type||"一般題")}</span>
            <span>${l(t.difficulty||"未分類")}</span>
          </div>
          <h2>${l(t.question).replaceAll(`
`,"<br />")}</h2>
          <p class="helper-text">${p}</p>
        </article>

        <section class="options-grid">
          ${a}
        </section>

        <footer class="action-bar">
          <button class="btn btn-ghost" data-action="home" ${e.returningHome?"disabled":""}>回到首頁</button>
          <button class="btn btn-secondary" data-action="restart">重來</button>
          ${e.submitted?`<button class="btn btn-primary" data-action="next">${s===n?"看結果":"下一題"}</button>`:`<button class="btn btn-primary" data-action="submit" ${e.selectedAnswers.length===0?"disabled":""}>送出答案</button>`}
        </footer>
      </section>
    </main>
  `}function i(){if(!e.started){V();return}if(e.finished){X();return}Z()}async function ee(){try{e.wrongQuestionIds=j();const t=await fetch("/data_table.json");if(!t.ok)throw new Error(`題庫載入失敗（${t.status}）`);const s=await t.json();e.allQuestions=L(s),d(),e.error=e.questions.length===0?"題庫內容為空，請確認 JSON 格式。":""}catch(t){e.error=t instanceof Error?t.message:"題庫載入失敗"}finally{e.loading=!1,i()}}g.addEventListener("click",t=>{const s=t.target.closest("[data-action]"),n=t.target.closest("[data-option-index]");if(s){const r=s.dataset.action;if(r==="start")w();else if(r==="shuffle")D();else if(r==="filter"){const o=c();_(s.dataset.category||"全部"),i(),u(o)}else if(r==="toggle-filter-panel"){const o=c();e.filterExpanded=!e.filterExpanded,i(),u(o)}else if(r==="clear-filters"){const o=c();W(),i(),u(o)}else if(r==="set-mode"){const o=c();v(s.dataset.mode||"all"),i(),u(o)}else if(r==="toggle-wrong-mode"){const o=c();v(e.playMode==="wrong"?"all":"wrong"),i(),u(o)}else if(r==="clear-wrong"){const o=c();k(),i(),u(o)}else r==="submit"?K():r==="next"?B():r==="restart"?w():r==="home"&&U();return}n&&F(Number(n.dataset.optionIndex))});i();ee();
