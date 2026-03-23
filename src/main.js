import "./style.css";

const DEFAULT_CATEGORY = "未分類";
const ALL_CATEGORY = "全部";
const WRONG_STORAGE_KEY = "quiz_wrong_questions";
const PROGRESS_STORAGE_KEY = "quiz_progress";

const QUESTION_SELECTION_MODES = {
  all: {
    label: "全部隨機",
    helper: "平均分配各類別，已作答題目也會重新出現。",
  },
  preferUnanswered: {
    label: "優先未作答",
    helper: "先出沒做過的題目，不夠時才補已作答題目。",
  },
  unansweredOnly: {
    label: "只出未作答",
    helper: "只抽沒做過的題目，適合用來刷完整體進度。",
  },
};

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
  questionLimit: 20,
  questionSelectionMode: "preferUnanswered",
  progress: {
    answeredQuestionIds: [],
    categoryStats: {},
  },
};

const app = document.querySelector("#app");

function uniqueStringList(values) {
  return [
    ...new Set(
      (Array.isArray(values) ? values : []).map((value) => String(value))
    ),
  ];
}

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
      type: String(item.type || DEFAULT_CATEGORY).trim() || DEFAULT_CATEGORY,
      difficulty: String(item.difficulty || "未分類").trim() || "未分類",
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

function questionCategory(question) {
  return question?.type || DEFAULT_CATEGORY;
}

function categories() {
  const items = new Set();
  state.allQuestions.forEach((question) => {
    items.add(questionCategory(question));
  });
  return [...items].sort((left, right) => left.localeCompare(right, "zh-Hant"));
}

