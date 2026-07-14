import {
  getTodayString
} from "./data.js";

import {
  getStatusClass,
  isTaskExpired
} from "./filters.js";

const calendarTableArea =
  document.getElementById("calendarTableArea");

const monthTitle =
  document.getElementById("monthTitle");

export function renderCalendar(options) {
  const {
    viewDate,
    tasks,
    onTaskClick
  } = options;

  calendarTableArea.innerHTML = "";

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  monthTitle.textContent = `${year}年${month + 1}月`;

  const calendarTable =
    document.createElement("table");

  const headerRow =
    document.createElement("tr");

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

  const firstDate =
    new Date(year, month, 1);

  const lastDate =
    new Date(year, month + 1, 0);

  const firstDay =
    firstDate.getDay();

  const lastDay =
    lastDate.getDate();

  const todayString =
    getTodayString();

  let dateCount = 1;

  for (let week = 0; week < 6; week++) {
    const tr =
      document.createElement("tr");

    for (let day = 0; day < 7; day++) {
      const td =
        document.createElement("td");

      if (
        week === 0 &&
        day < firstDay
      ) {
        td.textContent = "";
      } else if (
        dateCount > lastDay
      ) {
        td.textContent = "";
      } else {
        const dateText =
          document.createElement("div");

        dateText.classList.add(
          "date-number"
        );

        dateText.textContent =
          dateCount;

        td.appendChild(dateText);

        const dateString =
          year +
          "-" +
          String(month + 1)
            .padStart(2, "0") +
          "-" +
          String(dateCount)
            .padStart(2, "0");

        if (dateString === todayString) {
          td.classList.add("today");
        }

        tasks.forEach(function (task) {
          if (
            dateString !== task.deadline
          ) {
            return;
          }

          const taskButton =
            document.createElement(
              "button"
            );

          taskButton.classList.add(
            "calendar-task-btn"
          );

          taskButton.classList.add(
            getStatusClass(
              task.status
            )
          );

          const expired =
            isTaskExpired(task);

          if (expired) {
            taskButton.classList.add(
              "expired"
            );
          }

          taskButton.textContent =
            expired
              ? "⚠ " + task.title
              : task.title;

          taskButton.addEventListener(
            "click",
            function () {
              onTaskClick(task);
            }
          );

          td.appendChild(taskButton);
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

  calendarTableArea.appendChild(
    calendarTable
  );
}