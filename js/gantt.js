import {
  getStatusClass,
  getTaskAssignee,
  isTaskExpired
} from "./filters.js";

const ganttChartArea =
  document.getElementById(
    "ganttChartArea"
  );

const DAY_WIDTH = 42;
const TASK_COLUMN_WIDTH = 180;

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

function createDate(value) {
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

function getMonthStartDate(
  currentDate
) {
  return new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
}

function getMonthEndDate(
  currentDate
) {
  return new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
}

function getDaysInMonth(
  currentDate
) {
  return getMonthEndDate(
    currentDate
  ).getDate();
}

function getDaysBetween(
  startDate,
  endDate
) {
  const startTime =
    Date.UTC(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );

  const endTime =
    Date.UTC(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );

  return Math.floor(
    (
      endTime -
      startTime
    ) /
    (
      1000 *
      60 *
      60 *
      24
    )
  );
}

function isSameDate(
  dateA,
  dateB
) {
  return (
    dateA.getFullYear() ===
      dateB.getFullYear() &&
    dateA.getMonth() ===
      dateB.getMonth() &&
    dateA.getDate() ===
      dateB.getDate()
  );
}

function hasValidTaskPeriod(
  task
) {
  if (
    !task ||
    typeof task !==
      "object"
  ) {
    return false;
  }

  const startDate =
    createDate(
      task.createdAt
    );

  const deadline =
    createDate(
      task.deadline
    );

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

function isTaskInMonth(
  task,
  monthStart,
  monthEnd
) {
  if (
    !hasValidTaskPeriod(task)
  ) {
    return false;
  }

  const taskStart =
    createDate(
      task.createdAt
    );

  const taskEnd =
    createDate(
      task.deadline
    );

  return (
    taskEnd.getTime() >=
      monthStart.getTime() &&
    taskStart.getTime() <=
      monthEnd.getTime()
  );
}

function getVisibleTaskPeriod(
  task,
  monthStart,
  monthEnd
) {
  const taskStart =
    createDate(
      task.createdAt
    );

  const taskEnd =
    createDate(
      task.deadline
    );

  if (
    !taskStart ||
    !taskEnd
  ) {
    return null;
  }

  const visibleStart =
    taskStart < monthStart
      ? monthStart
      : taskStart;

  const visibleEnd =
    taskEnd > monthEnd
      ? monthEnd
      : taskEnd;

  if (
    visibleStart > visibleEnd
  ) {
    return null;
  }

  return {
    startDate:
      visibleStart,

    endDate:
      visibleEnd
  };
}

function createEmptyMessage() {
  const message =
    document.createElement(
      "p"
    );

  message.classList.add(
    "gantt-empty"
  );

  message.textContent =
    "この月に該当するタスクはありません";

  return message;
}

function createDayCell(
  date,
  className
) {
  const cell =
    document.createElement(
      "div"
    );

  cell.classList.add(
    className
  );

  cell.style.width =
    `${DAY_WIDTH}px`;

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
      "gantt-today"
    );
  }

  return cell;
}

function createGanttHeader(
  currentDate
) {
  const header =
    document.createElement(
      "div"
    );

  header.classList.add(
    "gantt-header-row"
  );

  const taskHeader =
    document.createElement(
      "div"
    );

  taskHeader.classList.add(
    "gantt-task-header"
  );

  taskHeader.style.width =
    `${TASK_COLUMN_WIDTH}px`;

  taskHeader.textContent =
    "タスク";

  header.appendChild(
    taskHeader
  );

  const timelineHeader =
    document.createElement(
      "div"
    );

  timelineHeader.classList.add(
    "gantt-timeline-header"
  );

  const daysInMonth =
    getDaysInMonth(
      currentDate
    );

  timelineHeader.style.width =
    `${
      daysInMonth *
      DAY_WIDTH
    }px`;

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    const date =
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );

    const dayCell =
      createDayCell(
        date,
        "gantt-day-header"
      );

    dayCell.textContent =
      String(day);

    timelineHeader.appendChild(
      dayCell
    );
  }

  header.appendChild(
    timelineHeader
  );

  return header;
}

function createTimelineBackground(
  currentDate
) {
  const background =
    document.createElement(
      "div"
    );

  background.classList.add(
    "gantt-timeline-background"
  );

  const daysInMonth =
    getDaysInMonth(
      currentDate
    );

  background.style.width =
    `${
      daysInMonth *
      DAY_WIDTH
    }px`;

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    const date =
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );

    const cell =
      createDayCell(
        date,
        "gantt-day-cell"
      );

    background.appendChild(
      cell
    );
  }

  return background;
}

