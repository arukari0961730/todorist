import {
  tasks,
  normalizeTasks
} from "./js/data.js";

import {
  filterTasks,
  sortTasks
} from "./js/filters.js";

import {
  renderTaskDetail,
  setupModalOverlay
} from "./js/modal.js";

import {
  renderCalendar
} from "./js/calendar.js";

import {
  renderGanttChart
} from "./js/gantt.js";

import {
  renderBoard
} from "./js/board.js";

import {
  renderTaskList
} from "./js/taskList.js";

import {
  renderDashboard,
  setupDashboard
} from "./js/dashboard.js";

import {
  setupTaskForm
} from "./js/form.js";

import {
  setupFilterControls,
  renderAssigneeFilterOptions,
  setFilterControlValues
} from "./js/filterControls.js";

import {
  setupNavigation,
  showView
} from "./js/navigation.js";

import {
  getViewDate,
  setViewDate,
  moveViewMonth,
  resetViewDateToToday,
  getCurrentView,
  setCurrentView,
  getFilterState,
  updateFilterState,
  setAssigneeFilter
} from "./js/appState.js";
function getFilteredTasks() {
  const filterState =
    getFilterState();

  const filteredTasks =
    filterTasks(tasks, {
      searchKeyword:
        filterState.searchKeyword,

      statusFilter:
        filterState.status,

      assigneeFilter:
        filterState.assignee,

      deadlineFilter:
        filterState.deadline
    });

  return sortTasks(
    filteredTasks,
    filterState.sort
  );
}

function openTaskDetail(task) {
  renderTaskDetail(task, {
    onTaskChange: function () {
      refreshApp();
    },

    onDateChange: function (newDate) {
      setViewDate(newDate);
    }
  });
}

function drawCalendar() {
  renderCalendar({
    viewDate: getViewDate(),
    tasks: getFilteredTasks(),
    onTaskClick: openTaskDetail
  });
}

function drawTaskList() {
  renderTaskList({
    tasks: getFilteredTasks(),
    onTaskClick: openTaskDetail
  });
}

function drawGanttChart() {
  renderGanttChart({
    tasks: getFilteredTasks(),
    onTaskClick: openTaskDetail
  });
}

function drawBoard() {
  renderBoard({
    filteredTasks:
      getFilteredTasks(),

    onTaskClick:
      openTaskDetail,

    onTaskChange:
      function () {
        refreshApp();
      }
  });
}
function drawCurrentView() {
  const currentView =
    getCurrentView();

  if (currentView === "calendar") {
    drawCalendar();
    return;
  }

  if (currentView === "list") {
    drawTaskList();
    return;
  }

  if (currentView === "gantt") {
    drawGanttChart();
    return;
  }

  if (currentView === "board") {
    drawBoard();
  }
}

function handleViewChange(viewName) {
  setCurrentView(viewName);

  drawCurrentView();
}

function handlePreviousMonth() {
  moveViewMonth(-1);

  if (
    getCurrentView() === "calendar"
  ) {
    drawCalendar();
  }
}

function handleToday() {
  resetViewDateToToday();

  if (
    getCurrentView() === "calendar"
  ) {
    drawCalendar();
  }
}

function handleNextMonth() {
  moveViewMonth(1);

  if (
    getCurrentView() === "calendar"
  ) {
    drawCalendar();
  }
}
function updateFilterControls() {
  const filterState =
    getFilterState();

  setFilterControlValues({
    searchKeyword:
      filterState.searchKeyword,

    status:
      filterState.status,

    assignee:
      filterState.assignee,

    deadline:
      filterState.deadline,

    sort:
      filterState.sort
  });
}

function handleFilterChange(
  filterSettings
) {
  updateFilterState(
    filterSettings
  );

  updateFilterControls();

  drawCurrentView();
}

function handleDashboardFilter(
  filterSettings
) {
  updateFilterState(
    filterSettings
  );

  updateFilterControls();

  drawCurrentView();
}
function refreshAssigneeFilter() {
  const filterState =
    getFilterState();

  const selectedAssignee =
    renderAssigneeFilterOptions(
      tasks,
      filterState.assignee
    );

  setAssigneeFilter(
    selectedAssignee
  );

  updateFilterControls();
}

function refreshApp() {
  refreshAssigneeFilter();

  renderDashboard(tasks);

  drawCurrentView();
}
normalizeTasks();

setupModalOverlay();

setupDashboard(
  handleDashboardFilter
);

setupFilterControls(
  handleFilterChange
);

setupTaskForm({
  onTaskAdded: function () {
    refreshApp();
  },

  onDateChange: function (newDate) {
    setViewDate(newDate);
  }
});

setupNavigation({
  onPreviousMonth:
    handlePreviousMonth,

  onToday:
    handleToday,

  onNextMonth:
    handleNextMonth,

  onViewChange:
    handleViewChange
});

refreshAssigneeFilter();

renderDashboard(tasks);

showView(
  getCurrentView()
);

drawCurrentView();