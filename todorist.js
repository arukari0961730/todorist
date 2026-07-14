const titleInput = document.getElementById("titleInput");
const descriptionInput = document.getElementById("descriptionInput");
const assigneeInput = document.getElementById("assigneeInput");
const startDateInput = document.getElementById("startDateInput");
const deadlineInput = document.getElementById("deadlineInput");
const statusInput = document.getElementById("statusInput");

const addBtn = document.getElementById("addBtn");
const errorMessage = document.getElementById("errorMessage");

const calendarTableArea = document.getElementById("calendarTableArea");
const monthTitle = document.getElementById("monthTitle");

const prevBtn = document.getElementById("prevBtn");
const todayBtn = document.getElementById("todayBtn");
const nextBtn = document.getElementById("nextBtn");

const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");

const calendarTab = document.getElementById("calendarTab");
const listTab = document.getElementById("listTab");
const ganttTab = document.getElementById("ganttTab");
const boardTab = document.getElementById("boardTab");

const calendarArea = document.getElementById("calendarArea");
const listArea = document.getElementById("listArea");
const ganttArea = document.getElementById("ganttArea");
const boardArea = document.getElementById("boardArea");

const taskListArea = document.getElementById("taskListArea");
const ganttChartArea = document.getElementById("ganttChartArea");
const boardContentArea = document.getElementById("boardContentArea");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const assigneeFilter = document.getElementById("assigneeFilter");
const deadlineFilter = document.getElementById("deadlineFilter");
const sortFilter = document.getElementById("sortFilter");

const allCount = document.getElementById("allCount");
const todoCount = document.getElementById("todoCount");
const workingCount = document.getElementById("workingCount");
const reviewCount = document.getElementById("reviewCount");
const fixCount = document.getElementById("fixCount");
const doneCount = document.getElementById("doneCount");
const expiredCount = document.getElementById("expiredCount");

const allCard = document.getElementById("allCard");
const todoCard = document.getElementById("todoCard");
const workingCard = document.getElementById("workingCard");
const reviewCard = document.getElementById("reviewCard");
const fixCard = document.getElementById("fixCard");
const doneCard = document.getElementById("doneCard");
const expiredCard = document.getElementById("expiredCard");

const STATUS_LIST = [
  { value: "todo", label: "未着手" },
  { value: "working", label: "作業中" },
  { value: "review", label: "確認待ち" },
  { value: "fix", label: "修正中" },
  { value: "done", label: "完了" }
];

const STATUS_ORDER = {
  todo: 1,
  working: 2,
  review: 3,
  fix: 4,
  done: 5
};

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let viewDate = new Date();

let searchKeyword = "";
let selectedStatusFilter = "all";
let selectedAssigneeFilter = "all";
let selectedDeadlineFilter = "all";
let selectedSort = "deadline";

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getTodayString() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStatusLabel(statusValue) {
  const foundStatus = STATUS_LIST.find(function (status) {
    return status.value === statusValue;
  });

  if (!foundStatus) {
    return "未着手";
  }

  return foundStatus.label;
}

function getStatusClass(statusValue) {
  return "status-" + statusValue;
}

function isTaskDone(task) {
  return task.status === "done";
}

function isTaskExpired(task) {
  const todayString = getTodayString();

  return task.deadline < todayString && !isTaskDone(task);
}

function isTaskDueToday(task) {
  return task.deadline === getTodayString();
}

function getTaskAssignee(task) {
  if (!task.assignee || task.assignee.trim() === "") {
    return "未設定";
  }

  return task.assignee.trim();
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

  if (currentValue === "all" || assignees.includes(currentValue)) {
    assigneeFilter.value = currentValue;
    selectedAssigneeFilter = currentValue;
  } else {
    assigneeFilter.value = "all";
    selectedAssigneeFilter = "all";
  }
}

function sortTasks(taskArray) {
  const sortedTasks = taskArray.slice();

  sortedTasks.sort(function (a, b) {
    if (selectedSort === "deadline") {
      return a.deadline.localeCompare(b.deadline);
    }

    if (selectedSort === "startDate") {
      return a.createdAt.localeCompare(b.createdAt);
    }

    if (selectedSort === "title") {
      return a.title.localeCompare(b.title, "ja");
    }

    if (selectedSort === "assignee") {
      return getTaskAssignee(a).localeCompare(
        getTaskAssignee(b),
        "ja"
      );
    }

    if (selectedSort === "status") {
      const statusDifference =
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status];

      if (statusDifference !== 0) {
        return statusDifference;
      }

      return a.deadline.localeCompare(b.deadline);
    }

    return a.deadline.localeCompare(b.deadline);
  });

  return sortedTasks;
}

