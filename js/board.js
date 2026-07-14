import {
  STATUS_LIST,
  tasks,
  saveTasks
} from "./data.js";

import {
  getStatusClass,
  getTaskAssignee,
  isTaskExpired
} from "./filters.js";

const boardContentArea =
  document.getElementById("boardContentArea");

export function renderBoard(options) {
  const {
    filteredTasks,
    onTaskClick,
    onTaskChange
  } = options;

  boardContentArea.innerHTML = "";

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
      onTaskChange();
    });

    const statusTasks = filteredTasks.filter(function (task) {
      return task.status === status.value;
    });

    const heading = document.createElement("h4");

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
        onTaskClick(task);
      });

      column.appendChild(card);
    });

    columns.appendChild(column);
  });

  boardContentArea.appendChild(columns);
}