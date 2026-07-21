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

let viewDate = new Date();

let currentView = "calendar";

let searchKeyword = "";
let selectedStatusFilter = "all";
let selectedAssigneeFilter = "all";
let selectedDeadlineFilter = "all";
let selectedSort = "deadline";
function getFilteredTasks() {
  const filteredTasks = filterTasks(tasks, {
    searchKeyword: searchKeyword,
    statusFilter: selectedStatusFilter,
    assigneeFilter: selectedAssigneeFilter,
    deadlineFilter: selectedDeadlineFilter
  });

  return sortTasks(
    filteredTasks,
    selectedSort
  );
}

function openTaskDetail(task) {
  renderTaskDetail(task, {
    onTaskChange: function () {
      refreshApp();
    },

    onDateChange: function (newDate) {
      viewDate = newDate;
    }
  });
}

function drawCalendar() {
  renderCalendar({
    viewDate: viewDate,
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
    filteredTasks: getFilteredTasks(),

    onTaskClick: openTaskDetail,

    onTaskChange: function () {
      refreshApp();
    }
  });
}
function drawCurrentView() {
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
  currentView = viewName;

  drawCurrentView();
}

function handlePreviousMonth() {
  viewDate.setMonth(
    viewDate.getMonth() - 1
  );

  if (currentView === "calendar") {
    drawCalendar();
  }
}

function handleToday() {
  viewDate = new Date();

  if (currentView === "calendar") {
    drawCalendar();
  }
}

function handleNextMonth() {
  viewDate.setMonth(
    viewDate.getMonth() + 1
  );

  if (currentView === "calendar") {
    drawCalendar();
  }
}
function updateFilterState(filterSettings) {
  if (
    filterSettings.searchKeyword !==
    undefined
  ) {
    searchKeyword =
      filterSettings.searchKeyword;
  }

  if (
    filterSettings.status !==
    undefined
  ) {
    selectedStatusFilter =
      filterSettings.status;
  }

  if (
    filterSettings.assignee !==
    undefined
  ) {
    selectedAssigneeFilter =
      filterSettings.assignee;
  }

  if (
    filterSettings.deadline !==
    undefined
  ) {
    selectedDeadlineFilter =
      filterSettings.deadline;
  }

  if (
    filterSettings.sort !==
    undefined
  ) {
    selectedSort =
      filterSettings.sort;
  }
}

function updateFilterControls() {
  setFilterControlValues({
    searchKeyword: searchKeyword,
    status: selectedStatusFilter,
    assignee: selectedAssigneeFilter,
    deadline: selectedDeadlineFilter,
    sort: selectedSort
  });
}

function handleFilterChange(filterSettings) {
  updateFilterState(filterSettings);

  updateFilterControls();

  drawCurrentView();
}

function handleDashboardFilter(filterSettings) {
  updateFilterState(filterSettings);

  updateFilterControls();

  drawCurrentView();
}
function refreshAssigneeFilter() {
  selectedAssigneeFilter =
    renderAssigneeFilterOptions(
      tasks,
      selectedAssigneeFilter
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
    viewDate = newDate;
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

showView(currentView);

drawCurrentView();