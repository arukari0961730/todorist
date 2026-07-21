import {
  getStatusClass,
  getTaskAssignee,
  isTaskExpired
} from "./filters.js";

const calendarTableArea =
  document.getElementById(
    "calendarTableArea"
  );

const monthTitle =
  document.getElementById(
    "monthTitle"
  );

const DAY_LABELS = [
  "日",
  "月",
  "火",
  "水",
  "木",
  "金",
  "土"
];

const WEEK_COUNT = 6;
const DAYS_PER_WEEK = 7;

function runCallback(
  callback,
  ...args
) {
  if (
    typeof callback ===
    "function"
  ) {
    callback(...args);
  }
}

function isValidDate(date) {
  return (
    date instanceof Date &&
    !Number.isNaN(
      date.getTime()
    )
  );
}

function createDate(
  value
) {
  if (
    value instanceof Date
  ) {
    return new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate()
    );
  }

  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const parts =
    value.split("-");

  if (
    parts.length !== 3
  ) {
    return null;
  }

  const year =
    Number(parts[0]);

  const month =
    Number(parts[1]);

  const day =
    Number(parts[2]);

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDateString(
  date
) {
  if (!isValidDate(date)) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isSameDate(
  dateA,
  dateB
) {
  if (
    !isValidDate(dateA) ||
    !isValidDate(dateB)
  ) {
    return false;
  }

  return (
    dateA.getFullYear() ===
      dateB.getFullYear() &&
    dateA.getMonth() ===
      dateB.getMonth() &&
    dateA.getDate() ===
      dateB.getDate()
  );
}

function getCalendarStartDate(
  currentDate
) {
  const firstDay =
    new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

  firstDay.setDate(
    firstDay.getDate() -
    firstDay.getDay()
  );

  return firstDay;
}

function hasValidTaskDate(
  task
) {
  if (
    !task ||
    typeof task !==
      "object"
  ) {
    return false;
  }

  return (
    createDate(
      task.deadline
    ) !== null
  );
}

/*
  カレンダーには締切日にだけ表示する
*/
function isTaskDeadlineDate(
  task,
  targetDate
) {
  const deadline =
    createDate(
      task.deadline
    );

  if (!deadline) {
    return false;
  }

  return isSameDate(
    deadline,
    targetDate
  );
}

function createDayHeader() {
  const headerRow =
    document.createElement(
      "tr"
    );

  DAY_LABELS.forEach(
    function (
      dayLabel,
      index
    ) {
      const headerCell =
        document.createElement(
          "th"
        );

      headerCell.textContent =
        dayLabel;

      if (index === 0) {
        headerCell.classList.add(
          "sunday"
        );
      }

      if (index === 6) {
        headerCell.classList.add(
          "saturday"
        );
      }

      headerRow.appendChild(
        headerCell
      );
    }
  );

  return headerRow;
}

function createTaskButton(
  task,
  onTaskClick
) {
  const button =
    document.createElement(
      "button"
    );

  button.type = "button";

  button.classList.add(
    "calendar-task-btn"
  );

  const statusClass =
    getStatusClass(
      task.status
    );

  if (statusClass) {
    button.classList.add(
      statusClass
    );
  }

  if (
    isTaskExpired(task)
  ) {
    button.classList.add(
      "expired"
    );
  }

  button.textContent =
    task.title || "無題";

  button.title =
    `${task.title || "無題"}\n` +
    `担当者：${getTaskAssignee(task)}\n` +
    `開始日：${task.createdAt}\n` +
    `締切日：${task.deadline}`;

  button.addEventListener(
    "click",
    function (event) {
      event.stopPropagation();

      runCallback(
        onTaskClick,
        task
      );
    }
  );

  return button;
}

function createCalendarCell(
  date,
  currentDate,
  tasks,
  callbacks
) {
  const {
    onTaskClick,
    onDateClick
  } = callbacks;

  const cell =
    document.createElement(
      "td"
    );

  cell.classList.add(
    "calendar-cell"
  );

  cell.dataset.date =
    formatDateString(date);

  if (
    date.getMonth() !==
    currentDate.getMonth()
  ) {
    cell.classList.add(
      "other-month"
    );
  }

  if (
    date.getDay() === 0
  ) {
    cell.classList.add(
      "sunday"
    );
  }

  if (
    date.getDay() === 6
  ) {
    cell.classList.add(
      "saturday"
    );
  }

  if (
    isSameDate(
      date,
      new Date()
    )
  ) {
    cell.classList.add(
      "today"
    );
  }

  const dayNumber =
    document.createElement(
      "div"
    );

  dayNumber.classList.add(
    "date-number"
  );

  dayNumber.textContent =
    String(
      date.getDate()
    );

  cell.appendChild(
    dayNumber
  );

  const taskArea =
    document.createElement(
      "div"
    );

  taskArea.classList.add(
    "calendar-task-area"
  );

  const dateTasks =
    tasks.filter(
      function (task) {
        return isTaskDeadlineDate(
          task,
          date
        );
      }
    );

  dateTasks.forEach(
    function (task) {
      taskArea.appendChild(
        createTaskButton(
          task,
          onTaskClick
        )
      );
    }
  );

  cell.appendChild(
    taskArea
  );

  cell.addEventListener(
    "click",
    function () {
      runCallback(
        onDateClick,
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        )
      );
    }
  );

  return cell;
}

