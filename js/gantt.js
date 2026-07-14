import {
  getTodayString,
  formatDateString
} from "./data.js";

import {
  getStatusClass,
  isTaskExpired
} from "./filters.js";

const ganttChartArea =
  document.getElementById("ganttChartArea");

export function renderGanttChart(options) {
  const {
    tasks,
    onTaskClick
  } = options;

  ganttChartArea.innerHTML = "";

  if (tasks.length === 0) {
    ganttChartArea.innerHTML =
      "<p>該当するタスクがありません</p>";

    return;
  }

  const todayString =
    getTodayString();

  const startDate =
    new Date();

  const dates = [];

  for (let i = 0; i < 14; i++) {
    const date =
      new Date(startDate);

    date.setDate(
      startDate.getDate() + i
    );

    dates.push(date);
  }

  const wrapper =
    document.createElement("div");

  wrapper.classList.add(
    "gantt-wrapper"
  );

  const grid =
    document.createElement("div");

  grid.classList.add(
    "gantt-grid"
  );

  const headerRow =
    document.createElement("div");

  headerRow.classList.add(
    "gantt-row",
    "gantt-header"
  );

  const taskHeader =
    document.createElement("div");

  taskHeader.classList.add(
    "gantt-task-name"
  );

  taskHeader.textContent =
    "タスク";

  headerRow.appendChild(
    taskHeader
  );

  dates.forEach(function (date) {
    const cell =
      document.createElement("div");

    cell.classList.add(
      "gantt-date-cell"
    );

    const dateString =
      formatDateString(date);

    const month =
      date.getMonth() + 1;

    const day =
      date.getDate();

    cell.textContent =
      month + "/" + day;

    if (
      dateString ===
      todayString
    ) {
      cell.classList.add(
        "gantt-today"
      );
    }

    headerRow.appendChild(
      cell
    );
  });

  grid.appendChild(
    headerRow
  );

  tasks.forEach(function (task) {
    const row =
      document.createElement("div");

    row.classList.add(
      "gantt-row"
    );

    const taskName =
      document.createElement("div");

    taskName.classList.add(
      "gantt-task-name"
    );

    taskName.textContent =
      task.title;

    row.appendChild(
      taskName
    );

    dates.forEach(function (date) {
      const cell =
        document.createElement("div");

      cell.classList.add(
        "gantt-date-cell"
      );

      const dateString =
        formatDateString(date);

      const isInRange =
        dateString >=
          task.createdAt &&
        dateString <=
          task.deadline;

      if (
        dateString ===
        todayString
      ) {
        cell.classList.add(
          "gantt-today"
        );
      }

      if (isInRange) {
        const bar =
          document.createElement("div");

        bar.classList.add(
          "gantt-bar"
        );

        bar.classList.add(
          getStatusClass(
            task.status
          )
        );

        if (
          isTaskExpired(task)
        ) {
          bar.classList.add(
            "expired"
          );
        }

        bar.addEventListener(
          "click",
          function () {
            onTaskClick(task);
          }
        );

        cell.appendChild(
          bar
        );
      }

      row.appendChild(
        cell
      );
    });

    grid.appendChild(
      row
    );
  });

  wrapper.appendChild(
    grid
  );

  ganttChartArea.appendChild(
    wrapper
  );
}