function filteredQuestions() {
  const categoryFiltered =
    state.selectedCategories.length === 0
      ? [...state.allQuestions]
      : state.allQuestions.filter((question) =>
          state.selectedCategories.includes(questionCategory(question))
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

function shuffleItems(items) {
  return [...items]
    .map((item) => ({ item, random: Math.random() }))
    .sort((a, b) => a.random - b.random)
    .map((entry) => entry.item);
}

function questionLimitSteps(total) {
  if (total <= 0) return [];
  if (total <= 5) return [total];

  const steps = [];
  for (let value = 5; value < total; value += 5) {
    steps.push(value);
  }

  if (steps[steps.length - 1] !== total) {
    steps.push(total);
  }

  return steps;
}

function effectiveQuestionLimit(total) {
  if (state.questionLimit === "all") {
    return total;
  }

  return Math.min(state.questionLimit, total);
}

function currentQuestionLimitValue(total) {
  const steps = questionLimitSteps(total);
  if (steps.length === 0) return 0;
  if (state.questionLimit === "all") return steps[steps.length - 1];
  if (steps.includes(state.questionLimit)) return state.questionLimit;

  return (
    steps.find((value) => value >= state.questionLimit) ??
    steps[steps.length - 1]
  );
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
  if (category === ALL_CATEGORY) {
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
    return uniqueStringList(parsed);
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

function emptyCategoryProgress() {
  return {
    answeredIds: [],
    correctIds: [],
    wrongIds: [],
  };
}

function normalizeProgress(progress) {
  const raw = typeof progress === "object" && progress !== null ? progress : {};
  const rawCategoryStats =
    typeof raw.categoryStats === "object" && raw.categoryStats !== null
      ? raw.categoryStats
      : {};

  const categoryStats = Object.fromEntries(
    Object.entries(rawCategoryStats).map(([category, stats]) => [
      category,
      {
        answeredIds: uniqueStringList(stats?.answeredIds),
        correctIds: uniqueStringList(stats?.correctIds),
        wrongIds: uniqueStringList(stats?.wrongIds),
      },
    ])
  );

  return {
    answeredQuestionIds: uniqueStringList(raw.answeredQuestionIds),
    categoryStats,
  };
}

function loadProgress() {
  try {
    const saved = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!saved) {
      return normalizeProgress({});
    }

    return normalizeProgress(JSON.parse(saved));
  } catch {
    return normalizeProgress({});
  }
}

function persistProgress() {
  window.localStorage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify(state.progress)
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

function setQuestionSelectionMode(mode) {
  if (!QUESTION_SELECTION_MODES[mode]) return;
  state.questionSelectionMode = mode;
  if (!state.started) {
    render();
  }
}

function cycleQuestionSelectionMode() {
  const modes = Object.keys(QUESTION_SELECTION_MODES);
  const currentIndex = modes.indexOf(state.questionSelectionMode);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % modes.length : 0;
  setQuestionSelectionMode(modes[nextIndex]);
}

function availableQuestionCountForMode(questions) {
  if (state.questionSelectionMode !== "unansweredOnly") {
    return questions.length;
  }

  const answeredIds = new Set(state.progress.answeredQuestionIds);
  return questions.filter((question) => !answeredIds.has(question.id)).length;
}

function changeQuestionLimit(direction) {
  const total = availableQuestionCountForMode(filteredQuestions());
  const steps = questionLimitSteps(total);
  if (steps.length === 0) return;

  const current = currentQuestionLimitValue(total);
  const currentIndex = Math.max(steps.indexOf(current), 0);
  const nextIndex =
    direction === "increase"
      ? Math.min(currentIndex + 1, steps.length - 1)
      : Math.max(currentIndex - 1, 0);

  state.questionLimit = steps[nextIndex];
}

function selectedCategorySummary() {
  if (state.selectedCategories.length === 0) {
    return ALL_CATEGORY;
  }

  if (state.selectedCategories.length === 1) {
    return state.selectedCategories[0];
  }

  return `已選 ${state.selectedCategories.length} 類`;
}

function modeLabel() {
  return state.playMode === "wrong" ? "歷史錯題" : "全部題庫";
}

function selectionModeLabel() {
  return QUESTION_SELECTION_MODES[state.questionSelectionMode].label;
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

function upsertId(list, value) {
  return list.includes(value) ? list : [...list, value];
}

function removeId(list, value) {
  return list.filter((item) => item !== value);
}

function recordQuestionResult(question, isCorrect) {
  const questionId = question.id;
  const category = questionCategory(question);
  const categoryProgress =
    state.progress.categoryStats[category] || emptyCategoryProgress();

  state.progress = {
    answeredQuestionIds: upsertId(
      state.progress.answeredQuestionIds,
      questionId
    ),
    categoryStats: {
      ...state.progress.categoryStats,
      [category]: {
        answeredIds: upsertId(categoryProgress.answeredIds, questionId),
        correctIds: isCorrect
          ? upsertId(categoryProgress.correctIds, questionId)
          : removeId(categoryProgress.correctIds, questionId),
        wrongIds: isCorrect
          ? removeId(categoryProgress.wrongIds, questionId)
          : upsertId(categoryProgress.wrongIds, questionId),
      },
    },
  };

  persistProgress();
}

function submitAnswer() {
  if (state.submitted || state.selectedAnswers.length === 0) return;

  const question = currentQuestion();
  const normalizedSelected = [...state.selectedAnswers].sort((a, b) => a - b);
  const isCorrect = arraysEqual(normalizedSelected, question.answer);

  state.submitted = true;
  recordQuestionResult(question, isCorrect);
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

function buildCategoryBuckets(questions) {
  const answeredIds = new Set(state.progress.answeredQuestionIds);
  const groups = new Map();

  questions.forEach((question) => {
    const category = questionCategory(question);
    const bucket = groups.get(category) || [];
    bucket.push(question);
    groups.set(category, bucket);
  });

  return [...groups.entries()].map(([category, items]) => {
    const unanswered = shuffleQuestions(
      items.filter((question) => !answeredIds.has(question.id))
    );
    const answered = shuffleQuestions(
      items.filter((question) => answeredIds.has(question.id))
    );

    if (state.questionSelectionMode === "all") {
      return {
        category,
        primary: shuffleQuestions(items),
        secondary: [],
      };
    }

    if (state.questionSelectionMode === "unansweredOnly") {
      return {
        category,
        primary: unanswered,
        secondary: [],
      };
    }

    return {
      category,
      primary: unanswered,
      secondary: answered,
    };
  });
}

function selectBalancedQuestions(questions) {
  const buckets = buildCategoryBuckets(questions)
    .map((bucket) => ({
      ...bucket,
      picked: 0,
      totalAvailable: bucket.primary.length + bucket.secondary.length,
    }))
    .filter((bucket) => bucket.totalAvailable > 0);

  const totalAvailable = buckets.reduce(
    (sum, bucket) => sum + bucket.totalAvailable,
    0
  );
  const targetCount = effectiveQuestionLimit(totalAvailable);
  const selected = [];

  while (selected.length < targetCount) {
    const roundBuckets = shuffleItems(buckets).sort(
      (left, right) => left.picked - right.picked
    );
    let pickedAny = false;

    roundBuckets.forEach((bucket) => {
      if (selected.length >= targetCount) return;

      const nextQuestion = bucket.primary.shift() || bucket.secondary.shift();
      if (!nextQuestion) return;

      bucket.picked += 1;
      selected.push(nextQuestion);
      pickedAny = true;
    });

    if (!pickedAny) {
      break;
    }
  }

  return shuffleQuestions(selected);
}

function restartGame() {
  const preparedQuestions = selectBalancedQuestions(filteredQuestions());
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

function categoryTotalsMap() {
  return state.allQuestions.reduce((totals, question) => {
    const category = questionCategory(question);
    totals[category] = (totals[category] || 0) + 1;
    return totals;
  }, {});
}

function categoryProgress(category, totals) {
  const stats =
    state.progress.categoryStats[category] || emptyCategoryProgress();
  const answeredCount = stats.answeredIds.length;
  const correctCount = stats.correctIds.length;
  const totalCount = totals[category] || 0;

  return {
    category,
    totalCount,
    answeredCount,
    unansweredCount: Math.max(totalCount - answeredCount, 0),
    progressPercent:
      totalCount === 0 ? 0 : Math.round((answeredCount / totalCount) * 100),
    accuracyPercent:
      answeredCount === 0
        ? 0
        : Math.round((correctCount / answeredCount) * 100),
  };
}

function overallProgressSummary() {
  const answeredCount = state.progress.answeredQuestionIds.length;
  const totalCount = state.allQuestions.length;

  return {
    answeredCount,
    totalCount,
    progressPercent:
      totalCount === 0 ? 0 : Math.round((answeredCount / totalCount) * 100),
  };
}

function renderHome() {
  const filteredPool = filteredQuestions();
  const total = availableQuestionCountForMode(filteredPool);
  const totalInCurrentView = filteredPool.length;
  const wrongCount = state.wrongQuestionIds.length;
  const selectedLimit = currentQuestionLimitValue(total);
  const limitSteps = questionLimitSteps(total);
  const isMinLimit = limitSteps.length === 0 || selectedLimit === limitSteps[0];
  const isMaxLimit =
    limitSteps.length === 0 ||
    selectedLimit === limitSteps[limitSteps.length - 1];
  const progressSummary = overallProgressSummary();
  const categoryTotals = categoryTotalsMap();
  const modeButtonLabel = `出題：${selectionModeLabel()}`;

  const filtersMarkup = `
    <label
      class="filter-row ${
        state.selectedCategories.length === 0 ? "is-active" : ""
      }"
      style="--category-progress: ${progressSummary.progressPercent}%"
    >
      <input
        type="checkbox"
        data-action="filter"
        data-category="${ALL_CATEGORY}"
        ${state.selectedCategories.length === 0 ? "checked" : ""}
      />
      <span class="filter-box"></span>
      <span class="filter-label">${ALL_CATEGORY}</span>
      <span class="filter-meta">${progressSummary.progressPercent}%</span>
    </label>
    ${categories()
      .map((category) => {
        const item = categoryProgress(category, categoryTotals);
        return `
          <label
            class="filter-row ${
              state.selectedCategories.includes(category) ? "is-active" : ""
            }"
            style="--category-progress: ${item.progressPercent}%"
          >
            <input
              type="checkbox"
              data-action="filter"
              data-category="${escapeHtml(category)}"
              ${state.selectedCategories.includes(category) ? "checked" : ""}
            />
            <span class="filter-box"></span>
            <span class="filter-label">${escapeHtml(category)}</span>
            <span class="filter-meta">${item.progressPercent}%</span>
          </label>
        `;
      })
      .join("")}
  `;

  const visibleClass = state.filterExpanded ? "is-expanded" : "is-collapsed";
  const toggleLabel = state.filterExpanded ? "收合分類" : "展開分類";

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
              ? '<button class="btn btn-ghost btn-compact" data-action="set-mode" data-mode="all">回全部題庫</button>'
              : ""
          }
          <button class="btn btn-ghost btn-compact" data-action="clear-wrong" ${
            wrongCount === 0 ? "disabled" : ""
          }>清空錯題</button>
          <div class="mode-toggle" role="group" aria-label="出題模式切換">
            ${Object.entries(QUESTION_SELECTION_MODES)
              .map(
                ([mode, config]) => `
                  <button
                    class="mode-toggle-btn ${
                      state.questionSelectionMode === mode ? "is-active" : ""
                    }"
                    data-action="set-question-mode"
                    data-question-mode="${mode}"
                    aria-pressed="${
                      state.questionSelectionMode === mode ? "true" : "false"
                    }"
                    title="${escapeHtml(config.label)}"
                  >${escapeHtml(
                    mode === "all"
                      ? "全"
                      : mode === "preferUnanswered"
                        ? "優"
                        : "未"
                  )}</button>
                `
              )
              .join("")}
          </div>
        </div>
        <h1 class="home-title">${
          wrongCount > 25 ? "禎禎要複習" : "禎禎我最棒"
        }</h1>
        <p class="hero-copy">
          題目會依類別平均輪替出題。現在目前篩選範圍內可出 <strong>${total}</strong> 題，
          題庫總覽為 ${totalInCurrentView} 題。
        </p>
        <section class="filter-panel ${visibleClass}">
          <div class="filter-head">
            <strong>題目分類</strong>
            <span>${escapeHtml(modeLabel())} · ${escapeHtml(
              selectedCategorySummary()
            )} · ${total} 題可出</span>
          </div>
          <div class="filter-toolbar">
            <button class="btn btn-ghost btn-compact" data-action="toggle-filter-panel">${toggleLabel}</button>
            <button class="btn btn-ghost btn-compact" data-action="clear-filters" ${
              state.selectedCategories.length === 0 ? "disabled" : ""
            }>清除分類</button>
          </div>
          <div class="filter-list" role="group" aria-label="題目分類篩選">${filtersMarkup}</div>
        </section>
        <div class="hero-actions">
          <div class="question-limit-control">
            <span>本次題數</span>
            <div class="question-limit-stepper">
              <button
                class="stepper-btn"
                data-action="decrease-question-limit"
                ${state.loading || total === 0 || isMinLimit ? "disabled" : ""}
                aria-label="減少題數"
              >-</button>
              <strong>${selectedLimit}</strong>
              <button
                class="stepper-btn"
                data-action="increase-question-limit"
                ${state.loading || total === 0 || isMaxLimit ? "disabled" : ""}
                aria-label="增加題數"
              >+</button>
            </div>
          </div>
          <button class="btn btn-primary" data-action="start" ${
            state.loading || total === 0 ? "disabled" : ""
          }>開始</button>
          <button class="btn btn-secondary" data-action="shuffle" ${
            state.loading || total === 0 ? "disabled" : ""
          }>重抽</button>
        </div>
        <p class="status-text">
          ${
            state.loading
              ? "題庫載入中..."
              : state.error
                ? escapeHtml(state.error)
                : total === 0
                  ? "目前條件下沒有可出的題目，請切換分類或改用其他出題模式。"
                  : `已作答 ${progressSummary.answeredCount} / ${
                      progressSummary.totalCount
                    } 題（${
                      progressSummary.progressPercent
                    }%），目前模式為「${escapeHtml(selectionModeLabel())}」。`
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
        <h1>本次練習完成</h1>
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
          <button class="btn btn-ghost" data-action="home">回首頁</button>
          <button class="btn btn-primary" data-action="restart">再做一次</button>
          <button class="btn btn-secondary" data-action="shuffle">重抽題目</button>
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

        <div class="progress-meta">
          <span>${progress} / ${total}</span>
          <span>${multi ? "複選題" : "單選題"}</span>
        </div>
        <div class="progress-track">
          <span style="width: ${(progress / total) * 100}%"></span>
        </div>

        <article class="question-panel">
          <div class="question-tags">
            <span>${escapeHtml(questionCategory(question))}</span>
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
          }>回首頁</button>
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
    state.progress = loadProgress();

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
      toggleCategory(actionTarget.dataset.category || ALL_CATEGORY);
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
    } else if (action === "set-question-mode") {
      const scrollState = captureHomeScrollState();
      setQuestionSelectionMode(
        actionTarget.dataset.questionMode || "preferUnanswered"
      );
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
    } else if (action === "decrease-question-limit") {
      changeQuestionLimit("decrease");
      render();
    } else if (action === "increase-question-limit") {
      changeQuestionLimit("increase");
      render();
    }
    return;
  }

  if (optionTarget) {
    toggleAnswer(Number(optionTarget.dataset.optionIndex));
  }
});

render();
loadQuestions();