function createTaskInfo(
  task,
  onTaskClick
) {
  const taskInfo =
    document.createElement(
      "button"
    );

  taskInfo.type =
    "button";

  taskInfo.classList.add(
    "gantt-task-info"
  );

  taskInfo.style.width =
    `${TASK_COLUMN_WIDTH}px`;

  const title =
    document.createElement(
      "span"
    );

  title.classList.add(
    "gantt-task-title"
  );

  title.textContent =
    task.title || "無題";

  const assignee =
    document.createElement(
      "span"
    );

  assignee.classList.add(
    "gantt-task-assignee"
  );

  assignee.textContent =
    `担当者：${getTaskAssignee(task)}`;

  taskInfo.appendChild(
    title
  );

  taskInfo.appendChild(
    assignee
  );

  taskInfo.addEventListener(
    "click",
    function () {
      runCallback(
        onTaskClick,
        task
      );
    }
  );

  return taskInfo;
}

function createTaskBar(
  task,
  monthStart,
  monthEnd,
  onTaskClick
) {
  const visiblePeriod =
    getVisibleTaskPeriod(
      task,
      monthStart,
      monthEnd
    );

  if (!visiblePeriod) {
    return null;
  }

  const startOffset =
    getDaysBetween(
      monthStart,
      visiblePeriod.startDate
    );

  const visibleDays =
    getDaysBetween(
      visiblePeriod.startDate,
      visiblePeriod.endDate
    ) + 1;

  const bar =
    document.createElement(
      "button"
    );

  bar.type =
    "button";

  bar.classList.add(
    "gantt-task-bar"
  );

  const statusClass =
    getStatusClass(
      task.status
    );

  if (statusClass) {
    bar.classList.add(
      statusClass
    );
  }

  if (
    isTaskExpired(task)
  ) {
    bar.classList.add(
      "expired"
    );
  }

  bar.style.left =
    `${
      startOffset *
      DAY_WIDTH +
      3
    }px`;

  bar.style.width =
    `${
      visibleDays *
      DAY_WIDTH -
      6
    }px`;

  bar.textContent =
    task.title || "無題";

  bar.title =
    `${task.title || "無題"}\n` +
    `担当者：${getTaskAssignee(task)}\n` +
    `開始日：${task.createdAt}\n` +
    `締切日：${task.deadline}`;

  bar.addEventListener(
    "click",
    function () {
      runCallback(
        onTaskClick,
        task
      );
    }
  );

  return bar;
}

function createGanttRow(
  task,
  currentDate,
  onTaskClick
) {
  const row =
    document.createElement(
      "div"
    );

  row.classList.add(
    "gantt-data-row"
  );

  const taskInfo =
    createTaskInfo(
      task,
      onTaskClick
    );

  row.appendChild(
    taskInfo
  );

  const timeline =
    document.createElement(
      "div"
    );

  timeline.classList.add(
    "gantt-row-timeline"
  );

  const daysInMonth =
    getDaysInMonth(
      currentDate
    );

  timeline.style.width =
    `${
      daysInMonth *
      DAY_WIDTH
    }px`;

  timeline.appendChild(
    createTimelineBackground(
      currentDate
    )
  );

  const monthStart =
    getMonthStartDate(
      currentDate
    );

  const monthEnd =
    getMonthEndDate(
      currentDate
    );

  const taskBar =
    createTaskBar(
      task,
      monthStart,
      monthEnd,
      onTaskClick
    );

  if (taskBar) {
    timeline.appendChild(
      taskBar
    );
  }

  row.appendChild(
    timeline
  );

  return row;
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
    !Array.isArray(
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
        firstArgument.onTaskClick
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
      callbacks.onTaskClick
  };
}

export function renderGantt(
  firstArgument,
  secondArgument,
  thirdArgument
) {
  if (!ganttChartArea) {
    console.error(
      "ganttChartAreaが見つかりません"
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
      "ガントチャートの表示月が不正です"
    );

    return;
  }

  const monthStart =
    getMonthStartDate(
      currentDate
    );

  const monthEnd =
    getMonthEndDate(
      currentDate
    );

  const safeTasks =
    Array.isArray(
      options.filteredTasks
    )
      ? options.filteredTasks.filter(
          function (task) {
            return isTaskInMonth(
              task,
              monthStart,
              monthEnd
            );
          }
        )
      : [];

  ganttChartArea.innerHTML =
    "";

  if (
    safeTasks.length === 0
  ) {
    ganttChartArea.appendChild(
      createEmptyMessage()
    );

    return;
  }

  const wrapper =
    document.createElement(
      "div"
    );

  wrapper.classList.add(
    "gantt-scroll-area"
  );

  const chart =
    document.createElement(
      "div"
    );

  chart.classList.add(
    "gantt-chart"
  );

  const daysInMonth =
    getDaysInMonth(
      currentDate
    );

  chart.style.width =
    `${
      TASK_COLUMN_WIDTH +
      daysInMonth *
        DAY_WIDTH
    }px`;

  chart.appendChild(
    createGanttHeader(
      currentDate
    )
  );

  safeTasks.forEach(
    function (task) {
      chart.appendChild(
        createGanttRow(
          task,
          currentDate,
          options.onTaskClick
        )
      );
    }
  );

  wrapper.appendChild(
    chart
  );

  ganttChartArea.appendChild(
    wrapper
  );
}