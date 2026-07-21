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

function isValidDate(date) {
  return (
    date instanceof Date &&
    !Number.isNaN(date.getTime())
  );
}

function createMonthDate(date) {
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

function handleTaskClick(task) {
  if (
    !task ||
    typeof task !== "object"
  ) {
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

          renderCurrentView();
        }
    }
  );
}

function handleTaskDataChange() {
  renderCurrentView();
}

function handleCalendarDateClick(date) {
  if (!isValidDate(date)) {
    return;
  }

  setCurrentDate(
    createMonthDate(date)
  );
}

function handleViewChange(viewName) {
  const changed =
    setCurrentView(viewName);

  if (!changed) {
    return;
  }

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
    Array.isArray(changedSettings)
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
    Array.isArray(changedSettings)
  ) {
    return;
  }

  setCurrentView(
    "list"
  );

  updateFilterSettings({
    ...getFilterSettings(),
    ...changedSettings
  });
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

function validateApplicationState() {
  const allowedViews = [
    "calendar",
    "list",
    "gantt",
    "board"
  ];

  if (
    !allowedViews.includes(
      getCurrentView()
    )
  ) {
    setCurrentView(
      "calendar"
    );
  }

  if (
    !isValidDate(
      getCurrentDate()
    )
  ) {
    resetCurrentDate();
  }
}

function initializeApplication() {
  if (isApplicationInitialized) {
    return;
  }

  isApplicationInitialized =
    true;

  /*
    data.jsの末尾でもloadTasksが実行されているが、
    配列は置換されるだけなので重複追加にはならない。
  */
  loadTasks();

  validateApplicationState();

  setupApplicationRenderer();
  setupApplicationNavigation();
  setupApplicationFilters();
  setupApplicationDashboard();
  setupApplicationForm();
  setupApplicationModal();

  renderCurrentView();

  console.log(
    "タスク管理アプリを起動しました"
  );

  console.log(
    "読み込まれたタスク数:",
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