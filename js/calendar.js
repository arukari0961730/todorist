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

const CALENDAR_WEEK_COUNT = 6;
const DAYS_PER_WEEK = 7;

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

function isValidDate(
  date
) {
  return (
    date instanceof Date &&
    !Number.isNaN(
      date.getTime()
    )
  );
}

function createSafeDate(
  value
) {
  if (
    value instanceof Date
  ) {
    const copiedDate =
      new Date(
        value.getFullYear(),
        value.getMonth(),
        value.getDate()
      );

    return isValidDate(
      copiedDate
    )
      ? copiedDate
      : null;
  }

  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const dateParts =
    value.split("-");

  if (
    dateParts.length !== 3
  ) {
    return null;
  }

  const year =
    Number(dateParts[0]);

  const month =
    Number(dateParts[1]);

  const day =
    Number(dateParts[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

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
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return (
    year +
    "-" +
    month +
    "-" +
    day
  );
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

function getTaskStartDate(
  task
) {
  if (!task) {
    return null;
  }

  return createSafeDate(
    task.createdAt
  );
}

function getTaskDeadline(
  task
) {
  if (!task) {
    return null;
  }

  return createSafeDate(
    task.deadline
  );
}

function hasValidTaskPeriod(
  task
) {
  const startDate =
    getTaskStartDate(task);

  const deadline =
    getTaskDeadline(task);

  if (
    !startDate ||
    !deadline
  ) {
    return false;
  }

  return (
    startDate.getTime() <=
    deadline.getTime()
  );
}

function isTaskOnDate(
  task,
  targetDate
) {
  if (
    !hasValidTaskPeriod(task) ||
    !isValidDate(targetDate)
  ) {
    return false;
  }

  const startDate =
    getTaskStartDate(task);

  const deadline =
    getTaskDeadline(task);

  const targetTime =
    targetDate.getTime();

  return (
    startDate.getTime() <=
      targetTime &&
    deadline.getTime() >=
      targetTime
  );
}

function createDayHeader() {
  const headerRow =
    document.createElement(
      "tr"
    );

  DAY_LABELS.forEach(
    function (dayLabel, index) {
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

function createTaskItem(
  task,
  onTaskClick
) {
  const taskItem =
    document.createElement(
      "button"
    );

  taskItem.type = "button";

  taskItem.classList.add(
    "calendar-task"
  );

  const statusClass =
    getStatusClass(
      task.status
    );

  if (statusClass) {
    taskItem.classList.add(
      statusClass
    );
  }

  if (
    isTaskExpired(task)
  ) {
    taskItem.classList.add(
      "expired"
    );
  }

  taskItem.textContent =
    task.title || "無題";

  taskItem.title =
    (task.title || "無題") +
    "\n担当者：" +
    getTaskAssignee(task) +
    "\n期間：" +
    task.createdAt +
    " ～ " +
    task.deadline;

  taskItem.addEventListener(
    "click",
    function (event) {
      event.stopPropagation();

      runCallback(
        onTaskClick,
        task
      );
    }
  );

  return taskItem;
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

  const today =
    new Date();

  if (
    isSameDate(
      date,
      today
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
    "calendar-day-number"
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
        return isTaskOnDate(
          task,
          date
        );
      }
    );

  dateTasks.forEach(
    function (task) {
      const taskItem =
        createTaskItem(
          task,
          onTaskClick
        );

      taskArea.appendChild(
        taskItem
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

function normalizeRenderOptions(
  firstArgument,
  secondArgument,
  thirdArgument
) {
  if (
    firstArgument &&
    typeof firstArgument === "object" &&
    !(firstArgument instanceof Date) &&
    (
      "currentDate" in firstArgument ||
      "filteredTasks" in firstArgument ||
      "tasks" in firstArgument
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
    typeof thirdArgument === "object"
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
      "カレンダー表示エリアが見つかりません"
    );

    return;
  }

  const options =
    normalizeRenderOptions(
      firstArgument,
      secondArgument,
      thirdArgument
    );

  const currentDate =
    createSafeDate(
      options.currentDate
    );

  if (!currentDate) {
    console.error(
      "カレンダーの表示月が不正です",
      options.currentDate
    );

    return;
  }

  const safeTasks =
    Array.isArray(
      options.filteredTasks
    )
      ? options.filteredTasks.filter(
          function (task) {
            return (
              task &&
              hasValidTaskPeriod(task)
            );
          }
        )
      : [];

  if (monthTitle) {
    monthTitle.textContent =
      currentDate.getFullYear() +
      "年" +
      (
        currentDate.getMonth() +
        1
      ) +
      "月";
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
    weekIndex <
    CALENDAR_WEEK_COUNT;
    weekIndex++
  ) {
    const row =
      document.createElement(
        "tr"
      );

    for (
      let dayIndex = 0;
      dayIndex <
      DAYS_PER_WEEK;
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