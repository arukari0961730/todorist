import {
  tasks
} from "./data.js";

import {
  getCurrentView,
  getCurrentDate
} from "./appState.js";

import {
  filterTasks
} from "./filters.js";

import {
  renderDashboard
} from "./dashboard.js";

import {
  renderCalendar
} from "./calendar.js";

import {
  renderTaskList
} from "./taskList.js";

import {
  renderBoard
} from "./board.js";

import {
  renderGantt
} from "./gantt.js";

import {
  renderAssigneeFilterOptions,
  setFilterControlValues
} from "./filterControls.js";

const dashboardView =
  document.getElementById(
    "dashboardView"
  );

const calendarView =
  document.getElementById(
    "calendarView"
  );

const listView =
  document.getElementById(
    "listView"
  );

const boardView =
  document.getElementById(
    "boardView"
  );

const ganttView =
  document.getElementById(
    "ganttView"
  );

const filterArea =
  document.getElementById(
    "filterArea"
  );

const monthNavigationArea =
  document.getElementById(
    "monthNavigationArea"
  );

const viewElements = {
  dashboard: dashboardView,
  calendar: calendarView,
  list: listView,
  board: boardView,
  gantt: ganttView
};

const DEFAULT_FILTER_SETTINGS = {
  searchKeyword: "",
  status: "all",
  assignee: "all",
  deadline: "all",
  sort: "deadlineAsc"
};

let filterSettings = {
  ...DEFAULT_FILTER_SETTINGS
};

let rendererCallbacks = {
  onTaskClick: null,
  onTaskChange: null,
  onDateClick: null
};

function runCallback(
  callback,
  ...args
) {
  if (
    typeof callback !==
    "function"
  ) {
    return;
  }

  callback(...args);
}

function isPlainObject(
  value
) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function isValidView(
  viewName
) {
  return (
    typeof viewName === "string" &&
    Object.prototype.hasOwnProperty.call(
      viewElements,
      viewName
    )
  );
}

function getSafeCurrentView() {
  const currentView =
    typeof getCurrentView ===
    "function"
      ? getCurrentView()
      : "dashboard";

  return isValidView(
    currentView
  )
    ? currentView
    : "dashboard";
}

function getSafeCurrentDate() {
  const currentDate =
    typeof getCurrentDate ===
    "function"
      ? getCurrentDate()
      : new Date();

  if (
    !(currentDate instanceof Date) ||
    Number.isNaN(
      currentDate.getTime()
    )
  ) {
    return new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
  }

  return new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
}

function normalizeFilterSettings(
  settings = {}
) {
  if (!isPlainObject(settings)) {
    return {
      ...filterSettings
    };
  }

  return {
    searchKeyword:
      typeof settings.searchKeyword ===
      "string"
        ? settings.searchKeyword
        : filterSettings.searchKeyword,

    status:
      typeof settings.status ===
      "string"
        ? settings.status
        : filterSettings.status,

    assignee:
      typeof settings.assignee ===
      "string"
        ? settings.assignee
        : filterSettings.assignee,

    deadline:
      typeof settings.deadline ===
      "string"
        ? settings.deadline
        : filterSettings.deadline,

    sort:
      typeof settings.sort ===
      "string"
        ? settings.sort
        : filterSettings.sort
  };
}

function hideElement(
  element
) {
  if (!element) {
    return;
  }

  element.classList.add(
    "hidden"
  );
}

function showElement(
  element
) {
  if (!element) {
    return;
  }

  element.classList.remove(
    "hidden"
  );
}

function hideAllViews() {
  Object.values(
    viewElements
  ).forEach(
    function (element) {
      hideElement(
        element
      );
    }
  );
}

function showCurrentView(
  currentView
) {
  hideAllViews();

  const targetView =
    viewElements[
      currentView
    ];

  if (!targetView) {
    showElement(
      dashboardView
    );

    return;
  }

  showElement(
    targetView
  );
}

function updateControlVisibility(
  currentView
) {
  if (
    currentView ===
    "dashboard"
  ) {
    hideElement(
      filterArea
    );
  } else {
    showElement(
      filterArea
    );
  }

  if (
    currentView ===
      "calendar" ||
    currentView ===
      "gantt"
  ) {
    showElement(
      monthNavigationArea
    );
  } else {
    hideElement(
      monthNavigationArea
    );
  }
}

function getFilteredTaskArray() {
  return filterTasks(
    tasks,
    filterSettings
  );
}