function getFilteredTasks() {
  let result = tasks.slice();

  if (searchKeyword !== "") {
    result = result.filter(function (task) {
      const keyword = searchKeyword.toLowerCase();

      const title = task.title.toLowerCase();
      const description = task.description.toLowerCase();
      const assignee = getTaskAssignee(task).toLowerCase();
      const statusLabel = getStatusLabel(task.status).toLowerCase();

      return (
        title.includes(keyword) ||
        description.includes(keyword) ||
        assignee.includes(keyword) ||
        statusLabel.includes(keyword)
      );
    });
  }

  if (selectedStatusFilter !== "all") {
    result = result.filter(function (task) {
      return task.status === selectedStatusFilter;
    });
  }

  if (selectedAssigneeFilter !== "all") {
    result = result.filter(function (task) {
      return getTaskAssignee(task) === selectedAssigneeFilter;
    });
  }

  if (selectedDeadlineFilter === "expired") {
    result = result.filter(function (task) {
      return isTaskExpired(task);
    });
  }

  if (selectedDeadlineFilter === "today") {
    result = result.filter(function (task) {
      return isTaskDueToday(task);
    });
  }

  return result;
}

function normalizeTasks() {
  tasks.forEach(function (task) {
    if (!task.createdAt) {
      task.createdAt = task.deadline;
    }

    if (task.assignee === undefined) {
      task.assignee = "";
    }

    if (task.description === undefined) {
      task.description = "";
    }

    if (!task.status) {
      if (task.completed === true) {
        task.status = "done";
      } else {
        task.status = "todo";
      }
    }

    delete task.completed;
  });

  saveTasks();
}

function renderDashboard() {
  allCount.textContent = tasks.length;

  todoCount.textContent = tasks.filter(function (task) {
    return task.status === "todo";
  }).length;

  workingCount.textContent = tasks.filter(function (task) {
    return task.status === "working";
  }).length;

  reviewCount.textContent = tasks.filter(function (task) {
    return task.status === "review";
  }).length;

  fixCount.textContent = tasks.filter(function (task) {
    return task.status === "fix";
  }).length;

  doneCount.textContent = tasks.filter(function (task) {
    return task.status === "done";
  }).length;

  expiredCount.textContent = tasks.filter(function (task) {
    return isTaskExpired(task);
  }).length;
}

function closeModal() {
  modalOverlay.classList.add("hidden");
}

modalOverlay.addEventListener("click", function (event) {
  if (event.target === modalOverlay) {
    closeModal();
  }
});

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
    renderCalendar();
  }

  if (viewName === "list") {
    listArea.classList.remove("hidden");
    listTab.classList.add("active");
    renderTaskList();
  }

  if (viewName === "gantt") {
    ganttArea.classList.remove("hidden");
    ganttTab.classList.add("active");
    renderGanttChart();
  }

  if (viewName === "board") {
    boardArea.classList.remove("hidden");
    boardTab.classList.add("active");
    renderBoard();
  }
}

function renderStatusSelect(selectedStatus) {
  const select = document.createElement("select");
  select.classList.add("edit-select");

  STATUS_LIST.forEach(function (status) {
    const option = document.createElement("option");
    option.value = status.value;
    option.textContent = status.label;

    if (status.value === selectedStatus) {
      option.selected = true;
    }

    select.appendChild(option);
  });

  return select;
}

