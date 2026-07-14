import {
  tasks,
  getTodayString,
  normalizeTasks
} from "./js/data.js";

import {
  getTaskAssignee,
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

const prevBtn = document.getElementById("prevBtn");
const todayBtn = document.getElementById("todayBtn");
const nextBtn = document.getElementById("nextBtn");

const calendarTab = document.getElementById("calendarTab");
const listTab = document.getElementById("listTab");
const ganttTab = document.getElementById("ganttTab");
const boardTab = document.getElementById("boardTab");

const calendarArea = document.getElementById("calendarArea");
const listArea = document.getElementById("listArea");
const ganttArea = document.getElementById("ganttArea");
const boardArea = document.getElementById("boardArea");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const assigneeFilter = document.getElementById("assigneeFilter");
const deadlineFilter = document.getElementById("deadlineFilter");
const sortFilter = document.getElementById("sortFilter");

let viewDate = new Date();

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
    onTaskChange: refreshAllViews,

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
    onTaskChange: refreshAllViews
  });
}
function renderAssigneeFilterOptions() {
  const currentValue = assigneeFilter.value;

  assigneeFilter.innerHTML = "";

  const allOption = document.createElement("option");

  allOption.value = "all";
  allOption.textContent = "すべての担当者";

  assigneeFilter.appendChild(allOption);

  const assignees = [];

  tasks.forEach(function (task) {
    const assigneeName = getTaskAssignee(task);

    if (!assignees.includes(assigneeName)) {
      assignees.push(assigneeName);
    }
  });

  assignees.sort(function (a, b) {
    return a.localeCompare(b, "ja");
  });

  assignees.forEach(function (assigneeName) {
    const option = document.createElement("option");

    option.value = assigneeName;
    option.textContent = assigneeName;

    assigneeFilter.appendChild(option);
  });

  if (
    currentValue === "all" ||
    assignees.includes(currentValue)
  ) {
    assigneeFilter.value = currentValue;
    selectedAssigneeFilter = currentValue;
  } else {
    assigneeFilter.value = "all";
    selectedAssigneeFilter = "all";
  }
}

function handleDashboardFilter(filterSettings) {
  if (filterSettings.status !== undefined) {
    selectedStatusFilter = filterSettings.status;
    statusFilter.value = filterSettings.status;
  }

  if (filterSettings.assignee !== undefined) {
    selectedAssigneeFilter = filterSettings.assignee;
    assigneeFilter.value = filterSettings.assignee;
  }

  if (filterSettings.deadline !== undefined) {
    selectedDeadlineFilter = filterSettings.deadline;
    deadlineFilter.value = filterSettings.deadline;
  }

  refreshAllViews();
}

function switchView(viewName) {
  calendarArea.classList.add("hidden");
  listArea.classList.add("hidden");
  ganttArea.classList.add("hidden");
  boardArea.classList.add("hidden");

  calendarTab.classList.remove("active");
  listTab.classList.remove("active");
  ganttTab.classList.remove("active");
  boardTab.classList.remove("active");

  if (viewName === "calendar") {
    calendarArea.classList.remove("hidden");
    calendarTab.classList.add("active");
    drawCalendar();
  }

  if (viewName === "list") {
    listArea.classList.remove("hidden");
    listTab.classList.add("active");
    drawTaskList();
  }

  if (viewName === "gantt") {
    ganttArea.classList.remove("hidden");
    ganttTab.classList.add("active");
    drawGanttChart();
  }

  if (viewName === "board") {
    boardArea.classList.remove("hidden");
    boardTab.classList.add("active");
    drawBoard();
  }
}

function refreshAllViews() {
  renderAssigneeFilterOptions();
  renderDashboard(tasks);
  drawCalendar();
  drawTaskList();
  drawGanttChart();
  drawBoard();
}
prevBtn.addEventListener("click", function () {
  viewDate.setMonth(viewDate.getMonth() - 1);
  drawCalendar();
});

todayBtn.addEventListener("click", function () {
  viewDate = new Date();
  drawCalendar();
});

nextBtn.addEventListener("click", function () {
  viewDate.setMonth(viewDate.getMonth() + 1);
  drawCalendar();
});

calendarTab.addEventListener("click", function () {
  switchView("calendar");
});

listTab.addEventListener("click", function () {
  switchView("list");
});

ganttTab.addEventListener("click", function () {
  switchView("gantt");
});

boardTab.addEventListener("click", function () {
  switchView("board");
});

searchInput.addEventListener("input", function () {
  searchKeyword = searchInput.value.trim();
  refreshAllViews();
});

statusFilter.addEventListener("change", function () {
  selectedStatusFilter = statusFilter.value;
  refreshAllViews();
});

assigneeFilter.addEventListener("change", function () {
  selectedAssigneeFilter = assigneeFilter.value;
  refreshAllViews();
});

deadlineFilter.addEventListener("change", function () {
  selectedDeadlineFilter = deadlineFilter.value;
  refreshAllViews();
});

sortFilter.addEventListener("change", function () {
  selectedSort = sortFilter.value;
  refreshAllViews();
});
normalizeTasks();

setupModalOverlay();

setupDashboard(
  handleDashboardFilter
);

setupTaskForm({
  onTaskAdded: refreshAllViews,

  onDateChange: function (newDate) {
    viewDate = newDate;
  }
});

renderAssigneeFilterOptions();
renderDashboard(tasks);
drawCalendar();