function normalizeOptions(
  firstArgument,
  secondArgument,
  thirdArgument
) {
  if (
    firstArgument &&
    typeof firstArgument ===
      "object" &&
    !(firstArgument instanceof Date) &&
    (
      "currentDate" in
        firstArgument ||
      "filteredTasks" in
        firstArgument ||
      "tasks" in
        firstArgument
    )
  ) {
    return {
      currentDate:
        firstArgument.currentDate,

      filteredTasks:
        firstArgument.filteredTasks ??
        firstArgument.tasks ??
        [],

      onTaskClick:
        firstArgument.onTaskClick,

      onDateClick:
        firstArgument.onDateClick
    };
  }

  const callbacks =
    thirdArgument &&
    typeof thirdArgument ===
      "object"
      ? thirdArgument
      : {};

  return {
    currentDate:
      firstArgument,

    filteredTasks:
      secondArgument,

    onTaskClick:
      callbacks.onTaskClick,

    onDateClick:
      callbacks.onDateClick
  };
}

export function renderCalendar(
  firstArgument,
  secondArgument,
  thirdArgument
) {
  if (!calendarTableArea) {
    console.error(
      "calendarTableAreaが見つかりません"
    );

    return;
  }

  const options =
    normalizeOptions(
      firstArgument,
      secondArgument,
      thirdArgument
    );

  const currentDate =
    createDate(
      options.currentDate
    );

  if (!currentDate) {
    console.error(
      "カレンダーの表示月が不正です"
    );

    return;
  }

  const safeTasks =
    Array.isArray(
      options.filteredTasks
    )
      ? options.filteredTasks.filter(
          hasValidTaskDate
        )
      : [];

  if (monthTitle) {
    monthTitle.textContent =
      `${currentDate.getFullYear()}年` +
      `${currentDate.getMonth() + 1}月`;
  }

  calendarTableArea.innerHTML =
    "";

  const table =
    document.createElement(
      "table"
    );

  table.classList.add(
    "calendar-table"
  );

  const tableHead =
    document.createElement(
      "thead"
    );

  tableHead.appendChild(
    createDayHeader()
  );

  table.appendChild(
    tableHead
  );

  const tableBody =
    document.createElement(
      "tbody"
    );

  const calendarStartDate =
    getCalendarStartDate(
      currentDate
    );

  for (
    let weekIndex = 0;
    weekIndex < WEEK_COUNT;
    weekIndex++
  ) {
    const row =
      document.createElement(
        "tr"
      );

    for (
      let dayIndex = 0;
      dayIndex < DAYS_PER_WEEK;
      dayIndex++
    ) {
      const dateOffset =
        weekIndex *
          DAYS_PER_WEEK +
        dayIndex;

      const cellDate =
        new Date(
          calendarStartDate
        );

      cellDate.setDate(
        calendarStartDate.getDate() +
        dateOffset
      );

      const cell =
        createCalendarCell(
          cellDate,
          currentDate,
          safeTasks,
          {
            onTaskClick:
              options.onTaskClick,

            onDateClick:
              options.onDateClick
          }
        );

      row.appendChild(
        cell
      );
    }

    tableBody.appendChild(
      row
    );
  }

  table.appendChild(
    tableBody
  );

  calendarTableArea.appendChild(
    table
  );
}