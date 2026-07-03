(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const d of a.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&o(d)}).observe(document,{childList:!0,subtree:!0});function s(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(r){if(r.ep)return;r.ep=!0;const a=s(r);fetch(r.href,a)}})();const $="未分類",S="全部",P="quiz_wrong_questions",j="quiz_progress",V="quiz_active_exam",f=[{key:"finance",label:"法金題庫",shortLabel:"法金",file:"data_table.json",categoryFallback:$,answerBase:0},{key:"esgf",label:"ESGF 題庫",shortLabel:"ESGF",file:"data_table_esgf.json",categoryFallback:$,answerBase:1}],K={all:{label:"全部隨機",helper:"平均分配各類別，已作答題目也會重新出現。"},preferUnanswered:{label:"優先未作答",helper:"先出沒做過的題目，不夠時才補已作答題目。"},unansweredOnly:{label:"只出未作答",helper:"只抽沒做過的題目，適合用來刷完整體進度。"}},e={activeExamKey:re(),allQuestions:[],questions:[],started:!1,finished:!1,currentIndex:0,selectedAnswers:[],submitted:!1,score:0,correctCount:0,wrongCount:0,loading:!0,error:"",selectedCategories:[],returningHome:!1,filterExpanded:!0,wrongQuestionIds:[],playMode:"all",questionLimit:20,questionSelectionMode:"preferUnanswered",progress:{answeredQuestionIds:[],categoryStats:{}}},q=document.querySelector("#app");function y(t){return[...new Set((Array.isArray(t)?t:[]).map(n=>String(n)))]}function re(){try{const t=window.localStorage.getItem(V);return f.some(n=>n.key===t)?t:f[0].key}catch{return f[0].key}}function oe(){window.localStorage.setItem(V,e.activeExamKey)}function N(){return f.find(t=>t.key===e.activeExamKey)||f[0]}function A(t){return`${t}_${e.activeExamKey}`}function ae(t){return Array.isArray(t)?t:t&&typeof t=="object"&&t.sheets&&typeof t.sheets=="object"?Object.values(t.sheets).flatMap(n=>Array.isArray(n)?n:[]):[]}function F(t){return Array.isArray(t)?t.map(n=>String(n).trim()):t&&typeof t=="object"?Object.entries(t).sort(([n],[s])=>Number(n)-Number(s)).map(([,n])=>String(n).trim()):[]}function _(t,n){return(Array.isArray(t)?t:[t]).map(o=>Number(o)).filter(o=>Number.isFinite(o)).map(o=>o-n.answerBase).sort((o,r)=>o-r)}function ie(t,n=N()){return ae(t).filter(s=>{const o=typeof s.question=="string"&&s.question.trim(),r=F(s.options).length>1,a=_(s.answer,n).length>0;return o&&r&&a}).map(s=>({...s,id:String(s.id??s.no??s.row),type:String(s.type||n.categoryFallback||$).trim()||$,difficulty:String(s.difficulty||"未分類").trim()||"未分類",question:s.question.trim(),options:F(s.options),answer:_(s.answer,n),answer_type:s.answer_type||(_(s.answer,n).length>1?"複選":"單選")}))}function z(){return e.questions[e.currentIndex]}function h(t){return t?.type||$}function Y(){const t=new Set;return e.allQuestions.forEach(n=>{t.add(h(n))}),[...t].sort((n,s)=>n.localeCompare(s,"zh-Hant"))}function M(){const t=e.selectedCategories.length===0?[...e.allQuestions]:e.allQuestions.filter(s=>e.selectedCategories.includes(h(s)));if(e.playMode!=="wrong")return t;if(e.wrongQuestionIds.length===0)return[];const n=new Set(e.wrongQuestionIds);return t.filter(s=>n.has(s.id))}function Q(t){return[...t].map(n=>({question:n,random:Math.random()})).sort((n,s)=>n.random-s.random).map(n=>n.question)}function ce(t){return[...t].map(n=>({item:n,random:Math.random()})).sort((n,s)=>n.random-s.random).map(n=>n.item)}function R(t){if(t<=0)return[];if(t<=5)return[t];const n=[];for(let s=5;s<t;s+=5)n.push(s);return n[n.length-1]!==t&&n.push(t),n}function le(t){return e.questionLimit==="all"?t:Math.min(e.questionLimit,t)}function X(t){const n=R(t);return n.length===0?0:e.questionLimit==="all"?n[n.length-1]:n.includes(e.questionLimit)?e.questionLimit:n.find(s=>s>=e.questionLimit)??n[n.length-1]}function Z(){e.currentIndex=0,e.selectedAnswers=[],e.submitted=!1,e.finished=!1,e.started=!1,e.score=0,e.correctCount=0,e.wrongCount=0}function p(){return{windowY:window.scrollY,panelScrollTop:document.querySelector(".filter-list")instanceof HTMLElement?document.querySelector(".filter-list").scrollTop:0}}function m(t){if(!t)return;window.scrollTo({top:t.windowY});const n=document.querySelector(".filter-list");n instanceof HTMLElement&&(n.scrollTop=t.panelScrollTop)}function w(){e.questions=M(),Z()}function ue(t){if(t===S){e.selectedCategories=[],w();return}e.selectedCategories=e.selectedCategories.includes(t)?e.selectedCategories.filter(n=>n!==t):[...e.selectedCategories,t],w()}function de(){e.selectedCategories=[],w()}function ge(){try{const t=window.localStorage.getItem(A(P))||(e.activeExamKey==="finance"?window.localStorage.getItem(P):null);if(!t)return[];const n=JSON.parse(t);return y(n)}catch{return[]}}function G(){window.localStorage.setItem(A(P),JSON.stringify(e.wrongQuestionIds))}function D(){return{answeredIds:[],correctIds:[],wrongIds:[]}}function k(t){const n=typeof t=="object"&&t!==null?t:{},s=typeof n.categoryStats=="object"&&n.categoryStats!==null?n.categoryStats:{},o=Object.fromEntries(Object.entries(s).map(([r,a])=>[r,{answeredIds:y(a?.answeredIds),correctIds:y(a?.correctIds),wrongIds:y(a?.wrongIds)}]));return{answeredQuestionIds:y(n.answeredQuestionIds),categoryStats:o}}function fe(){try{const t=window.localStorage.getItem(A(j))||(e.activeExamKey==="finance"?window.localStorage.getItem(j):null);return k(t?JSON.parse(t):{})}catch{return k({})}}function pe(){window.localStorage.setItem(A(j),JSON.stringify(e.progress))}function me(t){e.wrongQuestionIds.includes(t)||(e.wrongQuestionIds=[...e.wrongQuestionIds,t],G())}function be(t){e.wrongQuestionIds.includes(t)&&(e.wrongQuestionIds=e.wrongQuestionIds.filter(n=>n!==t),G())}function we(){e.wrongQuestionIds=[],G(),e.playMode==="wrong"&&w()}function B(t){e.playMode=t,w()}function he(t){t!==e.activeExamKey&&f.some(n=>n.key===t)&&(e.activeExamKey=t,oe(),e.loading=!0,e.error="",e.allQuestions=[],e.questions=[],e.selectedCategories=[],e.playMode="all",e.filterExpanded=!0,Z(),i(),ne())}function ye(t){K[t]&&(e.questionSelectionMode=t,e.started||i())}function ee(t){if(e.questionSelectionMode!=="unansweredOnly")return t.length;const n=new Set(e.progress.answeredQuestionIds);return t.filter(s=>!n.has(s.id)).length}function U(t){const n=ee(M()),s=R(n);if(s.length===0)return;const o=X(n),r=Math.max(s.indexOf(o),0),a=t==="increase"?Math.min(r+1,s.length-1):Math.max(r-1,0);e.questionLimit=s[a]}function $e(){return e.selectedCategories.length===0?S:e.selectedCategories.length===1?e.selectedCategories[0]:`已選 ${e.selectedCategories.length} 類`}function Se(){return e.playMode==="wrong"?"歷史錯題":"全部題庫"}function Ie(){return N().label}function W(){return K[e.questionSelectionMode].label}function te(t){return t.answer_type==="複選"||t.answer.length>1}function Ce(t){const n=z();e.submitted||(te(n)?e.selectedAnswers=e.selectedAnswers.includes(t)?e.selectedAnswers.filter(s=>s!==t):[...e.selectedAnswers,t].sort((s,o)=>s-o):e.selectedAnswers=[t],i())}function ve(t,n){return t.length!==n.length?!1:t.every((s,o)=>s===n[o])}function x(t,n){return t.includes(n)?t:[...t,n]}function J(t,n){return t.filter(s=>s!==n)}function xe(t,n){const s=t.id,o=h(t),r=e.progress.categoryStats[o]||D();e.progress={answeredQuestionIds:x(e.progress.answeredQuestionIds,s),categoryStats:{...e.progress.categoryStats,[o]:{answeredIds:x(r.answeredIds,s),correctIds:n?x(r.correctIds,s):J(r.correctIds,s),wrongIds:n?J(r.wrongIds,s):x(r.wrongIds,s)}}},pe()}function Qe(){if(e.submitted||e.selectedAnswers.length===0)return;const t=z(),n=[...e.selectedAnswers].sort((o,r)=>o-r),s=ve(n,t.answer);e.submitted=!0,xe(t,s),s?(e.score+=10,e.correctCount+=1,be(t.id)):(e.wrongCount+=1,me(t.id)),i()}function qe(){if(e.currentIndex>=e.questions.length-1){e.finished=!0,i();return}e.currentIndex+=1,e.selectedAnswers=[],e.submitted=!1,i()}function Ae(t){const n=new Set(e.progress.answeredQuestionIds),s=new Map;return t.forEach(o=>{const r=h(o),a=s.get(r)||[];a.push(o),s.set(r,a)}),[...s.entries()].map(([o,r])=>{const a=Q(r.filter(l=>!n.has(l.id))),d=Q(r.filter(l=>n.has(l.id)));return e.questionSelectionMode==="all"?{category:o,primary:Q(r),secondary:[]}:e.questionSelectionMode==="unansweredOnly"?{category:o,primary:a,secondary:[]}:{category:o,primary:a,secondary:d}})}function Me(t){const n=Ae(t).map(a=>({...a,picked:0,totalAvailable:a.primary.length+a.secondary.length})).filter(a=>a.totalAvailable>0),s=n.reduce((a,d)=>a+d.totalAvailable,0),o=le(s),r=[];for(;r.length<o;){const a=ce(n).sort((l,u)=>l.picked-u.picked);let d=!1;if(a.forEach(l=>{if(r.length>=o)return;const u=l.primary.shift()||l.secondary.shift();u&&(l.picked+=1,r.push(u),d=!0)}),!d)break}return Q(r)}function H(){const t=Me(M());t.length!==0&&(e.questions=t,e.started=!0,e.finished=!1,e.currentIndex=0,e.selectedAnswers=[],e.submitted=!1,e.score=0,e.correctCount=0,e.wrongCount=0,i())}function Ee(){H()}function Le(){e.returningHome||(e.returningHome=!0,i(),window.setTimeout(()=>{e.returningHome=!1,e.started=!1,e.finished=!1,e.currentIndex=0,e.selectedAnswers=[],e.submitted=!1,e.score=0,e.correctCount=0,e.wrongCount=0,i()},420))}function g(t){return String(t).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function Oe(){return e.allQuestions.reduce((t,n)=>{const s=h(n);return t[s]=(t[s]||0)+1,t},{})}function Te(t,n){const s=e.progress.categoryStats[t]||D(),o=s.answeredIds.length,r=s.correctIds.length,a=n[t]||0;return{category:t,totalCount:a,answeredCount:o,unansweredCount:Math.max(a-o,0),progressPercent:a===0?0:Math.round(o/a*100),accuracyPercent:o===0?0:Math.round(r/o*100)}}function _e(){const t=e.progress.answeredQuestionIds.length,n=e.allQuestions.length;return{answeredCount:t,totalCount:n,progressPercent:n===0?0:Math.round(t/n*100)}}function ke(){const t=M(),n=ee(t),s=t.length,o=e.wrongQuestionIds.length,r=X(n),a=R(n),d=a.length===0||r===a[0],l=a.length===0||r===a[a.length-1],u=_e(),I=Oe();`${W()}`;const E=f.map(c=>`
      <button
        class="exam-toggle-btn ${e.activeExamKey===c.key?"is-active":""}"
        data-action="set-exam"
        data-exam-key="${c.key}"
        aria-pressed="${e.activeExamKey===c.key?"true":"false"}"
      >${g(c.shortLabel)}</button>
    `).join(""),C=`
    <label
      class="filter-row ${e.selectedCategories.length===0?"is-active":""}"
      style="--category-progress: ${u.progressPercent}%"
    >
      <input
        type="checkbox"
        data-action="filter"
        data-category="${S}"
        ${e.selectedCategories.length===0?"checked":""}
      />
      <span class="filter-box"></span>
      <span class="filter-label">${S}</span>
      <span class="filter-meta">${u.progressPercent}%</span>
    </label>
    ${Y().map(c=>{const b=Te(c,I);return`
          <label
            class="filter-row ${e.selectedCategories.includes(c)?"is-active":""}"
            style="--category-progress: ${b.progressPercent}%"
          >
            <input
              type="checkbox"
              data-action="filter"
              data-category="${g(c)}"
              ${e.selectedCategories.includes(c)?"checked":""}
            />
            <span class="filter-box"></span>
            <span class="filter-label">${g(c)}</span>
            <span class="filter-meta">${b.progressPercent}%</span>
          </label>
        `}).join("")}
  `,v=e.filterExpanded?"is-expanded":"is-collapsed",L=e.filterExpanded?"收合分類":"展開分類",O=Y().length<=1?"is-compact":"";q.innerHTML=`
    <main class="shell">
      <section class="hero-card">
        <p class="eyebrow">Mobile Quiz Game</p>
        <div class="top-utility">
          <div class="exam-toggle" role="group" aria-label="題庫切換">
            ${E}
          </div>
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
            ${Object.entries(K).map(([c,b])=>`
                  <button
                    class="mode-toggle-btn ${e.questionSelectionMode===c?"is-active":""}"
                    data-action="set-question-mode"
                    data-question-mode="${c}"
                    aria-pressed="${e.questionSelectionMode===c?"true":"false"}"
                    title="${g(b.label)}"
                  >${g(c==="all"?"全":c==="preferUnanswered"?"優":"未")}</button>
                `).join("")}
          </div>
        </div>
        <h1 class="home-title">${o>25?"禎禎要複習":"禎禎我最棒"}</h1>
        <p class="hero-copy">
          目前題庫為「${g(Ie())}」。題目會依類別平均輪替出題。現在目前篩選範圍內可出 <strong>${n}</strong> 題，
          題庫總覽為 ${s} 題。
        </p>
        <section class="filter-panel ${v} ${O}">
          <div class="filter-head">
            <strong>題目分類</strong>
            <span>${g(Se())} · ${g($e())} · ${n} 題可出</span>
          </div>
          <div class="filter-toolbar">
            <button class="btn btn-ghost btn-compact" data-action="toggle-filter-panel">${L}</button>
            <button class="btn btn-ghost btn-compact" data-action="clear-filters" ${e.selectedCategories.length===0?"disabled":""}>清除分類</button>
          </div>
          <div class="filter-list" role="group" aria-label="題目分類篩選">${C}</div>
        </section>
        <div class="hero-actions">
          <div class="question-limit-control">
            <span>本次題數</span>
            <div class="question-limit-stepper">
              <button
                class="stepper-btn"
                data-action="decrease-question-limit"
                ${e.loading||n===0||d?"disabled":""}
                aria-label="減少題數"
              >-</button>
              <strong>${r}</strong>
              <button
                class="stepper-btn"
                data-action="increase-question-limit"
                ${e.loading||n===0||l?"disabled":""}
                aria-label="增加題數"
              >+</button>
            </div>
          </div>
          <button class="btn btn-primary" data-action="start" ${e.loading||n===0?"disabled":""}>開始</button>
          <button class="btn btn-secondary" data-action="shuffle" ${e.loading||n===0?"disabled":""}>重抽</button>
        </div>
        <p class="status-text">
          ${e.loading?"題庫載入中...":e.error?g(e.error):n===0?"目前條件下沒有可出的題目，請切換分類或改用其他出題模式。":`已作答 ${u.answeredCount} / ${u.totalCount} 題（${u.progressPercent}%），目前模式為「${g(W())}」。`}
        </p>
      </section>
    </main>
  `}function Pe(){const t=e.questions.length,n=e.wrongQuestionIds.length,s=t===0?0:Math.round(e.correctCount/(e.correctCount+e.wrongCount||1)*100);q.innerHTML=`
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
  `}function je(){const t=z(),n=e.currentIndex+1,s=e.questions.length,o=t.answer,r=te(t),a=t.options.map((l,u)=>{const I=l.split(`
`).map(T=>T.trim()).filter(Boolean),E=I.length>1?"option-text bilingual":"option-text",C=e.selectedAnswers.includes(u),v=o.includes(u),L=e.submitted&&v,O=e.submitted&&C&&!v,c=L?"is-correct":O?"is-wrong":C?"is-selected":"",b=u+1;return`
        <button class="option-card ${c}" data-option-index="${u}">
          <span class="option-badge">${b}</span>
          <span class="${E}">
            ${I.map((T,se)=>`<span class="${se===0?"option-zh":"option-en"}">${g(T)}</span>`).join("")}
          </span>
        </button>
      `}).join(""),d=e.submitted?`正確答案：${o.map(l=>l+1).join("、")}`:r?"此題可複選":"此題為單選";q.innerHTML=`
    <main class="shell ${e.returningHome?"is-returning":""}">
      <section class="quiz-card">

        <div class="progress-meta">
          <span>${n} / ${s}</span>
          <span>${r?"複選題":"單選題"}</span>
        </div>
        <div class="progress-track">
          <span style="width: ${n/s*100}%"></span>
        </div>

        <article class="question-panel">
          <div class="question-tags">
            <span>${g(h(t))}</span>
            <span>${g(t.difficulty||"未分類")}</span>
          </div>
          <h2>${g(t.question).replaceAll(`
`,"<br />")}</h2>
          <p class="helper-text">${d}</p>
        </article>

        <section class="options-grid">
          ${a}
        </section>

        <footer class="action-bar">
          <button class="btn btn-ghost" data-action="home" ${e.returningHome?"disabled":""}>回首頁</button>
          <button class="btn btn-secondary" data-action="restart">重來</button>
          ${e.submitted?`<button class="btn btn-primary" data-action="next">${n===s?"看結果":"下一題"}</button>`:`<button class="btn btn-primary" data-action="submit" ${e.selectedAnswers.length===0?"disabled":""}>送出答案</button>`}
        </footer>
      </section>
    </main>
  `}function i(){if(!e.started){ke();return}if(e.finished){Pe();return}je()}async function ne(){try{const t=N();e.wrongQuestionIds=ge(),e.progress=fe();const n=await fetch(`/fin_test/${t.file}`);if(!n.ok)throw new Error(`題庫載入失敗（${n.status}）`);const s=await n.json();e.allQuestions=ie(s,t),w(),e.error=e.questions.length===0?"題庫內容為空，請確認 JSON 格式。":""}catch(t){e.error=t instanceof Error?t.message:"題庫載入失敗"}finally{e.loading=!1,i()}}q.addEventListener("click",t=>{const n=t.target.closest("[data-action]"),s=t.target.closest("[data-option-index]");if(n){const o=n.dataset.action;if(o==="start")H();else if(o==="shuffle")Ee();else if(o==="filter"){const r=p();ue(n.dataset.category||S),i(),m(r)}else if(o==="toggle-filter-panel"){const r=p();e.filterExpanded=!e.filterExpanded,i(),m(r)}else if(o==="clear-filters"){const r=p();de(),i(),m(r)}else if(o==="set-mode"){const r=p();B(n.dataset.mode||"all"),i(),m(r)}else if(o==="toggle-wrong-mode"){const r=p();B(e.playMode==="wrong"?"all":"wrong"),i(),m(r)}else if(o==="clear-wrong"){const r=p();we(),i(),m(r)}else if(o==="set-exam")he(n.dataset.examKey||f[0].key);else if(o==="set-question-mode"){const r=p();ye(n.dataset.questionMode||"preferUnanswered"),i(),m(r)}else o==="submit"?Qe():o==="next"?qe():o==="restart"?H():o==="home"?Le():o==="decrease-question-limit"?(U("decrease"),i()):o==="increase-question-limit"&&(U("increase"),i());return}s&&Ce(Number(s.dataset.optionIndex))});i();ne();
