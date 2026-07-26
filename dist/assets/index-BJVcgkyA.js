(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function r(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(o){if(o.ep)return;o.ep=!0;const a=r(o);fetch(o.href,a)}})();const S="未分類",v="全部",H="quiz_wrong_questions",z="quiz_progress",te="quiz_active_exam",ne="quiz_active_question_bank",g="all",p=[{key:"finance",label:"法金題庫",shortLabel:"法金",categoryFallback:S,answerBase:0,banks:[{key:"main",label:"主題庫",shortLabel:"主",file:"data_table.json"}]},{key:"esgf",label:"ESGF 題庫",shortLabel:"ESGF",categoryFallback:S,answerBase:1,banks:[{key:"esgf1",label:"題庫一",shortLabel:"一",file:"data_table_esgf.json"},{key:"esgf2",label:"題庫二",shortLabel:"二",file:"data_table_esgf2.json"}]}],W=de(),R={all:{label:"全部隨機",helper:"平均分配各類別，已作答題目也會重新出現。"},preferUnanswered:{label:"優先未作答",helper:"先出沒做過的題目，不夠時才補已作答題目。"},unansweredOnly:{label:"只出未作答",helper:"只抽沒做過的題目，適合用來刷完整體進度。"}},e={activeExamKey:W,activeBankKey:se(W),allQuestions:[],questions:[],started:!1,finished:!1,currentIndex:0,selectedAnswers:[],submitted:!1,score:0,correctCount:0,wrongCount:0,loading:!0,error:"",selectedCategories:[],returningHome:!1,filterExpanded:!0,wrongQuestionIds:[],playMode:"all",questionLimit:20,questionSelectionMode:"preferUnanswered",progress:{answeredQuestionIds:[],categoryStats:{}}},x=document.querySelector("#app");function $(t){return[...new Set((Array.isArray(t)?t:[]).map(n=>String(n)))]}function de(){try{const t=window.localStorage.getItem(te);return p.some(n=>n.key===t)?t:p[0].key}catch{return p[0].key}}function se(t){try{const n=window.localStorage.getItem(`${ne}_${t}`),r=p.find(a=>a.key===t)||p[0],s=r.banks.length>1,o=r.banks.map(a=>a.key);return s&&n===g?g:o.includes(n)?n:g}catch{return g}}function fe(){window.localStorage.setItem(te,e.activeExamKey)}function ge(){window.localStorage.setItem(`${ne}_${e.activeExamKey}`,e.activeBankKey)}function q(){return p.find(t=>t.key===e.activeExamKey)||p[0]}function M(){return q().banks}function I(){return M().length>1}function pe(){return!I()||e.activeBankKey===g?"全部題庫":M().find(t=>t.key===e.activeBankKey)?.label||"全部題庫"}function L(t){return`${t}_${e.activeExamKey}`}function be(t){return Array.isArray(t)?t:t&&typeof t=="object"&&t.sheets&&typeof t.sheets=="object"?Object.values(t.sheets).flatMap(n=>Array.isArray(n)?n:[]):[]}function J(t){return Array.isArray(t)?t.map(n=>String(n).trim()):t&&typeof t=="object"?Object.entries(t).sort(([n],[r])=>Number(n)-Number(r)).map(([,n])=>String(n).trim()):[]}function j(t,n){return(Array.isArray(t)?t:[t]).map(s=>Number(s)).filter(s=>Number.isFinite(s)).map(s=>s-n.answerBase).sort((s,o)=>s-o)}function me(t,n=q(),r){return be(t).filter(s=>{const o=typeof s.question=="string"&&s.question.trim(),a=J(s.options).length>1,c=j(s.answer,n).length>0;return o&&a&&c}).map(s=>({...s,id:n.banks.length>1?`${r.key}:${String(s.id??s.no??s.row)}`:String(s.id??s.no??s.row),bankKey:r.key,bankLabel:r.label,type:String(s.type||n.categoryFallback||S).trim()||S,difficulty:String(s.difficulty||"未分類").trim()||"未分類",question:s.question.trim(),options:J(s.options),answer:j(s.answer,n),answer_type:s.answer_type||(j(s.answer,n).length>1?"複選":"單選")}))}function F(){return e.questions[e.currentIndex]}function h(t){return t?.type||S}function K(){return!I()||e.activeBankKey===g?[...e.allQuestions]:e.allQuestions.filter(t=>t.bankKey===e.activeBankKey)}function V(){const t=new Set;return K().forEach(n=>{t.add(h(n))}),[...t].sort((n,r)=>n.localeCompare(r,"zh-Hant"))}function _(){const t=I()&&e.activeBankKey!==g?e.allQuestions.filter(s=>s.bankKey===e.activeBankKey):[...e.allQuestions],n=e.selectedCategories.length===0?t:t.filter(s=>e.selectedCategories.includes(h(s)));if(e.playMode!=="wrong")return n;if(e.wrongQuestionIds.length===0)return[];const r=new Set(e.wrongQuestionIds);return n.filter(s=>r.has(s.id))}function Q(t){return[...t].map(n=>({question:n,random:Math.random()})).sort((n,r)=>n.random-r.random).map(n=>n.question)}function ye(t){return[...t].map(n=>({item:n,random:Math.random()})).sort((n,r)=>n.random-r.random).map(n=>n.item)}function Y(t){if(t<=0)return[];if(t<=5)return[t];const n=[];for(let r=5;r<t;r+=5)n.push(r);return n[n.length-1]!==t&&n.push(t),n}function we(t){return e.questionLimit==="all"?t:Math.min(e.questionLimit,t)}function re(t){const n=Y(t);return n.length===0?0:e.questionLimit==="all"?n[n.length-1]:n.includes(e.questionLimit)?e.questionLimit:n.find(r=>r>=e.questionLimit)??n[n.length-1]}function oe(){e.currentIndex=0,e.selectedAnswers=[],e.submitted=!1,e.finished=!1,e.started=!1,e.score=0,e.correctCount=0,e.wrongCount=0}function m(){return{windowY:window.scrollY,panelScrollTop:document.querySelector(".filter-list")instanceof HTMLElement?document.querySelector(".filter-list").scrollTop:0}}function y(t){if(!t)return;window.scrollTo({top:t.windowY});const n=document.querySelector(".filter-list");n instanceof HTMLElement&&(n.scrollTop=t.panelScrollTop)}function w(){e.questions=_(),oe()}function he(t){if(t===v){e.selectedCategories=[],w();return}e.selectedCategories=e.selectedCategories.includes(t)?e.selectedCategories.filter(n=>n!==t):[...e.selectedCategories,t],w()}function $e(){e.selectedCategories=[],w()}function Se(){try{const t=window.localStorage.getItem(L(H))||(e.activeExamKey==="finance"?window.localStorage.getItem(H):null);if(!t)return[];const n=JSON.parse(t);return $(n)}catch{return[]}}function U(){window.localStorage.setItem(L(H),JSON.stringify(e.wrongQuestionIds))}function ae(){return{answeredIds:[],correctIds:[],wrongIds:[]}}function N(t){const n=typeof t=="object"&&t!==null?t:{},r=typeof n.categoryStats=="object"&&n.categoryStats!==null?n.categoryStats:{},s=Object.fromEntries(Object.entries(r).map(([o,a])=>[o,{answeredIds:$(a?.answeredIds),correctIds:$(a?.correctIds),wrongIds:$(a?.wrongIds)}]));return{answeredQuestionIds:$(n.answeredQuestionIds),categoryStats:s}}function ve(){try{const t=window.localStorage.getItem(L(z))||(e.activeExamKey==="finance"?window.localStorage.getItem(z):null);return N(t?JSON.parse(t):{})}catch{return N({})}}function Ie(){window.localStorage.setItem(L(z),JSON.stringify(e.progress))}function ke(t){e.wrongQuestionIds.includes(t)||(e.wrongQuestionIds=[...e.wrongQuestionIds,t],U())}function Ce(t){e.wrongQuestionIds.includes(t)&&(e.wrongQuestionIds=e.wrongQuestionIds.filter(n=>n!==t),U())}function Ae(){e.wrongQuestionIds=[],U(),e.playMode==="wrong"&&w()}function X(t){e.playMode=t,w()}function Ee(t){t!==e.activeExamKey&&p.some(n=>n.key===t)&&(e.activeExamKey=t,e.activeBankKey=se(t),fe(),e.loading=!0,e.error="",e.allQuestions=[],e.questions=[],e.selectedCategories=[],e.playMode="all",e.filterExpanded=!0,oe(),u(),ce())}function Qe(t){const n=M().map(r=>r.key);t!==g&&!n.includes(t)||t!==e.activeBankKey&&(e.activeBankKey=t,ge(),e.selectedCategories=[],e.playMode="all",w())}function xe(t){R[t]&&(e.questionSelectionMode=t,e.started||u())}function ie(t){if(e.questionSelectionMode!=="unansweredOnly")return t.length;const n=new Set(e.progress.answeredQuestionIds);return t.filter(r=>!n.has(r.id)).length}function Z(t){const n=ie(_()),r=Y(n);if(r.length===0)return;const s=re(n),o=Math.max(r.indexOf(s),0),a=t==="increase"?Math.min(o+1,r.length-1):Math.max(o-1,0);e.questionLimit=r[a]}function qe(){return e.selectedCategories.length===0?v:e.selectedCategories.length===1?e.selectedCategories[0]:`已選 ${e.selectedCategories.length} 類`}function Me(){return e.playMode==="wrong"?"歷史錯題":"全部題庫"}function Le(){return q().label}function D(){return R[e.questionSelectionMode].label}function le(t){return t.answer_type==="複選"||t.answer.length>1}function Ke(t){const n=F();e.submitted||(le(n)?e.selectedAnswers=e.selectedAnswers.includes(t)?e.selectedAnswers.filter(r=>r!==t):[...e.selectedAnswers,t].sort((r,s)=>r-s):e.selectedAnswers=[t],u())}function _e(t,n){return t.length!==n.length?!1:t.every((r,s)=>r===n[s])}function E(t,n){return t.includes(n)?t:[...t,n]}function ee(t,n){return t.filter(r=>r!==n)}function Oe(t,n){const r=t.id,s=h(t),o=e.progress.categoryStats[s]||ae();e.progress={answeredQuestionIds:E(e.progress.answeredQuestionIds,r),categoryStats:{...e.progress.categoryStats,[s]:{answeredIds:E(o.answeredIds,r),correctIds:n?E(o.correctIds,r):ee(o.correctIds,r),wrongIds:n?ee(o.wrongIds,r):E(o.wrongIds,r)}}},Ie()}function Be(){if(e.submitted||e.selectedAnswers.length===0)return;const t=F(),n=[...e.selectedAnswers].sort((s,o)=>s-o),r=_e(n,t.answer);e.submitted=!0,Oe(t,r),r?(e.score+=10,e.correctCount+=1,Ce(t.id)):(e.wrongCount+=1,ke(t.id)),u()}function Te(){if(e.currentIndex>=e.questions.length-1){e.finished=!0,u();return}e.currentIndex+=1,e.selectedAnswers=[],e.submitted=!1,u()}function Pe(t){const n=new Set(e.progress.answeredQuestionIds),r=new Map;return t.forEach(s=>{const o=h(s),a=r.get(o)||[];a.push(s),r.set(o,a)}),[...r.entries()].map(([s,o])=>{const a=Q(o.filter(i=>!n.has(i.id))),c=Q(o.filter(i=>n.has(i.id)));return e.questionSelectionMode==="all"?{category:s,primary:Q(o),secondary:[]}:e.questionSelectionMode==="unansweredOnly"?{category:s,primary:a,secondary:[]}:{category:s,primary:a,secondary:c}})}function je(t){const n=Pe(t).map(a=>({...a,picked:0,totalAvailable:a.primary.length+a.secondary.length})).filter(a=>a.totalAvailable>0),r=n.reduce((a,c)=>a+c.totalAvailable,0),s=we(r),o=[];for(;o.length<s;){const a=ye(n).sort((i,f)=>i.picked-f.picked);let c=!1;if(a.forEach(i=>{if(o.length>=s)return;const f=i.primary.shift()||i.secondary.shift();f&&(i.picked+=1,o.push(f),c=!0)}),!c)break}return Q(o)}function G(){const t=je(_());t.length!==0&&(e.questions=t,e.started=!0,e.finished=!1,e.currentIndex=0,e.selectedAnswers=[],e.submitted=!1,e.score=0,e.correctCount=0,e.wrongCount=0,u())}function Ne(){G()}function He(){e.returningHome||(e.returningHome=!0,u(),window.setTimeout(()=>{e.returningHome=!1,e.started=!1,e.finished=!1,e.currentIndex=0,e.selectedAnswers=[],e.submitted=!1,e.score=0,e.correctCount=0,e.wrongCount=0,u()},420))}function d(t){return String(t).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function ze(){return K().reduce((t,n)=>{const r=h(n);return t[r]=(t[r]||0)+1,t},{})}function Ge(t,n){const r=e.progress.categoryStats[t]||ae(),s=new Set(K().filter(i=>h(i)===t).map(i=>i.id)),o=r.answeredIds.filter(i=>s.has(i)).length,a=r.correctIds.filter(i=>s.has(i)).length,c=n[t]||0;return{category:t,totalCount:c,answeredCount:o,unansweredCount:Math.max(c-o,0),progressPercent:c===0?0:Math.round(o/c*100),accuracyPercent:o===0?0:Math.round(a/o*100)}}function Re(){const t=K(),n=new Set(t.map(o=>o.id)),r=e.progress.answeredQuestionIds.filter(o=>n.has(o)).length,s=t.length;return{answeredCount:r,totalCount:s,progressPercent:s===0?0:Math.round(r/s*100)}}function Fe(){const t=_(),n=ie(t),r=t.length,s=e.wrongQuestionIds.length,o=re(n),a=Y(n),c=a.length===0||o===a[0],i=a.length===0||o===a[a.length-1],f=Re(),k=ze();`${D()}`;const O=p.map(l=>`
      <button
        class="exam-toggle-btn ${e.activeExamKey===l.key?"is-active":""}"
        data-action="set-exam"
        data-exam-key="${l.key}"
        aria-pressed="${e.activeExamKey===l.key?"true":"false"}"
      >${d(l.shortLabel)}</button>
    `).join(""),C=I()?`
      <div class="bank-toggle" role="group" aria-label="ESGF 題庫範圍">
        <button
          class="bank-toggle-btn ${e.activeBankKey===g?"is-active":""}"
          data-action="set-bank"
          data-bank-key="${g}"
          aria-pressed="${e.activeBankKey===g?"true":"false"}"
        >全部</button>
        ${M().map(l=>`
              <button
                class="bank-toggle-btn ${e.activeBankKey===l.key?"is-active":""}"
                data-action="set-bank"
                data-bank-key="${l.key}"
                aria-pressed="${e.activeBankKey===l.key?"true":"false"}"
              >${d(l.label)}</button>
            `).join("")}
      </div>
    `:"",A=`
    <label
      class="filter-row ${e.selectedCategories.length===0?"is-active":""}"
      style="--category-progress: ${f.progressPercent}%"
    >
      <input
        type="checkbox"
        data-action="filter"
        data-category="${v}"
        ${e.selectedCategories.length===0?"checked":""}
      />
      <span class="filter-box"></span>
      <span class="filter-label">${v}</span>
      <span class="filter-meta">${f.progressPercent}%</span>
    </label>
    ${V().map(l=>{const b=Ge(l,k);return`
          <label
            class="filter-row ${e.selectedCategories.includes(l)?"is-active":""}"
            style="--category-progress: ${b.progressPercent}%"
          >
            <input
              type="checkbox"
              data-action="filter"
              data-category="${d(l)}"
              ${e.selectedCategories.includes(l)?"checked":""}
            />
            <span class="filter-box"></span>
            <span class="filter-label">${d(l)}</span>
            <span class="filter-meta">${b.progressPercent}%</span>
          </label>
        `}).join("")}
  `,B=e.filterExpanded?"is-expanded":"is-collapsed",T=e.filterExpanded?"收合分類":"展開分類",P=V().length<=1?"is-compact":"";x.innerHTML=`
    <main class="shell">
      <section class="hero-card">
        <p class="eyebrow">Mobile Quiz Game</p>
        <div class="top-utility">
          <div class="exam-toggle" role="group" aria-label="題庫切換">
            ${O}
          </div>
          ${C}
          <button
            class="btn btn-ghost btn-compact ${e.playMode==="wrong"?"is-mode-active":""}"
            data-action="toggle-wrong-mode"
            ${s===0&&e.playMode!=="wrong"?"disabled":""}
          >
            ${e.playMode==="wrong"?"目前：歷史錯題":`歷史錯題 ${s} 題`}
          </button>
          ${e.playMode==="wrong"?'<button class="btn btn-ghost btn-compact" data-action="set-mode" data-mode="all">回全部題庫</button>':""}
          <button class="btn btn-ghost btn-compact" data-action="clear-wrong" ${s===0?"disabled":""}>清空錯題</button>
          <div class="mode-toggle" role="group" aria-label="出題模式切換">
            ${Object.entries(R).map(([l,b])=>`
                  <button
                    class="mode-toggle-btn ${e.questionSelectionMode===l?"is-active":""}"
                    data-action="set-question-mode"
                    data-question-mode="${l}"
                    aria-pressed="${e.questionSelectionMode===l?"true":"false"}"
                    title="${d(b.label)}"
                  >${d(l==="all"?"全":l==="preferUnanswered"?"優":"未")}</button>
                `).join("")}
          </div>
        </div>
        <h1 class="home-title">${s>25?"禎禎要複習":"禎禎我最棒"}</h1>
        <p class="hero-copy">
          目前題庫為「${d(Le())} · ${d(pe())}」。題目會依類別平均輪替出題。現在目前篩選範圍內可出 <strong>${n}</strong> 題，
          題庫總覽為 ${r} 題。
        </p>
        <section class="filter-panel ${B} ${P}">
          <div class="filter-head">
            <strong>題目分類</strong>
            <span>${d(Me())} · ${d(qe())} · ${n} 題可出</span>
          </div>
          <div class="filter-toolbar">
            <button class="btn btn-ghost btn-compact" data-action="toggle-filter-panel">${T}</button>
            <button class="btn btn-ghost btn-compact" data-action="clear-filters" ${e.selectedCategories.length===0?"disabled":""}>清除分類</button>
          </div>
          <div class="filter-list" role="group" aria-label="題目分類篩選">${A}</div>
        </section>
        <div class="hero-actions">
          <div class="question-limit-control">
            <span>本次題數</span>
            <div class="question-limit-stepper">
              <button
                class="stepper-btn"
                data-action="decrease-question-limit"
                ${e.loading||n===0||c?"disabled":""}
                aria-label="減少題數"
              >-</button>
              <strong>${o}</strong>
              <button
                class="stepper-btn"
                data-action="increase-question-limit"
                ${e.loading||n===0||i?"disabled":""}
                aria-label="增加題數"
              >+</button>
            </div>
          </div>
          <button class="btn btn-primary" data-action="start" ${e.loading||n===0?"disabled":""}>開始</button>
          <button class="btn btn-secondary" data-action="shuffle" ${e.loading||n===0?"disabled":""}>重抽</button>
        </div>
        <p class="status-text">
          ${e.loading?"題庫載入中...":e.error?d(e.error):n===0?"目前條件下沒有可出的題目，請切換分類或改用其他出題模式。":`已作答 ${f.answeredCount} / ${f.totalCount} 題（${f.progressPercent}%），目前模式為「${d(D())}」。`}
        </p>
      </section>
    </main>
  `}function Ye(){const t=e.questions.length,n=e.wrongQuestionIds.length,r=t===0?0:Math.round(e.correctCount/(e.correctCount+e.wrongCount||1)*100);x.innerHTML=`
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
            <strong>${r}%</strong>
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
  `}function Ue(){const t=F(),n=e.currentIndex+1,r=e.questions.length,s=t.answer,o=le(t),a=t.options.map((i,f)=>{const k=i.split(`
`).map(b=>b.trim()).filter(Boolean),O=k.length>1?"option-text bilingual":"option-text",C=e.selectedAnswers.includes(f),A=s.includes(f),B=e.submitted&&A,T=e.submitted&&C&&!A,P=B?"is-correct":T?"is-wrong":C?"is-selected":"",l=f+1;return`
        <button class="option-card ${P}" data-option-index="${f}">
          <span class="option-badge">${l}</span>
          <span class="${O}">
            ${k.map((b,ue)=>`<span class="${ue===0?"option-zh":"option-en"}">${d(b)}</span>`).join("")}
          </span>
        </button>
      `}).join(""),c=e.submitted?`正確答案：${s.map(i=>i+1).join("、")}`:o?"此題可複選":"此題為單選";x.innerHTML=`
    <main class="shell ${e.returningHome?"is-returning":""}">
      <section class="quiz-card">

        <div class="progress-meta">
          <span>${n} / ${r}</span>
          <span>${o?"複選題":"單選題"}</span>
        </div>
        <div class="progress-track">
          <span style="width: ${n/r*100}%"></span>
        </div>

        <article class="question-panel">
          <div class="question-tags">
            ${I()?`<span>${d(t.bankLabel)}</span>`:""}
            <span>${d(h(t))}</span>
            <span>${d(t.difficulty||"未分類")}</span>
          </div>
          <h2>${d(t.question).replaceAll(`
`,"<br />")}</h2>
          <p class="helper-text">${c}</p>
        </article>

        <section class="options-grid">
          ${a}
        </section>

        <footer class="action-bar">
          <button class="btn btn-ghost" data-action="home" ${e.returningHome?"disabled":""}>回首頁</button>
          <button class="btn btn-secondary" data-action="restart">重來</button>
          ${e.submitted?`<button class="btn btn-primary" data-action="next">${n===r?"看結果":"下一題"}</button>`:`<button class="btn btn-primary" data-action="submit" ${e.selectedAnswers.length===0?"disabled":""}>送出答案</button>`}
        </footer>
      </section>
    </main>
  `}function u(){if(!e.started){Fe();return}if(e.finished){Ye();return}Ue()}async function ce(){try{const t=q();e.wrongQuestionIds=Se(),e.progress=ve();const n=await Promise.all(t.banks.map(async r=>{const s=await fetch(`/fin_test/${r.file}`);if(!s.ok)throw new Error(`${r.label}載入失敗（${s.status}）`);const o=await s.json();return me(o,t,r)}));e.allQuestions=n.flat(),w(),e.error=e.questions.length===0?"題庫內容為空，請確認 JSON 格式。":""}catch(t){e.error=t instanceof Error?t.message:"題庫載入失敗"}finally{e.loading=!1,u()}}x.addEventListener("click",t=>{const n=t.target.closest("[data-action]"),r=t.target.closest("[data-option-index]");if(n){const s=n.dataset.action;if(s==="start")G();else if(s==="shuffle")Ne();else if(s==="filter"){const o=m();he(n.dataset.category||v),u(),y(o)}else if(s==="toggle-filter-panel"){const o=m();e.filterExpanded=!e.filterExpanded,u(),y(o)}else if(s==="clear-filters"){const o=m();$e(),u(),y(o)}else if(s==="set-mode"){const o=m();X(n.dataset.mode||"all"),u(),y(o)}else if(s==="toggle-wrong-mode"){const o=m();X(e.playMode==="wrong"?"all":"wrong"),u(),y(o)}else if(s==="clear-wrong"){const o=m();Ae(),u(),y(o)}else if(s==="set-exam")Ee(n.dataset.examKey||p[0].key);else if(s==="set-bank"){const o=m();Qe(n.dataset.bankKey||g),u(),y(o)}else if(s==="set-question-mode"){const o=m();xe(n.dataset.questionMode||"preferUnanswered"),u(),y(o)}else s==="submit"?Be():s==="next"?Te():s==="restart"?G():s==="home"?He():s==="decrease-question-limit"?(Z("decrease"),u()):s==="increase-question-limit"&&(Z("increase"),u());return}r&&Ke(Number(r.dataset.optionIndex))});u();ce();
