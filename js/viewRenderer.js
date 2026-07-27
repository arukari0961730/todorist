import {
  tasks
} from "./data.js";

import {
  getActiveTeamId
} from "./teams.js";

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

import {
  showView
} from "./navigation.js";

const DEFAULT_FILTER_SETTINGS = {
  searchKeyword: "",
  status: "all",
  assignee: "all",
  deadline: "all",
  sort: "deadline"
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

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function getSafeCurrentView() {
  const currentView =
    getCurrentView();

  const allowedViews = [
    "calendar",
    "list",
    "gantt",
    "board"
  ];

  if (
    !allowedViews.includes(
      currentView
    )
  ) {
    return "calendar";
  }

  return currentView;
}

function getSafeCurrentDate() {
  const currentDate =
    getCurrentDate();

  if (
    !(currentDate instanceof Date) ||
    Number.isNaN(
      currentDate.getTime()
    )
  ) {
    const today =
      new Date();

    return new Date(
      today.getFullYear(),
      today.getMonth(),
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
  newSettings = {}
) {
  if (!isPlainObject(newSettings)) {
    return {
      ...filterSettings
    };
  }

  return {
    searchKeyword:
      typeof newSettings.searchKeyword ===
      "string"
        ? newSettings.searchKeyword
        : filterSettings.searchKeyword,

    status:
      typeof newSettings.status ===
      "string"
        ? newSettings.status
        : filterSettings.status,

    assignee:
      typeof newSettings.assignee ===
      "string"
        ? newSettings.assignee
        : filterSettings.assignee,

    deadline:
      typeof newSettings.deadline ===
      "string"
        ? newSettings.deadline
        : filterSettings.deadline,

    sort:
      typeof newSettings.sort ===
      "string"
        ? newSettings.sort
        : filterSettings.sort
  };
}

/*
  HTMLのselectで使っている値と
  filters.jsが受け取る並び替え名を変換する
*/
function convertSortType(sortType) {
  const sortMap = {
    deadline: "deadlineAsc",
    startDate: "startDateAsc",
    title: "titleAsc",
    assignee: "assigneeAsc",
    status: "statusAsc"
  };

  return (
    sortMap[sortType] ||
    sortType ||
    "deadlineAsc"
  );
}

function createFilterSettingsForSearch() {
  return {
    searchKeyword:
      filterSettings.searchKeyword,

    status:
      filterSettings.status,

    assignee:
      filterSettings.assignee,

    deadline:
      filterSettings.deadline,

    sort:
      convertSortType(
        filterSettings.sort
      )
  };
}

function getActiveTeamTasks() {
  const activeTeamId =
    getActiveTeamId();

  return tasks.filter(
    function (task) {
      return (
        task.teamId ===
        activeTeamId
      );
    }
  );
}

function getFilteredTasks(
  teamTasks
) {
  return filterTasks(
    teamTasks,
    createFilterSettingsForSearch()
  );
}

function updateAssigneeOptions(
  teamTasks
) {
  const selectedAssignee =
    renderAssigneeFilterOptions(
      teamTasks,
      filterSettings.assignee
    );

  filterSettings.assignee =
    selectedAssignee;
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

function renderTaskListView(
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
        renderCurrentView();

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
  viewName,
  filteredTasks,
  currentDate
) {
  switch (viewName) {
    case "calendar":
      renderCalendarView(
        filteredTasks,
        currentDate
      );
      break;

    case "list":
      renderTaskListView(
        filteredTasks
      );
      break;

    case "gantt":
      renderGanttView(
        filteredTasks,
        currentDate
      );
      break;

    case "board":
      renderBoardView(
        filteredTasks
      );
      break;

    default:
      renderCalendarView(
        filteredTasks,
        currentDate
      );
      break;
  }
}

export function setupViewRenderer(
  callbacks = {}
) {
  if (!isPlainObject(callbacks)) {
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

export function getFilterSettings() {
  return {
    ...filterSettings
  };
}

export function updateFilterSettings(
  newSettings = {},
  shouldRender = true
) {
  filterSettings =
    normalizeFilterSettings(
      newSettings
    );

  setFilterControlValues(
    filterSettings
  );

  if (shouldRender) {
    renderCurrentView();
  }
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

  renderCurrentView();
}

export function renderCurrentView() {
  const currentView =
    getSafeCurrentView();

  const currentDate =
    getSafeCurrentDate();

  const teamTasks =
    getActiveTeamTasks();

  updateAssigneeOptions(
    teamTasks
  );

  setFilterControlValues(
    filterSettings
  );

  const filteredTasks =
    getFilteredTasks(
      teamTasks
    );

  renderDashboard(
    teamTasks
  );

  showView(
    currentView
  );

  renderSelectedView(
    currentView,
    filteredTasks,
    currentDate
  );
}

export function renderAllViews() {
  const currentDate =
    getSafeCurrentDate();

  const teamTasks =
    getActiveTeamTasks();

  updateAssigneeOptions(
    teamTasks
  );

  setFilterControlValues(
    filterSettings
  );

  const filteredTasks =
    getFilteredTasks(
      teamTasks
    );

  renderDashboard(
    teamTasks
  );

  renderCalendarView(
    filteredTasks,
    currentDate
  );

  renderTaskListView(
    filteredTasks
  );

  renderGanttView(
    filteredTasks,
    currentDate
  );

  renderBoardView(
    filteredTasks
  );

  showView(
    getSafeCurrentView()
  );
}