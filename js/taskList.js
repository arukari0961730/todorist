import {
  getStatusLabel,
  getStatusClass,
  isTaskExpired,
  getTaskAssignee
} from "./filters.js";

const taskListArea =
  document.getElementById("taskListArea");

export function renderTaskList(options) {
  const {
    tasks,
    onTaskClick
  } = options;

  taskListArea.innerHTML = "";

  if (tasks.length === 0) {
    taskListArea.innerHTML =
      "<p>該当するタスクがありません</p>";

    return;
  }

  tasks.forEach(function (task) {
    const item =
      document.createElement("div");

    item.classList.add(
      "task-list-item"
    );

    item.classList.add(
      getStatusClass(task.status)
    );

    const expired =
      isTaskExpired(task);

    if (expired) {
      item.classList.add(
        "expired"
      );
    }

    const title =
      document.createElement("div");

    title.classList.add(
      "task-list-title"
    );

    title.textContent =
      expired
        ? "⚠ " + task.title
        : task.title;

    const meta =
      document.createElement("div");

    meta.classList.add(
      "task-list-meta"
    );

    meta.textContent =
      "担当者：" +
      getTaskAssignee(task) +
      " / 開始日：" +
      task.createdAt +
      " / 締切：" +
      task.deadline +
      " / 状態：" +
      getStatusLabel(task.status);

    item.appendChild(title);
    item.appendChild(meta);

    item.addEventListener(
      "click",
      function () {
        onTaskClick(task);
      }
    );

    taskListArea.appendChild(
      item
    );
  });
}