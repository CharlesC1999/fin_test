import "./style.css";

const state = {
  allQuestions: [],
  questions: [],
  started: false,
  finished: false,
  currentIndex: 0,
  selectedAnswers: [],
  submitted: false,
  score: 0,
  correctCount: 0,
  wrongCount: 0,
  loading: true,
  error: "",
  selectedCategories: [],
  returningHome: false,
  filterExpanded: true,
  wrongQuestionIds: [],
  playMode: "all",
};

const app = document.querySelector("#app");
const WRONG_STORAGE_KEY = "quiz_wrong_questions";

function normalizeQuestions(rawQuestions) {
  return rawQuestions
    .filter((item) => {
      const hasQuestion =
        typeof item.question === "string" && item.question.trim();
      const hasOptions = Array.isArray(item.options) && item.options.length > 1;
      const hasAnswers = Array.isArray(item.answer) && item.answer.length > 0;
      return hasQuestion && hasOptions && hasAnswers;
    })
    .map((item) => ({
      ...item,
      id: String(item.id),
      question: item.question.trim(),
      options: item.options.map((option) => String(option).trim()),
      answer: item.answer.map((value) => Number(value)).sort((a, b) => a - b),
      answer_type:
        item.answer_type || (item.answer.length > 1 ? "複選" : "單選"),
    }));
}

function currentQuestion() {
  return state.questions[state.currentIndex];
}

function categories() {
  const items = new Set();
  state.allQuestions.forEach((question) => {
    items.add(question.type || "未分類");
  });
  return [...items];
}

function filteredQuestions() {
  const categoryFiltered =
    state.selectedCategories.length === 0
      ? [...state.allQuestions]
      : state.allQuestions.filter((question) =>
          state.selectedCategories.includes(question.type || "未分類")
        );

  if (state.playMode !== "wrong") {
    return categoryFiltered;
  }

  if (state.wrongQuestionIds.length === 0) {
    return [];
  }

  const wrongIdSet = new Set(state.wrongQuestionIds);
  return categoryFiltered.filter((question) => wrongIdSet.has(question.id));
}

function shuffleQuestions(questions) {
  return [...questions]
    .map((question) => ({ question, random: Math.random() }))
    .sort((a, b) => a.random - b.random)
    .map((entry) => entry.question);
}

function resetRunState() {
  state.currentIndex = 0;
  state.selectedAnswers = [];
  state.submitted = false;
  state.finished = false;
  state.started = false;
  state.score = 0;
  state.correctCount = 0;
  state.wrongCount = 0;
}

function captureHomeScrollState() {
  return {
    windowY: window.scrollY,
    panelScrollTop:
      document.querySelector(".filter-list") instanceof HTMLElement
        ? document.querySelector(".filter-list").scrollTop
        : 0,
  };
}

function restoreHomeScrollState(scrollState) {
  if (!scrollState) return;

  window.scrollTo({ top: scrollState.windowY });
  const panel = document.querySelector(".filter-list");
  if (panel instanceof HTMLElement) {
    panel.scrollTop = scrollState.panelScrollTop;
  }
}

function syncFilteredQuestions() {
  state.questions = filteredQuestions();
  resetRunState();
}

function toggleCategory(category) {
  if (category === "全部") {
    state.selectedCategories = [];
    syncFilteredQuestions();
    return;
  }

  state.selectedCategories = state.selectedCategories.includes(category)
    ? state.selectedCategories.filter((item) => item !== category)
    : [...state.selectedCategories, category];

  syncFilteredQuestions();
}

function clearCategories() {
  state.selectedCategories = [];
  syncFilteredQuestions();
}