function updateAssigneeOptions() {
  const selectedAssignee =
    renderAssigneeFilterOptions(
      tasks,
      filterSettings.assignee
    );

  if (
    typeof selectedAssignee ===
    "string"
  ) {
    filterSettings.assignee =
      selectedAssignee;
  }
}

function renderDashboardView() {
  renderDashboard(
    tasks
  );
}

function renderCalendarView(
  filteredTasks,
  currentDate
) {
  renderCalendar({
    currentDate,
    filteredTasks,

    onTaskClick:
      function (task) {
        runCallback(
          rendererCallbacks.onTaskClick,
          task
        );
      },

    onDateClick:
      function (date) {
        runCallback(
          rendererCallbacks.onDateClick,
          date
        );
      }
  });
}

function renderListView(
  filteredTasks
) {
  renderTaskList({
    filteredTasks,

    onTaskClick:
      function (task) {
        runCallback(
          rendererCallbacks.onTaskClick,
          task
        );
      }
  });
}

function renderBoardView(
  filteredTasks
) {
  renderBoard({
    filteredTasks,

    onTaskClick:
      function (task) {
        runCallback(
          rendererCallbacks.onTaskClick,
          task
        );
      },

    onTaskChange:
      function () {
        runCallback(
          rendererCallbacks.onTaskChange
        );
      }
  });
}

function renderGanttView(
  filteredTasks,
  currentDate
) {
  renderGantt({
    currentDate,
    filteredTasks,

    onTaskClick:
      function (task) {
        runCallback(
          rendererCallbacks.onTaskClick,
          task
        );
      }
  });
}

function renderSelectedView(
  currentView,
  filteredTasks,
  currentDate
) {
  switch (
    currentView
  ) {
    case "calendar":
      renderCalendarView(
        filteredTasks,
        currentDate
      );
      break;

    case "list":
      renderListView(
        filteredTasks
      );
      break;

    case "board":
      renderBoardView(
        filteredTasks
      );
      break;

    case "gantt":
      renderGanttView(
        filteredTasks,
        currentDate
      );
      break;

    case "dashboard":
    default:
      renderDashboardView();
      break;
  }
}

export function setupViewRenderer(
  callbacks = {}
) {
  if (
    !isPlainObject(callbacks)
  ) {
    return;
  }

  if (
    typeof callbacks.onTaskClick ===
    "function"
  ) {
    rendererCallbacks.onTaskClick =
      callbacks.onTaskClick;
  }

  if (
    typeof callbacks.onTaskChange ===
    "function"
  ) {
    rendererCallbacks.onTaskChange =
      callbacks.onTaskChange;
  }

  if (
    typeof callbacks.onDateClick ===
    "function"
  ) {
    rendererCallbacks.onDateClick =
      callbacks.onDateClick;
  }
}

export function updateFilterSettings(
  newSettings = {}
) {
  filterSettings =
    normalizeFilterSettings(
      newSettings
    );

  setFilterControlValues(
    filterSettings
  );

  renderCurrentView();
}

export function setFilterSettings(
  newSettings = {}
) {
  updateFilterSettings(
    newSettings
  );
}

export function resetFilterSettings() {
  filterSettings = {
    ...DEFAULT_FILTER_SETTINGS
  };

  setFilterControlValues(
    filterSettings
  );

  updateAssigneeOptions();

  renderCurrentView();
}

export function getFilterSettings() {
  return {
    ...filterSettings
  };
}

export function renderCurrentView() {
  const currentView =
    getSafeCurrentView();

  const currentDate =
    getSafeCurrentDate();

  updateAssigneeOptions();

  setFilterControlValues(
    filterSettings
  );

  const filteredTasks =
    getFilteredTaskArray();

  showCurrentView(
    currentView
  );

  updateControlVisibility(
    currentView
  );

  renderDashboardView();

  renderSelectedView(
    currentView,
    filteredTasks,
    currentDate
  );
}

export function renderAllViews() {
  const currentDate =
    getSafeCurrentDate();

  updateAssigneeOptions();

  setFilterControlValues(
    filterSettings
  );

  const filteredTasks =
    getFilteredTaskArray();

  renderDashboardView();

  renderCalendarView(
    filteredTasks,
    currentDate
  );

  renderListView(
    filteredTasks
  );

  renderBoardView(
    filteredTasks
  );

  renderGanttView(
    filteredTasks,
    currentDate
  );

  const currentView =
    getSafeCurrentView();

  showCurrentView(
    currentView
  );

  updateControlVisibility(
    currentView
  );
}

export function handleTaskDataChange() {
  updateAssigneeOptions();

  renderCurrentView();

  runCallback(
    rendererCallbacks.onTaskChange
  );
}