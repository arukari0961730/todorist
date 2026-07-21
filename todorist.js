import {
  tasks,
  loadTasks
} from "./js/data.js";

import {
  getCurrentView,
  setCurrentView,
  getCurrentDate,
  setCurrentDate,
  moveCurrentMonth,
  resetCurrentDate
} from "./js/appState.js";

import {
  setupNavigation
} from "./js/navigation.js";

import {
  setupFilterControls
} from "./js/filterControls.js";

import {
  setupDashboard
} from "./js/dashboard.js";

import {
  setupTaskForm
} from "./js/form.js";

import {
  setupModalOverlay,
  renderTaskDetail
} from "./js/modal.js";

import {
  setupViewRenderer,
  renderCurrentView,
  updateFilterSettings,
  getFilterSettings
} from "./js/viewRenderer.js";

let isApplicationInitialized =
  false;

function isValidDate(
  date
) {
  return (
    date instanceof Date &&
    !Number.isNaN(
      date.getTime()
    )
  );
}

function createMonthDate(
  date
) {
  if (!isValidDate(date)) {
    const today =
      new Date();

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
  }

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );
}

function safelyRun(
  callback,
  errorMessage
) {
  try {
    callback();
  } catch (error) {
    console.error(
      errorMessage,
      error
    );
  }
}

function handleTaskClick(
  task
) {
  if (
    !task ||
    typeof task !== "object"
  ) {
    console.error(
      "表示するタスクが不正です"
    );

    return;
  }

  renderTaskDetail(
    task,
    {
      onTaskChange:
        function () {
          renderCurrentView();
        },

      onDateChange:
        function (date) {
          if (!isValidDate(date)) {
            return;
          }

          setCurrentDate(
            createMonthDate(date)
          );
        }
    }
  );
}

function handleTaskDataChange() {
  renderCurrentView();
}

function handleCalendarDateClick(
  date
) {
  if (!isValidDate(date)) {
    return;
  }

  const selectedDate =
    createMonthDate(date);

  setCurrentDate(
    selectedDate
  );
}

function handleViewChange(
  viewName
) {
  setCurrentView(
    viewName
  );

  renderCurrentView();
}

function handlePreviousMonth() {
  moveCurrentMonth(-1);

  renderCurrentView();
}

function handleNextMonth() {
  moveCurrentMonth(1);

  renderCurrentView();
}

function handleToday() {
  resetCurrentDate();

  renderCurrentView();
}

function handleFilterChange(
  changedSettings
) {
  if (
    !changedSettings ||
    typeof changedSettings !==
      "object" ||
    Array.isArray(
      changedSettings
    )
  ) {
    return;
  }

  updateFilterSettings(
    changedSettings
  );
}

function handleDashboardFilter(
  changedSettings
) {
  if (
    !changedSettings ||
    typeof changedSettings !==
      "object" ||
    Array.isArray(
      changedSettings
    )
  ) {
    return;
  }

  const currentSettings =
    getFilterSettings();

  const nextSettings = {
    ...currentSettings,
    ...changedSettings
  };

  updateFilterSettings(
    nextSettings
  );

  setCurrentView(
    "list"
  );

  renderCurrentView();
}

function setupApplicationNavigation() {
  setupNavigation({
    onViewChange:
      handleViewChange,

    onPreviousMonth:
      handlePreviousMonth,

    onNextMonth:
      handleNextMonth,

    onToday:
      handleToday
  });
}

function setupApplicationFilters() {
  setupFilterControls(
    handleFilterChange
  );
}

function setupApplicationDashboard() {
  setupDashboard(
    handleDashboardFilter
  );
}

function setupApplicationForm() {
  setupTaskForm({
    onTaskAdded:
      handleTaskDataChange,

    onDateChange:
      function (date) {
        if (!isValidDate(date)) {
          return;
        }

        setCurrentDate(
          createMonthDate(date)
        );
      }
  });
}

function setupApplicationModal() {
  setupModalOverlay();
}

function setupApplicationRenderer() {
  setupViewRenderer({
    onTaskClick:
      handleTaskClick,

    onTaskChange:
      handleTaskDataChange,

    onDateClick:
      handleCalendarDateClick
  });
}

function validateApplicationState() {
  const currentView =
    getCurrentView();

  if (
    typeof currentView !==
    "string"
  ) {
    setCurrentView(
      "dashboard"
    );
  }

  const currentDate =
    getCurrentDate();

  if (
    !isValidDate(
      currentDate
    )
  ) {
    resetCurrentDate();
  }
}

function initializeApplication() {
  if (
    isApplicationInitialized
  ) {
    return;
  }

  isApplicationInitialized =
    true;

  safelyRun(
    function () {
      loadTasks();
    },
    "タスクデータの読み込みに失敗しました"
  );

  safelyRun(
    validateApplicationState,
    "アプリの状態確認に失敗しました"
  );

  safelyRun(
    setupApplicationRenderer,
    "画面描画処理の初期化に失敗しました"
  );

  safelyRun(
    setupApplicationNavigation,
    "ナビゲーションの初期化に失敗しました"
  );

  safelyRun(
    setupApplicationFilters,
    "フィルターの初期化に失敗しました"
  );

  safelyRun(
    setupApplicationDashboard,
    "ダッシュボードの初期化に失敗しました"
  );

  safelyRun(
    setupApplicationForm,
    "タスク追加フォームの初期化に失敗しました"
  );

  safelyRun(
    setupApplicationModal,
    "モーダルの初期化に失敗しました"
  );

  safelyRun(
    renderCurrentView,
    "初期画面の表示に失敗しました"
  );

  console.log(
    "タスク管理アプリを起動しました"
  );

  console.log(
    "読み込まれたタスク数：",
    tasks.length
  );
}

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initializeApplication,
    {
      once: true
    }
  );
} else {
  initializeApplication();
}