function refreshAllViews() {
  renderAssigneeFilterOptions();
  renderDashboard();
  renderCalendar();
  renderTaskList();
  renderGanttChart();
  renderBoard();
}
function renderTaskDetail(task) {
  modalOverlay.classList.remove("hidden");
  modalContent.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = task.title;

  const description = document.createElement("p");
  description.textContent =
    task.description === ""
      ? "詳細：なし"
      : "詳細：" + task.description;

  const assignee = document.createElement("p");
  assignee.textContent =
    "担当者：" + getTaskAssignee(task);

  const createdAt = document.createElement("p");
  createdAt.textContent =
    "開始日：" + task.createdAt;

  const deadline = document.createElement("p");
  deadline.textContent =
    "締切日：" + task.deadline;

  const statusText = document.createElement("p");
  statusText.textContent = "状態：";

  const statusBadge = document.createElement("span");
  statusBadge.classList.add("status-badge");
  statusBadge.classList.add(getStatusClass(task.status));
  statusBadge.textContent = getStatusLabel(task.status);

  statusText.appendChild(statusBadge);

  const statusSelect = renderStatusSelect(task.status);

  const changeStatusBtn = document.createElement("button");
  changeStatusBtn.classList.add("modal-status-btn");
  changeStatusBtn.textContent = "状態を変更";

  changeStatusBtn.addEventListener("click", function () {
    task.status = statusSelect.value;

    saveTasks();
    refreshAllViews();
    renderTaskDetail(task);
  });

  const editBtn = document.createElement("button");
  editBtn.classList.add("modal-edit-btn");
  editBtn.textContent = "編集";

  editBtn.addEventListener("click", function () {
    renderEditForm(task);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("modal-delete-btn");
  deleteBtn.textContent = "削除";

  deleteBtn.addEventListener("click", function () {
    const ok = confirm("この課題を削除しますか？");

    if (!ok) {
      return;
    }

    tasks = tasks.filter(function (targetTask) {
      return targetTask.id !== task.id;
    });

    saveTasks();
    refreshAllViews();
    closeModal();
  });

  const closeBtn = document.createElement("button");
  closeBtn.classList.add("modal-close-btn");
  closeBtn.textContent = "閉じる";

  closeBtn.addEventListener("click", function () {
    closeModal();
  });

  modalContent.appendChild(title);
  modalContent.appendChild(description);
  modalContent.appendChild(assignee);
  modalContent.appendChild(createdAt);
  modalContent.appendChild(deadline);
  modalContent.appendChild(statusText);
  modalContent.appendChild(statusSelect);
  modalContent.appendChild(changeStatusBtn);
  modalContent.appendChild(editBtn);
  modalContent.appendChild(deleteBtn);
  modalContent.appendChild(closeBtn);
}

function renderEditForm(task) {
  modalOverlay.classList.remove("hidden");
  modalContent.innerHTML = "";

  const titleLabel = document.createElement("label");
  titleLabel.textContent = "課題名";

  const titleEdit = document.createElement("input");
  titleEdit.classList.add("edit-input");
  titleEdit.value = task.title;

  const descriptionLabel = document.createElement("label");
  descriptionLabel.textContent = "詳細";

  const descriptionEdit = document.createElement("textarea");
  descriptionEdit.classList.add("edit-textarea");
  descriptionEdit.value = task.description;

  const assigneeLabel = document.createElement("label");
  assigneeLabel.textContent = "担当者";

  const assigneeEdit = document.createElement("input");
  assigneeEdit.classList.add("edit-input");
  assigneeEdit.value = task.assignee || "";

  const startDateLabel = document.createElement("label");
  startDateLabel.textContent = "開始日";

  const startDateEdit = document.createElement("input");
  startDateEdit.classList.add("edit-input");
  startDateEdit.type = "date";
  startDateEdit.value = task.createdAt;

  const deadlineLabel = document.createElement("label");
  deadlineLabel.textContent = "締切日";

  const deadlineEdit = document.createElement("input");
  deadlineEdit.classList.add("edit-input");
  deadlineEdit.type = "date";
  deadlineEdit.value = task.deadline;

  const statusLabel = document.createElement("label");
  statusLabel.textContent = "状態";

  const statusEdit = renderStatusSelect(task.status);

  const saveBtn = document.createElement("button");
  saveBtn.classList.add("modal-save-btn");
  saveBtn.textContent = "保存";

  saveBtn.addEventListener("click", function () {
    const editedTitle = titleEdit.value.trim();
    const editedDescription = descriptionEdit.value.trim();
    const editedAssignee = assigneeEdit.value.trim();
    const editedStartDate = startDateEdit.value;
    const editedDeadline = deadlineEdit.value;
    const editedStatus = statusEdit.value;

    if (
      editedTitle === "" ||
      editedStartDate === "" ||
      editedDeadline === ""
    ) {
      alert("課題名、開始日、締切日は必須です");
      return;
    }

    if (editedStartDate > editedDeadline) {
      alert("開始日は締切日より前の日付にしてください");
      return;
    }

    task.title = editedTitle;
    task.description = editedDescription;
    task.assignee = editedAssignee;
    task.createdAt = editedStartDate;
    task.deadline = editedDeadline;
    task.status = editedStatus;

    saveTasks();

    viewDate = new Date(
      Number(editedDeadline.slice(0, 4)),
      Number(editedDeadline.slice(5, 7)) - 1,
      Number(editedDeadline.slice(8, 10))
    );

    refreshAllViews();
    renderTaskDetail(task);
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.classList.add("modal-cancel-btn");
  cancelBtn.textContent = "キャンセル";

  cancelBtn.addEventListener("click", function () {
    renderTaskDetail(task);
  });

  modalContent.appendChild(titleLabel);
  modalContent.appendChild(titleEdit);
  modalContent.appendChild(descriptionLabel);
  modalContent.appendChild(descriptionEdit);
  modalContent.appendChild(assigneeLabel);
  modalContent.appendChild(assigneeEdit);
  modalContent.appendChild(startDateLabel);
  modalContent.appendChild(startDateEdit);
  modalContent.appendChild(deadlineLabel);
  modalContent.appendChild(deadlineEdit);
  modalContent.appendChild(statusLabel);
  modalContent.appendChild(statusEdit);
  modalContent.appendChild(saveBtn);
  modalContent.appendChild(cancelBtn);
}

function renderCalendar() {
  calendarTableArea.innerHTML = "";

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  monthTitle.textContent =
    `${year}年${month + 1}月`;

  const calendarTable = document.createElement("table");

  const headerRow = document.createElement("tr");
  const weekDays = [
    "日",
    "月",
    "火",
    "水",
    "木",
    "金",
    "土"
  ];

  weekDays.forEach(function (day) {
    const th = document.createElement("th");
    th.textContent = day;
    headerRow.appendChild(th);
  });

  calendarTable.appendChild(headerRow);

  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);

  const firstDay = firstDate.getDay();
  const lastDay = lastDate.getDate();

  let dateCount = 1;

  const todayString = getTodayString();
  const filteredTasks = sortTasks(getFilteredTasks());

  for (let week = 0; week < 6; week++) {
    const tr = document.createElement("tr");

    for (let day = 0; day < 7; day++) {
      const td = document.createElement("td");

      if (week === 0 && day < firstDay) {
        td.textContent = "";
      } else if (dateCount > lastDay) {
        td.textContent = "";
      } else {
        const dateText = document.createElement("div");
        dateText.classList.add("date-number");
        dateText.textContent = dateCount;
        td.appendChild(dateText);

        const dateString =
          year +
          "-" +
          String(month + 1).padStart(2, "0") +
          "-" +
          String(dateCount).padStart(2, "0");

        if (dateString === todayString) {
          td.classList.add("today");
        }

        filteredTasks.forEach(function (task) {
          if (dateString !== task.deadline) {
            return;
          }

          const taskBtn = document.createElement("button");
          taskBtn.classList.add("calendar-task-btn");
          taskBtn.classList.add(
            getStatusClass(task.status)
          );

          const expired = isTaskExpired(task);

          if (expired) {
            taskBtn.classList.add("expired");
          }

          taskBtn.textContent = expired
            ? "⚠ " + task.title
            : task.title;

          taskBtn.addEventListener("click", function () {
            renderTaskDetail(task);
          });

          td.appendChild(taskBtn);
        });

        dateCount++;
      }

      tr.appendChild(td);
    }

    calendarTable.appendChild(tr);

    if (dateCount > lastDay) {
      break;
    }
  }

  calendarTableArea.appendChild(calendarTable);
}
function renderTaskList() {
  taskListArea.innerHTML = "";

  const filteredTasks = sortTasks(getFilteredTasks());

  if (filteredTasks.length === 0) {
    taskListArea.innerHTML =
      "<p>該当するタスクがありません</p>";
    return;
  }

  filteredTasks.forEach(function (task) {
    const item = document.createElement("div");
    item.classList.add("task-list-item");
    item.classList.add(getStatusClass(task.status));

    const expired = isTaskExpired(task);

    if (expired) {
      item.classList.add("expired");
    }

    const title = document.createElement("div");
    title.classList.add("task-list-title");
    title.textContent = expired
      ? "⚠ " + task.title
      : task.title;

    const meta = document.createElement("div");
    meta.classList.add("task-list-meta");

    const assigneeText = getTaskAssignee(task);
    const statusText = getStatusLabel(task.status);

    meta.textContent =
      "担当者：" +
      assigneeText +
      " / 開始日：" +
      task.createdAt +
      " / 締切：" +
      task.deadline +
      " / 状態：" +
      statusText;

    item.appendChild(title);
    item.appendChild(meta);

    item.addEventListener("click", function () {
      renderTaskDetail(task);
    });

    taskListArea.appendChild(item);
  });
}

function renderGanttChart() {
  ganttChartArea.innerHTML = "";

  const filteredTasks = sortTasks(getFilteredTasks());

  if (filteredTasks.length === 0) {
    ganttChartArea.innerHTML =
      "<p>該当するタスクがありません</p>";
    return;
  }

  const todayString = getTodayString();

  const startDate = new Date();
  const dates = [];

  for (let i = 0; i < 14; i++) {
    const date = new Date(startDate);

    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }

  const wrapper = document.createElement("div");
  wrapper.classList.add("gantt-wrapper");

  const grid = document.createElement("div");
  grid.classList.add("gantt-grid");

  const headerRow = document.createElement("div");
  headerRow.classList.add(
    "gantt-row",
    "gantt-header"
  );

  const taskHeader = document.createElement("div");
  taskHeader.classList.add("gantt-task-name");
  taskHeader.textContent = "タスク";
  headerRow.appendChild(taskHeader);

  dates.forEach(function (date) {
    const cell = document.createElement("div");
    cell.classList.add("gantt-date-cell");

    const dateString = formatDateString(date);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    cell.textContent = month + "/" + day;

    if (dateString === todayString) {
      cell.classList.add("gantt-today");
    }

    headerRow.appendChild(cell);
  });

  grid.appendChild(headerRow);

  filteredTasks.forEach(function (task) {
    const row = document.createElement("div");
    row.classList.add("gantt-row");

    const taskName = document.createElement("div");
    taskName.classList.add("gantt-task-name");
    taskName.textContent = task.title;
    row.appendChild(taskName);

    dates.forEach(function (date) {
      const cell = document.createElement("div");
      cell.classList.add("gantt-date-cell");

      const dateString = formatDateString(date);

      const isInRange =
        dateString >= task.createdAt &&
        dateString <= task.deadline;

      const expired = isTaskExpired(task);

      if (dateString === todayString) {
        cell.classList.add("gantt-today");
      }

      if (isInRange) {
        const bar = document.createElement("div");
        bar.classList.add("gantt-bar");
        bar.classList.add(getStatusClass(task.status));

        if (expired) {
          bar.classList.add("expired");
        }

        bar.addEventListener("click", function () {
          renderTaskDetail(task);
        });

        cell.appendChild(bar);
      }

      row.appendChild(cell);
    });

    grid.appendChild(row);
  });

  wrapper.appendChild(grid);
  ganttChartArea.appendChild(wrapper);
}

function renderBoard() {
  boardContentArea.innerHTML = "";

  const filteredTasks = sortTasks(getFilteredTasks());

  if (filteredTasks.length === 0) {
    boardContentArea.innerHTML =
      "<p>該当するタスクがありません</p>";
    return;
  }

  const columns = document.createElement("div");
  columns.classList.add("board-columns");

  STATUS_LIST.forEach(function (status) {
    const column = document.createElement("div");
    column.classList.add("board-column");
    column.dataset.status = status.value;

    column.addEventListener("dragover", function (event) {
      event.preventDefault();
      column.classList.add("drag-over");
    });

    column.addEventListener("dragleave", function () {
      column.classList.remove("drag-over");
    });

    column.addEventListener("drop", function (event) {
      event.preventDefault();
      column.classList.remove("drag-over");

      const taskId = Number(
        event.dataTransfer.getData("taskId")
      );

      const targetTask = tasks.find(function (task) {
        return task.id === taskId;
      });

      if (!targetTask) {
        return;
      }

      targetTask.status = column.dataset.status;

      saveTasks();
      refreshAllViews();
    });

    const heading = document.createElement("h4");

    const statusTasks = filteredTasks.filter(function (task) {
      return task.status === status.value;
    });

    heading.textContent =
      status.label + "（" + statusTasks.length + "）";

    column.appendChild(heading);

    if (statusTasks.length === 0) {
      const emptyText = document.createElement("p");
      emptyText.textContent = "なし";
      emptyText.classList.add("task-list-meta");
      column.appendChild(emptyText);
    }

    statusTasks.forEach(function (task) {
      const card = document.createElement("div");
      card.classList.add("board-card");
      card.classList.add(getStatusClass(task.status));
      card.draggable = true;

      const expired = isTaskExpired(task);

      if (expired) {
        card.classList.add("expired");
      }

      card.addEventListener("dragstart", function (event) {
        event.dataTransfer.setData(
          "taskId",
          String(task.id)
        );

        card.classList.add("dragging");
      });

      card.addEventListener("dragend", function () {
        card.classList.remove("dragging");
      });

      const title = document.createElement("div");
      title.classList.add("board-card-title");
      title.textContent = expired
        ? "⚠ " + task.title
        : task.title;

      const meta = document.createElement("div");
      meta.classList.add("board-card-meta");

      meta.textContent =
        "担当者：" +
        getTaskAssignee(task) +
        " / 締切：" +
        task.deadline;

      card.appendChild(title);
      card.appendChild(meta);

      card.addEventListener("click", function () {
        renderTaskDetail(task);
      });

      column.appendChild(card);
    });

    columns.appendChild(column);
  });

  boardContentArea.appendChild(columns);
}

addBtn.addEventListener("click", function () {
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const assignee = assigneeInput.value.trim();
  const startDate = startDateInput.value;
  const deadline = deadlineInput.value;
  const status = statusInput.value;

  if (
    title === "" ||
    startDate === "" ||
    deadline === ""
  ) {
    errorMessage.textContent =
      "課題名、開始日、締切日は必須です";
    return;
  }

  if (startDate > deadline) {
    errorMessage.textContent =
      "開始日は締切日より前の日付にしてください";
    return;
  }

  errorMessage.textContent = "";

  const task = {
    id: Date.now(),
    title: title,
    description: description,
    assignee: assignee,
    createdAt: startDate,
    deadline: deadline,
    status: status
  };

  tasks.push(task);
  saveTasks();

  viewDate = new Date(
    Number(deadline.slice(0, 4)),
    Number(deadline.slice(5, 7)) - 1,
    Number(deadline.slice(8, 10))
  );

  refreshAllViews();

  titleInput.value = "";
  descriptionInput.value = "";
  assigneeInput.value = "";
  startDateInput.value = getTodayString();
  deadlineInput.value = "";
  statusInput.value = "todo";
});

prevBtn.addEventListener("click", function () {
  viewDate.setMonth(viewDate.getMonth() - 1);
  renderCalendar();
});

todayBtn.addEventListener("click", function () {
  viewDate = new Date();
  renderCalendar();
});

nextBtn.addEventListener("click", function () {
  viewDate.setMonth(viewDate.getMonth() + 1);
  renderCalendar();
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

allCard.addEventListener("click", function () {
  statusFilter.value = "all";
  assigneeFilter.value = "all";
  deadlineFilter.value = "all";

  selectedStatusFilter = "all";
  selectedAssigneeFilter = "all";
  selectedDeadlineFilter = "all";

  refreshAllViews();
});

todoCard.addEventListener("click", function () {
  statusFilter.value = "todo";
  deadlineFilter.value = "all";

  selectedStatusFilter = "todo";
  selectedDeadlineFilter = "all";

  refreshAllViews();
});

workingCard.addEventListener("click", function () {
  statusFilter.value = "working";
  deadlineFilter.value = "all";

  selectedStatusFilter = "working";
  selectedDeadlineFilter = "all";

  refreshAllViews();
});

reviewCard.addEventListener("click", function () {
  statusFilter.value = "review";
  deadlineFilter.value = "all";

  selectedStatusFilter = "review";
  selectedDeadlineFilter = "all";

  refreshAllViews();
});

fixCard.addEventListener("click", function () {
  statusFilter.value = "fix";
  deadlineFilter.value = "all";

  selectedStatusFilter = "fix";
  selectedDeadlineFilter = "all";

  refreshAllViews();
});

doneCard.addEventListener("click", function () {
  statusFilter.value = "done";
  deadlineFilter.value = "all";

  selectedStatusFilter = "done";
  selectedDeadlineFilter = "all";

  refreshAllViews();
});

expiredCard.addEventListener("click", function () {
  statusFilter.value = "all";
  deadlineFilter.value = "expired";

  selectedStatusFilter = "all";
  selectedDeadlineFilter = "expired";

  refreshAllViews();
});

startDateInput.value = getTodayString();

normalizeTasks();
renderAssigneeFilterOptions();
renderDashboard();
renderCalendar();