(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const u of i.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&o(u)}).observe(document,{childList:!0,subtree:!0});function s(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(r){if(r.ep)return;r.ep=!0;const i=s(r);fetch(r.href,i)}})();const x="未分類",y="全部",k="quiz_wrong_questions",R="quiz_progress",O={all:{label:"全部隨機",helper:"平均分配各類別，已作答題目也會重新出現。"},preferUnanswered:{label:"優先未作答",helper:"先出沒做過的題目，不夠時才補已作答題目。"},unansweredOnly:{label:"只出未作答",helper:"只抽沒做過的題目，適合用來刷完整體進度。"}},e={allQuestions:[],questions:[],started:!1,finished:!1,currentIndex:0,selectedAnswers:[],submitted:!1,score:0,correctCount:0,wrongCount:0,loading:!0,error:"",selectedCategories:[],returningHome:!1,filterExpanded:!0,wrongQuestionIds:[],playMode:"all",questionLimit:20,questionSelectionMode:"preferUnanswered",progress:{answeredQuestionIds:[],categoryStats:{}}},q=document.querySelector("#app");function h(t){return[...new Set((Array.isArray(t)?t:[]).map(n=>String(n)))]}function K(t){return t.filter(n=>{const s=typeof n.question=="string"&&n.question.trim(),o=Array.isArray(n.options)&&n.options.length>1,r=Array.isArray(n.answer)&&n.answer.length>0;return s&&o&&r}).map(n=>({...n,id:String(n.id),type:String(n.type||x).trim()||x,difficulty:String(n.difficulty||"未分類").trim()||"未分類",question:n.question.trim(),options:n.options.map(s=>String(s).trim()),answer:n.answer.map(s=>Number(s)).sort((s,o)=>s-o),answer_type:n.answer_type||(n.answer.length>1?"複選":"單選")}))}function T(){return e.questions[e.currentIndex]}function w(t){return t?.type||x}function D(){const t=new Set;return e.allQuestions.forEach(n=>{t.add(w(n))}),[...t].sort((n,s)=>n.localeCompare(s,"zh-Hant"))}function v(){const t=e.selectedCategories.length===0?[...e.allQuestions]:e.allQuestions.filter(s=>e.selectedCategories.includes(w(s)));if(e.playMode!=="wrong")return t;if(e.wrongQuestionIds.length===0)return[];const n=new Set(e.wrongQuestionIds);return t.filter(s=>n.has(s.id))}function Q(t){return[...t].map(n=>({question:n,random:Math.random()})).sort((n,s)=>n.random-s.random).map(n=>n.question)}function V(t){return[...t].map(n=>({item:n,random:Math.random()})).sort((n,s)=>n.random-s.random).map(n=>n.item)}function P(t){if(t<=0)return[];if(t<=5)return[t];const n=[];for(let s=5;s<t;s+=5)n.push(s);return n[n.length-1]!==t&&n.push(t),n}function X(t){return e.questionLimit==="all"?t:Math.min(e.questionLimit,t)}function G(t){const n=P(t);return n.length===0?0:e.questionLimit==="all"?n[n.length-1]:n.includes(e.questionLimit)?e.questionLimit:n.find(s=>s>=e.questionLimit)??n[n.length-1]}function Z(){e.currentIndex=0,e.selectedAnswers=[],e.submitted=!1,e.finished=!1,e.started=!1,e.score=0,e.correctCount=0,e.wrongCount=0}function p(){return{windowY:window.scrollY,panelScrollTop:document.querySelector(".filter-list")instanceof HTMLElement?document.querySelector(".filter-list").scrollTop:0}}function f(t){if(!t)return;window.scrollTo({top:t.windowY});const n=document.querySelector(".filter-list");n instanceof HTMLElement&&(n.scrollTop=t.panelScrollTop)}function b(){e.questions=v(),Z()}function ee(t){if(t===y){e.selectedCategories=[],b();return}e.selectedCategories=e.selectedCategories.includes(t)?e.selectedCategories.filter(n=>n!==t):[...e.selectedCategories,t],b()}function te(){e.selectedCategories=[],b()}function ne(){try{const t=window.localStorage.getItem(k);if(!t)return[];const n=JSON.parse(t);return h(n)}catch{return[]}}function H(){window.localStorage.setItem(k,JSON.stringify(e.wrongQuestionIds))}function W(){return{answeredIds:[],correctIds:[],wrongIds:[]}}function L(t){const n=typeof t=="object"&&t!==null?t:{},s=typeof n.categoryStats=="object"&&n.categoryStats!==null?n.categoryStats:{},o=Object.fromEntries(Object.entries(s).map(([r,i])=>[r,{answeredIds:h(i?.answeredIds),correctIds:h(i?.correctIds),wrongIds:h(i?.wrongIds)}]));return{answeredQuestionIds:h(n.answeredQuestionIds),categoryStats:o}}function se(){try{const t=window.localStorage.getItem(R);return L(t?JSON.parse(t):{})}catch{return L({})}}function re(){window.localStorage.setItem(R,JSON.stringify(e.progress))}function oe(t){e.wrongQuestionIds.includes(t)||(e.wrongQuestionIds=[...e.wrongQuestionIds,t],H())}function ie(t){e.wrongQuestionIds.includes(t)&&(e.wrongQuestionIds=e.wrongQuestionIds.filter(n=>n!==t),H())}function ae(){e.wrongQuestionIds=[],H(),e.playMode==="wrong"&&b()}function _(t){e.playMode=t,b()}function ce(t){O[t]&&(e.questionSelectionMode=t,e.started||a())}function Y(t){if(e.questionSelectionMode!=="unansweredOnly")return t.length;const n=new Set(e.progress.answeredQuestionIds);return t.filter(s=>!n.has(s.id)).length}function N(t){const n=Y(v()),s=P(n);if(s.length===0)return;const o=G(n),r=Math.max(s.indexOf(o),0),i=t==="increase"?Math.min(r+1,s.length-1):Math.max(r-1,0);e.questionLimit=s[i]}function le(){return e.selectedCategories.length===0?y:e.selectedCategories.length===1?e.selectedCategories[0]:`已選 ${e.selectedCategories.length} 類`}function ue(){return e.playMode==="wrong"?"歷史錯題":"全部題庫"}function j(){return O[e.questionSelectionMode].label}function U(t){return t.answer_type==="複選"||t.answer.length>1}function de(t){const n=T();e.submitted||(U(n)?e.selectedAnswers=e.selectedAnswers.includes(t)?e.selectedAnswers.filter(s=>s!==t):[...e.selectedAnswers,t].sort((s,o)=>s-o):e.selectedAnswers=[t],a())}function ge(t,n){return t.length!==n.length?!1:t.every((s,o)=>s===n[o])}function C(t,n){return t.includes(n)?t:[...t,n]}function z(t,n){return t.filter(s=>s!==n)}function pe(t,n){const s=t.id,o=w(t),r=e.progress.categoryStats[o]||W();e.progress={answeredQuestionIds:C(e.progress.answeredQuestionIds,s),categoryStats:{...e.progress.categoryStats,[o]:{answeredIds:C(r.answeredIds,s),correctIds:n?C(r.correctIds,s):z(r.correctIds,s),wrongIds:n?z(r.wrongIds,s):C(r.wrongIds,s)}}},re()}function fe(){if(e.submitted||e.selectedAnswers.length===0)return;const t=T(),n=[...e.selectedAnswers].sort((o,r)=>o-r),s=ge(n,t.answer);e.submitted=!0,pe(t,s),s?(e.score+=10,e.correctCount+=1,ie(t.id)):(e.wrongCount+=1,oe(t.id)),a()}function me(){if(e.currentIndex>=e.questions.length-1){e.finished=!0,a();return}e.currentIndex+=1,e.selectedAnswers=[],e.submitted=!1,a()}function be(t){const n=new Set(e.progress.answeredQuestionIds),s=new Map;return t.forEach(o=>{const r=w(o),i=s.get(r)||[];i.push(o),s.set(r,i)}),[...s.entries()].map(([o,r])=>{const i=Q(r.filter(c=>!n.has(c.id))),u=Q(r.filter(c=>n.has(c.id)));return e.questionSelectionMode==="all"?{category:o,primary:Q(r),secondary:[]}:e.questionSelectionMode==="unansweredOnly"?{category:o,primary:i,secondary:[]}:{category:o,primary:i,secondary:u}})}function we(t){const n=be(t).map(i=>({...i,picked:0,totalAvailable:i.primary.length+i.secondary.length})).filter(i=>i.totalAvailable>0),s=n.reduce((i,u)=>i+u.totalAvailable,0),o=X(s),r=[];for(;r.length<o;){const i=V(n).sort((c,l)=>c.picked-l.picked);let u=!1;if(i.forEach(c=>{if(r.length>=o)return;const l=c.primary.shift()||c.secondary.shift();l&&(c.picked+=1,r.push(l),u=!0)}),!u)break}return Q(r)}function E(){const t=we(v());t.length!==0&&(e.questions=t,e.started=!0,e.finished=!1,e.currentIndex=0,e.selectedAnswers=[],e.submitted=!1,e.score=0,e.correctCount=0,e.wrongCount=0,a())}function he(){E()}function ye(){e.returningHome||(e.returningHome=!0,a(),window.setTimeout(()=>{e.returningHome=!1,e.started=!1,e.finished=!1,e.currentIndex=0,e.selectedAnswers=[],e.submitted=!1,e.score=0,e.correctCount=0,e.wrongCount=0,a()},420))}function g(t){return String(t).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function $e(){return e.allQuestions.reduce((t,n)=>{const s=w(n);return t[s]=(t[s]||0)+1,t},{})}function Se(t,n){const s=e.progress.categoryStats[t]||W(),o=s.answeredIds.length,r=s.correctIds.length,i=n[t]||0;return{category:t,totalCount:i,answeredCount:o,unansweredCount:Math.max(i-o,0),progressPercent:i===0?0:Math.round(o/i*100),accuracyPercent:o===0?0:Math.round(r/o*100)}}function Ie(){const t=e.progress.answeredQuestionIds.length,n=e.allQuestions.length;return{answeredCount:t,totalCount:n,progressPercent:n===0?0:Math.round(t/n*100)}}function Ce(){const t=v(),n=Y(t),s=t.length,o=e.wrongQuestionIds.length,r=G(n),i=P(n),u=i.length===0||r===i[0],c=i.length===0||r===i[i.length-1],l=Ie(),$=$e();`${j()}`;const M=`
    <label
      class="filter-row ${e.selectedCategories.length===0?"is-active":""}"
      style="--category-progress: ${l.progressPercent}%"
    >
      <input
        type="checkbox"
        data-action="filter"
        data-category="${y}"
        ${e.selectedCategories.length===0?"checked":""}
      />
      <span class="filter-box"></span>
      <span class="filter-label">${y}</span>
      <span class="filter-meta">${l.progressPercent}%</span>
    </label>
    ${D().map(d=>{const m=Se(d,$);return`
          <label
            class="filter-row ${e.selectedCategories.includes(d)?"is-active":""}"
            style="--category-progress: ${m.progressPercent}%"
          >
            <input
              type="checkbox"
              data-action="filter"
              data-category="${g(d)}"
              ${e.selectedCategories.includes(d)?"checked":""}
            />
            <span class="filter-box"></span>
            <span class="filter-label">${g(d)}</span>
            <span class="filter-meta">${m.progressPercent}%</span>
          </label>
        `}).join("")}
  `,S=e.filterExpanded?"is-expanded":"is-collapsed",I=e.filterExpanded?"收合分類":"展開分類";q.innerHTML=`
    <main class="shell">
      <section class="hero-card">
        <p class="eyebrow">Mobile Quiz Game</p>
        <div class="top-utility">
          <button
            class="btn btn-ghost btn-compact ${e.playMode==="wrong"?"is-mode-active":""}"
            data-action="toggle-wrong-mode"
            ${o===0&&e.playMode!=="wrong"?"disabled":""}
          >
            ${e.playMode==="wrong"?"目前：歷史錯題":`歷史錯題 ${o} 題`}
          </button>
          ${e.playMode==="wrong"?'<button class="btn btn-ghost btn-compact" data-action="set-mode" data-mode="all">回全部題庫</button>':""}
          <button class="btn btn-ghost btn-compact" data-action="clear-wrong" ${o===0?"disabled":""}>清空錯題</button>
          <div class="mode-toggle" role="group" aria-label="出題模式切換">
            ${Object.entries(O).map(([d,m])=>`
                  <button
                    class="mode-toggle-btn ${e.questionSelectionMode===d?"is-active":""}"
                    data-action="set-question-mode"
                    data-question-mode="${d}"
                    aria-pressed="${e.questionSelectionMode===d?"true":"false"}"
                    title="${g(m.label)}"
                  >${g(d==="all"?"全":d==="preferUnanswered"?"優":"未")}</button>
                `).join("")}
          </div>
        </div>
        <h1 class="home-title">${o>25?"禎禎要複習":"禎禎我最棒"}</h1>
        <p class="hero-copy">
          題目會依類別平均輪替出題。現在目前篩選範圍內可出 <strong>${n}</strong> 題，
          題庫總覽為 ${s} 題。
        </p>
        <section class="filter-panel ${S}">
          <div class="filter-head">
            <strong>題目分類</strong>
            <span>${g(ue())} · ${g(le())} · ${n} 題可出</span>
          </div>
          <div class="filter-toolbar">
            <button class="btn btn-ghost btn-compact" data-action="toggle-filter-panel">${I}</button>
            <button class="btn btn-ghost btn-compact" data-action="clear-filters" ${e.selectedCategories.length===0?"disabled":""}>清除分類</button>
          </div>
          <div class="filter-list" role="group" aria-label="題目分類篩選">${M}</div>
        </section>
        <div class="hero-actions">
          <div class="question-limit-control">
            <span>本次題數</span>
            <div class="question-limit-stepper">
              <button
                class="stepper-btn"
                data-action="decrease-question-limit"
                ${e.loading||n===0||u?"disabled":""}
                aria-label="減少題數"
              >-</button>
              <strong>${r}</strong>
              <button
                class="stepper-btn"
                data-action="increase-question-limit"
                ${e.loading||n===0||c?"disabled":""}
                aria-label="增加題數"
              >+</button>
            </div>
          </div>
          <button class="btn btn-primary" data-action="start" ${e.loading||n===0?"disabled":""}>開始</button>
          <button class="btn btn-secondary" data-action="shuffle" ${e.loading||n===0?"disabled":""}>重抽</button>
        </div>
        <p class="status-text">
          ${e.loading?"題庫載入中...":e.error?g(e.error):n===0?"目前條件下沒有可出的題目，請切換分類或改用其他出題模式。":`已作答 ${l.answeredCount} / ${l.totalCount} 題（${l.progressPercent}%），目前模式為「${g(j())}」。`}
        </p>
      </section>
    </main>
  `}function Qe(){const t=e.questions.length,n=e.wrongQuestionIds.length,s=t===0?0:Math.round(e.correctCount/(e.correctCount+e.wrongCount||1)*100);q.innerHTML=`
    <main class="shell ${e.returningHome?"is-returning":""}">
      <section class="hero-card result-card">
        <p class="eyebrow">Completed</p>
        <h1>本次練習完成</h1>
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
          <button class="btn btn-ghost" data-action="home">回首頁</button>
          <button class="btn btn-primary" data-action="restart">再做一次</button>
          <button class="btn btn-secondary" data-action="shuffle">重抽題目</button>
        </div>
        <p class="status-text">歷史錯題累積：${n} 題</p>
      </section>
    </main>
  `}function qe(){const t=T(),n=e.currentIndex+1,s=e.questions.length,o=t.answer,r=U(t),i=t.options.map((c,l)=>{const $=c.split(`
`).map(A=>A.trim()).filter(Boolean),M=$.length>1?"option-text bilingual":"option-text",S=e.selectedAnswers.includes(l),I=o.includes(l),d=e.submitted&&I,m=e.submitted&&S&&!I,F=d?"is-correct":m?"is-wrong":S?"is-selected":"",J=l+1;return`
        <button class="option-card ${F}" data-option-index="${l}">
          <span class="option-badge">${J}</span>
          <span class="${M}">
            ${$.map((A,B)=>`<span class="${B===0?"option-zh":"option-en"}">${g(A)}</span>`).join("")}
          </span>
        </button>
      `}).join(""),u=e.submitted?`正確答案：${o.map(c=>c+1).join("、")}`:r?"此題可複選":"此題為單選";q.innerHTML=`
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
          <span>${r?"複選題":"單選題"}</span>
        </div>
        <div class="progress-track">
          <span style="width: ${n/s*100}%"></span>
        </div>

        <article class="question-panel">
          <div class="question-tags">
            <span>${g(w(t))}</span>
            <span>${g(t.difficulty||"未分類")}</span>
          </div>
          <h2>${g(t.question).replaceAll(`
`,"<br />")}</h2>
          <p class="helper-text">${u}</p>
        </article>

        <section class="options-grid">
          ${i}
        </section>

        <footer class="action-bar">
          <button class="btn btn-ghost" data-action="home" ${e.returningHome?"disabled":""}>回首頁</button>
          <button class="btn btn-secondary" data-action="restart">重來</button>
          ${e.submitted?`<button class="btn btn-primary" data-action="next">${n===s?"看結果":"下一題"}</button>`:`<button class="btn btn-primary" data-action="submit" ${e.selectedAnswers.length===0?"disabled":""}>送出答案</button>`}
        </footer>
      </section>
    </main>
  `}function a(){if(!e.started){Ce();return}if(e.finished){Qe();return}qe()}async function ve(){try{e.wrongQuestionIds=ne(),e.progress=se();const t=await fetch("/fin_test/data_table.json");if(!t.ok)throw new Error(`題庫載入失敗（${t.status}）`);const n=await t.json();e.allQuestions=K(n),b(),e.error=e.questions.length===0?"題庫內容為空，請確認 JSON 格式。":""}catch(t){e.error=t instanceof Error?t.message:"題庫載入失敗"}finally{e.loading=!1,a()}}q.addEventListener("click",t=>{const n=t.target.closest("[data-action]"),s=t.target.closest("[data-option-index]");if(n){const o=n.dataset.action;if(o==="start")E();else if(o==="shuffle")he();else if(o==="filter"){const r=p();ee(n.dataset.category||y),a(),f(r)}else if(o==="toggle-filter-panel"){const r=p();e.filterExpanded=!e.filterExpanded,a(),f(r)}else if(o==="clear-filters"){const r=p();te(),a(),f(r)}else if(o==="set-mode"){const r=p();_(n.dataset.mode||"all"),a(),f(r)}else if(o==="toggle-wrong-mode"){const r=p();_(e.playMode==="wrong"?"all":"wrong"),a(),f(r)}else if(o==="clear-wrong"){const r=p();ae(),a(),f(r)}else if(o==="set-question-mode"){const r=p();ce(n.dataset.questionMode||"preferUnanswered"),a(),f(r)}else o==="submit"?fe():o==="next"?me():o==="restart"?E():o==="home"?ye():o==="decrease-question-limit"?(N("decrease"),a()):o==="increase-question-limit"&&(N("increase"),a());return}s&&de(Number(s.dataset.optionIndex))});a();ve();
