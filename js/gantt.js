import {
  getStatusClass,
  getTaskAssignee,
  isTaskExpired
} from "./filters.js";

const ganttArea =
  document.getElementById(
    "ganttArea"
  );

const ganttTitle =
  document.getElementById(
    "ganttTitle"
  );

const DAY_WIDTH = 42;

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

function normalizeDate(
  date
) {
  if (!isValidDate(date)) {
    return null;
  }

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function addDays(
  date,
  days
) {
  const result =
    normalizeDate(date);

  if (!result) {
    return null;
  }

  result.setDate(
    result.getDate() + days
  );

  return result;
}

function getDaysBetween(
  startDate,
  endDate
) {
  if (
    !isValidDate(startDate) ||
    !isValidDate(endDate)
  ) {
    return 0;
  }

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
    createSafeDate(
      task.createdAt
    );

  const deadline =
    createSafeDate(
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

function isTaskInDisplayPeriod(
  task,
  displayStart,
  displayEnd
) {
  if (
    !hasValidTaskPeriod(task)
  ) {
    return false;
  }

  const taskStart =
    createSafeDate(
      task.createdAt
    );

  const taskEnd =
    createSafeDate(
      task.deadline
    );

  return (
    taskEnd.getTime() >=
      displayStart.getTime() &&
    taskStart.getTime() <=
      displayEnd.getTime()
  );
}

function getVisibleTaskPeriod(
  task,
  displayStart,
  displayEnd
) {
  const taskStart =
    createSafeDate(
      task.createdAt
    );

  const taskEnd =
    createSafeDate(
      task.deadline
    );

  if (
    !taskStart ||
    !taskEnd
  ) {
    return null;
  }

  const visibleStart =
    taskStart.getTime() <
    displayStart.getTime()
      ? displayStart
      : taskStart;

  const visibleEnd =
    taskEnd.getTime() >
    displayEnd.getTime()
      ? displayEnd
      : taskEnd;

  return {
    startDate:
      visibleStart,

    endDate:
      visibleEnd
  };
}

function createEmptyMessage(
  text
) {
  const message =
    document.createElement(
      "p"
    );

  message.classList.add(
    "gantt-empty"
  );

  message.textContent =
    text;

  return message;
}

function createGanttHeader(
  currentDate
) {
  const header =
    document.createElement(
      "div"
    );

  header.classList.add(
    "gantt-header"
  );

  const taskHeader =
    document.createElement(
      "div"
    );

  taskHeader.classList.add(
    "gantt-task-header"
  );

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
    daysInMonth *
      DAY_WIDTH +
    "px";

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
      document.createElement(
        "div"
      );

    dayCell.classList.add(
      "gantt-day-header"
    );

    dayCell.style.width =
      DAY_WIDTH + "px";

    dayCell.textContent =
      String(day);

    if (
      date.getDay() === 0
    ) {
      dayCell.classList.add(
        "sunday"
      );
    }

    if (
      date.getDay() === 6
    ) {
      dayCell.classList.add(
        "saturday"
      );
    }

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
    daysInMonth *
      DAY_WIDTH +
    "px";

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
      document.createElement(
        "div"
      );

    cell.classList.add(
      "gantt-day-cell"
    );

    cell.style.width =
      DAY_WIDTH + "px";

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
      date.getFullYear() ===
        today.getFullYear() &&
      date.getMonth() ===
        today.getMonth() &&
      date.getDate() ===
        today.getDate()
    ) {
      cell.classList.add(
        "today"
      );
    }

    background.appendChild(
      cell
    );
  }

  return background;
}

function createTaskInfo(
  task
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
    getTaskAssignee(task);

  taskInfo.appendChild(
    title
  );

  taskInfo.appendChild(
    assignee
  );

  return taskInfo;
}

function createTaskBar(
  task,
  displayStart,
  displayEnd
) {
  const visiblePeriod =
    getVisibleTaskPeriod(
      task,
      displayStart,
      displayEnd
    );

  if (!visiblePeriod) {
    return null;
  }

  const startOffset =
    getDaysBetween(
      displayStart,
      visiblePeriod.startDate
    );

  const visibleDays =
    getDaysBetween(
      visiblePeriod.startDate,
      visiblePeriod.endDate
    ) + 1;

  if (
    startOffset < 0 ||
    visibleDays <= 0
  ) {
    return null;
  }

  const bar =
    document.createElement(
      "div"
    );

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
    startOffset *
      DAY_WIDTH +
    "px";

  bar.style.width =
    visibleDays *
      DAY_WIDTH -
    6 +
    "px";

  bar.textContent =
    task.title || "無題";

  bar.title =
    (task.title || "無題") +
    "\n担当者：" +
    getTaskAssignee(task) +
    "\n期間：" +
    task.createdAt +
    " ～ " +
    task.deadline;

  return bar;
}

function createGanttRow(
  task,
  currentDate,
  callbacks
) {
  const {
    onTaskClick
  } = callbacks;

  const displayStart =
    getMonthStartDate(
      currentDate
    );

  const displayEnd =
    getMonthEndDate(
      currentDate
    );

  const row =
    document.createElement(
      "div"
    );

  row.classList.add(
    "gantt-row"
  );

  const taskInfo =
    createTaskInfo(task);

  taskInfo.addEventListener(
    "click",
    function () {
      runCallback(
        onTaskClick,
        task
      );
    }
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

  timeline.style.width =
    getDaysInMonth(
      currentDate
    ) *
      DAY_WIDTH +
    "px";

  const background =
    createTimelineBackground(
      currentDate
    );

  timeline.appendChild(
    background
  );

  const bar =
    createTaskBar(
      task,
      displayStart,
      displayEnd
    );

  if (bar) {
    bar.addEventListener(
      "click",
      function () {
        runCallback(
          onTaskClick,
          task
        );
      }
    );

    timeline.appendChild(
      bar
    );
  }

  row.appendChild(
    timeline
  );

  return row;
}

function normalizeRenderOptions(
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
  if (!ganttArea) {
    console.error(
      "ガントチャート表示エリアが見つかりません"
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
      "ガントチャートの表示月が不正です",
      options.currentDate
    );

    return;
  }

  const displayStart =
    getMonthStartDate(
      currentDate
    );

  const displayEnd =
    getMonthEndDate(
      currentDate
    );

  const safeTasks =
    Array.isArray(
      options.filteredTasks
    )
      ? options.filteredTasks.filter(
          function (task) {
            return (
              hasValidTaskPeriod(
                task
              ) &&
              isTaskInDisplayPeriod(
                task,
                displayStart,
                displayEnd
              )
            );
          }
        )
      : [];

  if (ganttTitle) {
    ganttTitle.textContent =
      currentDate.getFullYear() +
      "年" +
      (
        currentDate.getMonth() +
        1
      ) +
      "月";
  }

  ganttArea.innerHTML =
    "";

  if (
    safeTasks.length === 0
  ) {
    ganttArea.appendChild(
      createEmptyMessage(
        "この月に該当するタスクがありません"
      )
    );

    return;
  }

  const wrapper =
    document.createElement(
      "div"
    );

  wrapper.classList.add(
    "gantt-wrapper"
  );

  const header =
    createGanttHeader(
      currentDate
    );

  wrapper.appendChild(
    header
  );

  safeTasks.forEach(
    function (task) {
      const row =
        createGanttRow(
          task,
          currentDate,
          {
            onTaskClick:
              options.onTaskClick
          }
        );

      wrapper.appendChild(
        row
      );
    }
  );

  ganttArea.appendChild(
    wrapper
  );
}