(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&r(c)}).observe(document,{childList:!0,subtree:!0});function s(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(o){if(o.ep)return;o.ep=!0;const i=s(o);fetch(o.href,i)}})();const e={allQuestions:[],questions:[],started:!1,finished:!1,currentIndex:0,selectedAnswers:[],submitted:!1,score:0,correctCount:0,wrongCount:0,loading:!0,error:"",selectedCategories:[],returningHome:!1,filterExpanded:!0,wrongQuestionIds:[],playMode:"all",questionLimit:"all"},m=document.querySelector("#app"),A="quiz_wrong_questions";function _(t){return t.filter(n=>{const s=typeof n.question=="string"&&n.question.trim(),r=Array.isArray(n.options)&&n.options.length>1,o=Array.isArray(n.answer)&&n.answer.length>0;return s&&r&&o}).map(n=>({...n,id:String(n.id),question:n.question.trim(),options:n.options.map(s=>String(s).trim()),answer:n.answer.map(s=>Number(s)).sort((s,r)=>s-r),answer_type:n.answer_type||(n.answer.length>1?"複選":"單選")}))}function y(){return e.questions[e.currentIndex]}function z(){const t=new Set;return e.allQuestions.forEach(n=>{t.add(n.type||"未分類")}),[...t]}function x(){const t=e.selectedCategories.length===0?[...e.allQuestions]:e.allQuestions.filter(s=>e.selectedCategories.includes(s.type||"未分類"));if(e.playMode!=="wrong")return t;if(e.wrongQuestionIds.length===0)return[];const n=new Set(e.wrongQuestionIds);return t.filter(s=>n.has(s.id))}function W(t){return[...t].map(n=>({question:n,random:Math.random()})).sort((n,s)=>n.random-s.random).map(n=>n.question)}function $(t){if(t<=0)return[];if(t<=5)return[t];const n=[];for(let s=5;s<t;s+=5)n.push(s);return n[n.length-1]!==t&&n.push(t),n}function j(t){return e.questionLimit==="all"?t:Math.min(e.questionLimit,t)}function I(t){const n=$(t);return n.length===0?0:e.questionLimit==="all"?n[n.length-1]:n.includes(e.questionLimit)?e.questionLimit:n.find(s=>s>=e.questionLimit)??n[n.length-1]}function G(){e.currentIndex=0,e.selectedAnswers=[],e.submitted=!1,e.finished=!1,e.started=!1,e.score=0,e.correctCount=0,e.wrongCount=0}function f(){return{windowY:window.scrollY,panelScrollTop:document.querySelector(".filter-list")instanceof HTMLElement?document.querySelector(".filter-list").scrollTop:0}}function p(t){if(!t)return;window.scrollTo({top:t.windowY});const n=document.querySelector(".filter-list");n instanceof HTMLElement&&(n.scrollTop=t.panelScrollTop)}function g(){e.questions=x(),G()}function P(t){if(t==="全部"){e.selectedCategories=[],g();return}e.selectedCategories=e.selectedCategories.includes(t)?e.selectedCategories.filter(n=>n!==t):[...e.selectedCategories,t],g()}function k(){e.selectedCategories=[],g()}function R(){try{const t=window.localStorage.getItem(A);if(!t)return[];const n=JSON.parse(t);return Array.isArray(n)?n.map(s=>String(s)):[]}catch{return[]}}function C(){window.localStorage.setItem(A,JSON.stringify(e.wrongQuestionIds))}function Y(t){e.wrongQuestionIds.includes(t)||(e.wrongQuestionIds=[...e.wrongQuestionIds,t],C())}function F(t){e.wrongQuestionIds.includes(t)&&(e.wrongQuestionIds=e.wrongQuestionIds.filter(n=>n!==t),C())}function J(){e.wrongQuestionIds=[],C(),e.playMode==="wrong"&&g()}function Q(t){e.playMode=t,g()}function S(t){const n=e.questions.length,s=$(n);if(s.length===0)return;const r=I(n),o=Math.max(s.indexOf(r),0),i=t==="increase"?Math.min(o+1,s.length-1):Math.max(o-1,0);e.questionLimit=s[i]}function K(){return e.selectedCategories.length===0?"全部":e.selectedCategories.length===1?e.selectedCategories[0]:`已選 ${e.selectedCategories.length} 類`}function B(){return e.playMode==="wrong"?"歷史錯題":"全部題庫"}function M(t){return t.answer_type==="複選"||t.answer.length>1}function V(t){const n=y();e.submitted||(M(n)?e.selectedAnswers=e.selectedAnswers.includes(t)?e.selectedAnswers.filter(s=>s!==t):[...e.selectedAnswers,t].sort((s,r)=>s-r):e.selectedAnswers=[t],a())}function D(t,n){return t.length!==n.length?!1:t.every((s,r)=>s===n[r])}function U(){if(e.submitted||e.selectedAnswers.length===0)return;const t=y(),n=[...e.selectedAnswers].sort((r,o)=>r-o),s=D(n,t.answer);e.submitted=!0,s?(e.score+=10,e.correctCount+=1,F(t.id)):(e.wrongCount+=1,Y(t.id)),a()}function X(){if(e.currentIndex>=e.questions.length-1){e.finished=!0,a();return}e.currentIndex+=1,e.selectedAnswers=[],e.submitted=!1,a()}function w(){const t=x(),n=W(t).slice(0,j(t.length));n.length!==0&&(e.questions=n,e.started=!0,e.finished=!1,e.currentIndex=0,e.selectedAnswers=[],e.submitted=!1,e.score=0,e.correctCount=0,e.wrongCount=0,a())}function Z(){w()}function ee(){e.returningHome||(e.returningHome=!0,a(),window.setTimeout(()=>{e.returningHome=!1,e.started=!1,e.finished=!1,e.currentIndex=0,e.selectedAnswers=[],e.submitted=!1,e.score=0,e.correctCount=0,e.wrongCount=0,a()},420))}function l(t){return String(t).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function te(){const t=e.questions.length,n=e.wrongQuestionIds.length,s=I(t),r=$(t),o=r.length===0||s===r[0],i=r.length===0||s===r[r.length-1],c=`
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
    ${z().map(u=>`
          <label class="filter-row ${e.selectedCategories.includes(u)?"is-active":""}">
            <input
              type="checkbox"
              data-action="filter"
              data-category="${l(u)}"
              ${e.selectedCategories.includes(u)?"checked":""}
            />
            <span class="filter-box"></span>
            <span class="filter-label">${l(u)}</span>
          </label>
        `).join("")}
  `,b=e.filterExpanded?"is-expanded":"is-collapsed",d=e.filterExpanded?"收起分類":"展開分類";m.innerHTML=`
    <main class="shell">
      <section class="hero-card">
        <p class="eyebrow">Mobile Quiz Game</p>
        <div class="top-utility">
          <button
            class="btn btn-ghost btn-compact ${e.playMode==="wrong"?"is-mode-active":""}"
            data-action="toggle-wrong-mode"
            ${n===0&&e.playMode!=="wrong"?"disabled":""}
          >
            ${e.playMode==="wrong"?"目前：歷史錯題":`歷史錯題 ${n} 題`}
          </button>
          ${e.playMode==="wrong"?'<button class="btn btn-ghost btn-compact" data-action="set-mode" data-mode="all">回全部題庫</button>':""}
          <button class="btn btn-ghost btn-compact" data-action="clear-wrong" ${n===0?"disabled":""}>清空錯題</button>
        </div>
        <h1>題庫練習站</h1>
        <p class="hero-copy">
          以手機操作為主，支援單選、複選、即時判斷與分數累計。現在題庫共有
          <strong>${t}</strong> 題。
        </p>
        <section class="filter-panel ${b}">
          <div class="filter-head">
            <strong>題目分類</strong>
            <span>${l(B())} · ${l(K())} · ${t} 題</span>
          </div>
          <div class="filter-toolbar">
            <button class="btn btn-ghost btn-compact" data-action="toggle-filter-panel">${d}</button>
            <button class="btn btn-ghost btn-compact" data-action="clear-filters" ${e.selectedCategories.length===0?"disabled":""}>清空選項</button>
          </div>
          <div class="filter-list" role="group" aria-label="題目分類篩選">${c}</div>
        </section>
        <div class="hero-actions">
          <div class="question-limit-control">
            <span>本次題數</span>
            <div class="question-limit-stepper">
              <button
                class="stepper-btn"
                data-action="decrease-question-limit"
                ${e.loading||t===0||o?"disabled":""}
                aria-label="減少題數"
              >-</button>
              <strong>${s} 題</strong>
              <button
                class="stepper-btn"
                data-action="increase-question-limit"
                ${e.loading||t===0||i?"disabled":""}
                aria-label="增加題數"
              >+</button>
            </div>
          </div>
          <button class="btn btn-primary" data-action="start" ${e.loading||t===0?"disabled":""}>開始作答</button>
          <button class="btn btn-secondary" data-action="shuffle" ${e.loading||t===0?"disabled":""}>重新抽題</button>
        </div>
        <p class="status-text">
          ${e.loading?"題庫載入中...":e.error?l(e.error):`題庫已就緒，可直接開始。歷史錯題 ${n} 題。`}
        </p>
      </section>
    </main>
  `}function ne(){const t=e.questions.length,n=e.wrongQuestionIds.length,s=t===0?0:Math.round(e.correctCount/(e.correctCount+e.wrongCount||1)*100);m.innerHTML=`
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
            <strong>${s}%</strong>
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
        <p class="status-text">歷史錯題累積：${n} 題</p>
      </section>
    </main>
  `}function se(){const t=y(),n=e.currentIndex+1,s=e.questions.length,r=t.answer,o=M(t),i=t.options.map((b,d)=>{const u=b.split(`
`).map(h=>h.trim()).filter(Boolean),L=u.length>1?"option-text bilingual":"option-text",q=e.selectedAnswers.includes(d),v=r.includes(d),H=e.submitted&&v,E=e.submitted&&q&&!v,T=H?"is-correct":E?"is-wrong":q?"is-selected":"",O=d+1;return`
        <button class="option-card ${T}" data-option-index="${d}">
          <span class="option-badge">${O}</span>
          <span class="${L}">
            ${u.map((h,N)=>`<span class="${N===0?"option-zh":"option-en"}">${l(h)}</span>`).join("")}
          </span>
        </button>
      `}).join(""),c=e.submitted?`正確答案：${r.map(b=>b+1).join("、")}`:o?"此題可複選":"此題為單選";m.innerHTML=`
    <main class="shell ${e.returningHome?"is-returning":""}">
      <section class="quiz-card">
        <header class="quiz-topbar">
          <div>
            <p class="eyebrow">Question ${n}</p>
            <h1>手機答題模式</h1>
          </div>
          <div class="score-pill">${e.score} 分</div>
        </header>

        <div class="progress-meta">
          <span>${n} / ${s}</span>
          <span>${o?"複選題":"單選題"}</span>
        </div>
        <div class="progress-track">
          <span style="width: ${n/s*100}%"></span>
        </div>

        <article class="question-panel">
          <div class="question-tags">
            <span>${l(t.type||"一般題")}</span>
            <span>${l(t.difficulty||"未分類")}</span>
          </div>
          <h2>${l(t.question).replaceAll(`
`,"<br />")}</h2>
          <p class="helper-text">${c}</p>
        </article>

        <section class="options-grid">
          ${i}
        </section>

        <footer class="action-bar">
          <button class="btn btn-ghost" data-action="home" ${e.returningHome?"disabled":""}>回到首頁</button>
          <button class="btn btn-secondary" data-action="restart">重來</button>
          ${e.submitted?`<button class="btn btn-primary" data-action="next">${n===s?"看結果":"下一題"}</button>`:`<button class="btn btn-primary" data-action="submit" ${e.selectedAnswers.length===0?"disabled":""}>送出答案</button>`}
        </footer>
      </section>
    </main>
  `}function a(){if(!e.started){te();return}if(e.finished){ne();return}se()}async function oe(){try{e.wrongQuestionIds=R();const t=await fetch("/fin_test/data_table.json");if(!t.ok)throw new Error(`題庫載入失敗（${t.status}）`);const n=await t.json();e.allQuestions=_(n),g(),e.error=e.questions.length===0?"題庫內容為空，請確認 JSON 格式。":""}catch(t){e.error=t instanceof Error?t.message:"題庫載入失敗"}finally{e.loading=!1,a()}}m.addEventListener("click",t=>{const n=t.target.closest("[data-action]"),s=t.target.closest("[data-option-index]");if(n){const r=n.dataset.action;if(r==="start")w();else if(r==="shuffle")Z();else if(r==="filter"){const o=f();P(n.dataset.category||"全部"),a(),p(o)}else if(r==="toggle-filter-panel"){const o=f();e.filterExpanded=!e.filterExpanded,a(),p(o)}else if(r==="clear-filters"){const o=f();k(),a(),p(o)}else if(r==="set-mode"){const o=f();Q(n.dataset.mode||"all"),a(),p(o)}else if(r==="toggle-wrong-mode"){const o=f();Q(e.playMode==="wrong"?"all":"wrong"),a(),p(o)}else if(r==="clear-wrong"){const o=f();J(),a(),p(o)}else r==="submit"?U():r==="next"?X():r==="restart"?w():r==="home"?ee():r==="decrease-question-limit"?(S("decrease"),a()):r==="increase-question-limit"&&(S("increase"),a());return}s&&V(Number(s.dataset.optionIndex))});a();oe();
