import {
  tasks,
  loadTasks
} from "./js/data.js";

import {
  loadTeams
} from "./js/teams.js";

import {
  loadMessages
} from "./js/chatData.js";

import {
  setupChat,
  renderChat
} from "./js/chat.js";

import {
  setupMainMenu
} from "./js/mainMenu.js";

import {
  setupTeamControls
} from "./js/teamControls.js";

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
  getFilterSettings,
  resetFilterSettings
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

function handleTeamChange() {
  resetFilterSettings();
  renderChat();
}

function handleTeamUpdate() {
  renderChat();
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
      handleTaskDataChange
  });
}

function setupApplicationTeams() {
  setupTeamControls({
    onTeamChange:
      handleTeamChange,

    onTeamUpdate:
      handleTeamUpdate
  });
}

function setupApplicationChat() {
  setupChat();
}

function setupApplicationMainMenu() {
  setupMainMenu({
    onTaskShow:
      renderCurrentView,

    onChatShow:
      renderChat
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
    既存タスクへチームIDを補うため、
    チームを先に読み込む。
  */
  loadTeams();
  loadTasks();
  loadMessages();

  validateApplicationState();

  setupApplicationRenderer();
  setupApplicationTeams();
  setupApplicationChat();
  setupApplicationMainMenu();
  setupApplicationNavigation();
  setupApplicationFilters();
  setupApplicationDashboard();
  setupApplicationForm();
  setupApplicationModal();

  renderCurrentView();
  renderChat();

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