function loadWrongQuestionIds() {
  try {
    const saved = window.localStorage.getItem(WRONG_STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.map((value) => String(value)) : [];
  } catch {
    return [];
  }
}

function persistWrongQuestionIds() {
  window.localStorage.setItem(
    WRONG_STORAGE_KEY,
    JSON.stringify(state.wrongQuestionIds)
  );
}

function rememberWrongQuestion(questionId) {
  if (state.wrongQuestionIds.includes(questionId)) return;
  state.wrongQuestionIds = [...state.wrongQuestionIds, questionId];
  persistWrongQuestionIds();
}

function forgetWrongQuestion(questionId) {
  if (!state.wrongQuestionIds.includes(questionId)) return;
  state.wrongQuestionIds = state.wrongQuestionIds.filter(
    (id) => id !== questionId
  );
  persistWrongQuestionIds();
}

function clearWrongQuestions() {
  state.wrongQuestionIds = [];
  persistWrongQuestionIds();
  if (state.playMode === "wrong") {
    syncFilteredQuestions();
  }
}

function setPlayMode(mode) {
  state.playMode = mode;
  syncFilteredQuestions();
}

function selectedCategorySummary() {
  if (state.selectedCategories.length === 0) {
    return "全部";
  }

  if (state.selectedCategories.length === 1) {
    return state.selectedCategories[0];
  }

  return `已選 ${state.selectedCategories.length} 類`;
}

function modeLabel() {
  return state.playMode === "wrong" ? "歷史錯題" : "全部題庫";
}

function isMultiSelect(question) {
  return question.answer_type === "複選" || question.answer.length > 1;
}

function toggleAnswer(index) {
  const question = currentQuestion();
  if (state.submitted) return;

  if (isMultiSelect(question)) {
    state.selectedAnswers = state.selectedAnswers.includes(index)
      ? state.selectedAnswers.filter((value) => value !== index)
      : [...state.selectedAnswers, index].sort((a, b) => a - b);
  } else {
    state.selectedAnswers = [index];
  }

  render();
}

function arraysEqual(left, right) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function submitAnswer() {
  if (state.submitted || state.selectedAnswers.length === 0) return;

  const question = currentQuestion();
  const normalizedSelected = [...state.selectedAnswers].sort((a, b) => a - b);
  const isCorrect = arraysEqual(normalizedSelected, question.answer);

  state.submitted = true;
  if (isCorrect) {
    state.score += 10;
    state.correctCount += 1;
    forgetWrongQuestion(question.id);
  } else {
    state.wrongCount += 1;
    rememberWrongQuestion(question.id);
  }

  render();
}

function nextQuestion() {
  if (state.currentIndex >= state.questions.length - 1) {
    state.finished = true;
    render();
    return;
  }

  state.currentIndex += 1;
  state.selectedAnswers = [];
  state.submitted = false;
  render();
}

function restartGame() {
  const preparedQuestions = shuffleQuestions(filteredQuestions());
  if (preparedQuestions.length === 0) return;
  state.questions = preparedQuestions;
  state.started = true;
  state.finished = false;
  state.currentIndex = 0;
  state.selectedAnswers = [];
  state.submitted = false;
  state.score = 0;
  state.correctCount = 0;
  state.wrongCount = 0;
  render();
}

function shuffleGame() {
  restartGame();
}

function goHome() {
  if (state.returningHome) return;
  state.returningHome = true;
  render();

  window.setTimeout(() => {
    state.returningHome = false;
    state.started = false;
    state.finished = false;
    state.currentIndex = 0;
    state.selectedAnswers = [];
    state.submitted = false;
    state.score = 0;
    state.correctCount = 0;
    state.wrongCount = 0;
    render();
  }, 420);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderHome() {
  const total = state.questions.length;
  const wrongCount = state.wrongQuestionIds.length;
  const filtersMarkup = `
    <label class="filter-row ${
      state.selectedCategories.length === 0 ? "is-active" : ""
    }">
      <input
        type="checkbox"
        data-action="filter"
        data-category="全部"
        ${state.selectedCategories.length === 0 ? "checked" : ""}
      />
      <span class="filter-box"></span>
      <span class="filter-label">全部</span>
    </label>
    ${categories()
      .map(
        (category) => `
          <label class="filter-row ${
            state.selectedCategories.includes(category) ? "is-active" : ""
          }">
            <input
              type="checkbox"
              data-action="filter"
              data-category="${escapeHtml(category)}"
              ${state.selectedCategories.includes(category) ? "checked" : ""}
            />
            <span class="filter-box"></span>
            <span class="filter-label">${escapeHtml(category)}</span>
          </label>
        `
      )
      .join("")}
  `;

  const visibleClass = state.filterExpanded ? "is-expanded" : "is-collapsed";
  const toggleLabel = state.filterExpanded ? "收起分類" : "展開分類";

  app.innerHTML = `
    <main class="shell">
      <section class="hero-card">
        <p class="eyebrow">Mobile Quiz Game</p>
        <div class="top-utility">
          <button
            class="btn btn-ghost btn-compact ${
              state.playMode === "wrong" ? "is-mode-active" : ""
            }"
            data-action="toggle-wrong-mode"
            ${wrongCount === 0 && state.playMode !== "wrong" ? "disabled" : ""}
          >
            ${
              state.playMode === "wrong"
                ? "目前：歷史錯題"
                : `歷史錯題 ${wrongCount} 題`
            }
          </button>
          ${
            state.playMode === "wrong"
              ? `<button class="btn btn-ghost btn-compact" data-action="set-mode" data-mode="all">回全部題庫</button>`
              : ""
          }
          <button class="btn btn-ghost btn-compact" data-action="clear-wrong" ${
            wrongCount === 0 ? "disabled" : ""
          }>清空錯題</button>
        </div>
        <h1>題庫練習站</h1>
        <p class="hero-copy">
          以手機操作為主，支援單選、複選、即時判斷與分數累計。現在題庫共有
          <strong>${total}</strong> 題。
        </p>
        <section class="filter-panel ${visibleClass}">
          <div class="filter-head">
            <strong>題目分類</strong>
            <span>${escapeHtml(modeLabel())} · ${escapeHtml(
              selectedCategorySummary()
            )} · ${total} 題</span>
          </div>
          <div class="filter-toolbar">
            <button class="btn btn-ghost btn-compact" data-action="toggle-filter-panel">${toggleLabel}</button>
            <button class="btn btn-ghost btn-compact" data-action="clear-filters" ${
              state.selectedCategories.length === 0 ? "disabled" : ""
            }>清空選項</button>
          </div>
          <div class="filter-list" role="group" aria-label="題目分類篩選">${filtersMarkup}</div>
        </section>
        <div class="hero-actions">
          <button class="btn btn-primary" data-action="start" ${
            state.loading || total === 0 ? "disabled" : ""
          }>開始作答</button>
          <button class="btn btn-secondary" data-action="shuffle" ${
            state.loading || total === 0 ? "disabled" : ""
          }>重新抽題</button>
        </div>
        <p class="status-text">
          ${
            state.loading
              ? "題庫載入中..."
              : state.error
                ? escapeHtml(state.error)
                : `題庫已就緒，可直接開始。歷史錯題 ${wrongCount} 題。`
          }
        </p>
      </section>
    </main>
  `;
}

function renderResult() {
  const total = state.questions.length;
  const wrongCount = state.wrongQuestionIds.length;
  const accuracy =
    total === 0
      ? 0
      : Math.round(
          (state.correctCount / (state.correctCount + state.wrongCount || 1)) *
            100
        );

  app.innerHTML = `
    <main class="shell ${state.returningHome ? "is-returning" : ""}">
      <section class="hero-card result-card">
        <p class="eyebrow">Completed</p>
        <h1>本次作答完成</h1>
        <div class="score-ring">
          <span>${state.score}</span>
          <small>分</small>
        </div>
        <div class="result-grid">
          <article>
            <strong>${state.correctCount}</strong>
            <span>答對</span>
          </article>
          <article>
            <strong>${state.wrongCount}</strong>
            <span>答錯</span>
          </article>
          <article>
            <strong>${accuracy}%</strong>
            <span>正確率</span>
          </article>
          <article>
            <strong>${total}</strong>
            <span>總題數</span>
          </article>
        </div>
        <div class="hero-actions">
          <button class="btn btn-ghost" data-action="home">回到首頁</button>
          <button class="btn btn-primary" data-action="restart">重新挑戰</button>
          <button class="btn btn-secondary" data-action="shuffle">重洗題目</button>
        </div>
        <p class="status-text">歷史錯題累積：${wrongCount} 題</p>
      </section>
    </main>
  `;
}

function renderQuiz() {
  const question = currentQuestion();
  const progress = state.currentIndex + 1;
  const total = state.questions.length;
  const correctAnswers = question.answer;
  const multi = isMultiSelect(question);

  const optionsMarkup = question.options
    .map((option, index) => {
      const lines = option
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const labelClass =
        lines.length > 1 ? "option-text bilingual" : "option-text";
      const isSelected = state.selectedAnswers.includes(index);
      const isCorrect = correctAnswers.includes(index);
      const showCorrect = state.submitted && isCorrect;
      const showWrong = state.submitted && isSelected && !isCorrect;
      const stateClass = showCorrect
        ? "is-correct"
        : showWrong
          ? "is-wrong"
          : isSelected
            ? "is-selected"
            : "";
      const badge = index + 1;

      return `
        <button class="option-card ${stateClass}" data-option-index="${index}">
          <span class="option-badge">${badge}</span>
          <span class="${labelClass}">
            ${lines
              .map(
                (line, lineIndex) =>
                  `<span class="${
                    lineIndex === 0 ? "option-zh" : "option-en"
                  }">${escapeHtml(line)}</span>`
              )
              .join("")}
          </span>
        </button>
      `;
    })
    .join("");

  const answerText = state.submitted
    ? `正確答案：${correctAnswers.map((value) => value + 1).join("、")}`
    : multi
      ? "此題可複選"
      : "此題為單選";

  app.innerHTML = `
    <main class="shell ${state.returningHome ? "is-returning" : ""}">
      <section class="quiz-card">
        <header class="quiz-topbar">
          <div>
            <p class="eyebrow">Question ${progress}</p>
            <h1>手機答題模式</h1>
          </div>
          <div class="score-pill">${state.score} 分</div>
        </header>

        <div class="progress-meta">
          <span>${progress} / ${total}</span>
          <span>${multi ? "複選題" : "單選題"}</span>
        </div>
        <div class="progress-track">
          <span style="width: ${(progress / total) * 100}%"></span>
        </div>

        <article class="question-panel">
          <div class="question-tags">
            <span>${escapeHtml(question.type || "一般題")}</span>
            <span>${escapeHtml(question.difficulty || "未分類")}</span>
          </div>
          <h2>${escapeHtml(question.question).replaceAll("\n", "<br />")}</h2>
          <p class="helper-text">${answerText}</p>
        </article>

        <section class="options-grid">
          ${optionsMarkup}
        </section>

        <footer class="action-bar">
          <button class="btn btn-ghost" data-action="home" ${
            state.returningHome ? "disabled" : ""
          }>回到首頁</button>
          <button class="btn btn-secondary" data-action="restart">重來</button>
          ${
            state.submitted
              ? `<button class="btn btn-primary" data-action="next">${
                  progress === total ? "看結果" : "下一題"
                }</button>`
              : `<button class="btn btn-primary" data-action="submit" ${
                  state.selectedAnswers.length === 0 ? "disabled" : ""
                }>送出答案</button>`
          }
        </footer>
      </section>
    </main>
  `;
}

function render() {
  if (!state.started) {
    renderHome();
    return;
  }

  if (state.finished) {
    renderResult();
    return;
  }

  renderQuiz();
}

async function loadQuestions() {
  try {
    state.wrongQuestionIds = loadWrongQuestionIds();
    const response = await fetch(`${import.meta.env.BASE_URL}data_table.json`);
    if (!response.ok) {
      throw new Error(`題庫載入失敗（${response.status}）`);
    }

    const rawQuestions = await response.json();
    state.allQuestions = normalizeQuestions(rawQuestions);
    syncFilteredQuestions();
    state.error =
      state.questions.length === 0 ? "題庫內容為空，請確認 JSON 格式。" : "";
  } catch (error) {
    state.error = error instanceof Error ? error.message : "題庫載入失敗";
  } finally {
    state.loading = false;
    render();
  }
}

app.addEventListener("click", (event) => {
  const actionTarget = event.target.closest("[data-action]");
  const optionTarget = event.target.closest("[data-option-index]");

  if (actionTarget) {
    const action = actionTarget.dataset.action;
    if (action === "start") {
      restartGame();
    } else if (action === "shuffle") {
      shuffleGame();
    } else if (action === "filter") {
      const scrollState = captureHomeScrollState();
      toggleCategory(actionTarget.dataset.category || "全部");
      render();
      restoreHomeScrollState(scrollState);
    } else if (action === "toggle-filter-panel") {
      const scrollState = captureHomeScrollState();
      state.filterExpanded = !state.filterExpanded;
      render();
      restoreHomeScrollState(scrollState);
    } else if (action === "clear-filters") {
      const scrollState = captureHomeScrollState();
      clearCategories();
      render();
      restoreHomeScrollState(scrollState);
    } else if (action === "set-mode") {
      const scrollState = captureHomeScrollState();
      setPlayMode(actionTarget.dataset.mode || "all");
      render();
      restoreHomeScrollState(scrollState);
    } else if (action === "toggle-wrong-mode") {
      const scrollState = captureHomeScrollState();
      setPlayMode(state.playMode === "wrong" ? "all" : "wrong");
      render();
      restoreHomeScrollState(scrollState);
    } else if (action === "clear-wrong") {
      const scrollState = captureHomeScrollState();
      clearWrongQuestions();
      render();
      restoreHomeScrollState(scrollState);
    } else if (action === "submit") {
      submitAnswer();
    } else if (action === "next") {
      nextQuestion();
    } else if (action === "restart") {
      restartGame();
    } else if (action === "home") {
      goHome();
    }
    return;
  }

  if (optionTarget) {
    toggleAnswer(Number(optionTarget.dataset.optionIndex));
  }
});

render();
loadQuestions();
