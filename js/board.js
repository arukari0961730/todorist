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
  document.getElementById(
    "boardContentArea"
  );

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

function createEmptyMessage(
  text
) {
  const message =
    document.createElement(
      "p"
    );

  message.textContent =
    text;

  return message;
}

function findTaskById(
  taskId
) {
  return tasks.find(
    function (task) {
      return task.id === taskId;
    }
  );
}

function isValidTaskId(
  taskId
) {
  return (
    Number.isFinite(taskId) &&
    taskId > 0
  );
}

function handleTaskDrop(
  event,
  targetStatus,
  onTaskChange
) {
  event.preventDefault();

  const taskIdText =
    event.dataTransfer.getData(
      "taskId"
    );

  const taskId =
    Number(taskIdText);

  if (
    !isValidTaskId(
      taskId
    )
  ) {
    console.error(
      "ドラッグされたタスクIDが不正です:",
      taskIdText
    );

    return;
  }

  const targetTask =
    findTaskById(
      taskId
    );

  if (!targetTask) {
    console.error(
      "移動対象のタスクが見つかりません:",
      taskId
    );

    return;
  }

  if (
    targetTask.status ===
    targetStatus
  ) {
    return;
  }

  targetTask.status =
    targetStatus;

  try {
    saveTasks();

    runCallback(
      onTaskChange
    );
  } catch (error) {
    console.error(
      "ボード上のタスク移動に失敗しました",
      error
    );
  }
}

function createBoardColumn(
  status,
  statusTasks,
  callbacks
) {
  const {
    onTaskClick,
    onTaskChange
  } = callbacks;

  const column =
    document.createElement(
      "div"
    );

  column.classList.add(
    "board-column"
  );

  column.dataset.status =
    status.value;

  column.addEventListener(
    "dragover",
    function (event) {
      event.preventDefault();

      column.classList.add(
        "drag-over"
      );
    }
  );

  column.addEventListener(
    "dragleave",
    function (event) {
      if (
        column.contains(
          event.relatedTarget
        )
      ) {
        return;
      }

      column.classList.remove(
        "drag-over"
      );
    }
  );

  column.addEventListener(
    "drop",
    function (event) {
      column.classList.remove(
        "drag-over"
      );

      handleTaskDrop(
        event,
        status.value,
        onTaskChange
      );
    }
  );

  const heading =
    document.createElement(
      "h4"
    );

  heading.textContent =
    status.label +
    "（" +
    statusTasks.length +
    "）";

  column.appendChild(
    heading
  );

  if (
    statusTasks.length === 0
  ) {
    const emptyText =
      createEmptyMessage(
        "なし"
      );

    emptyText.classList.add(
      "task-list-meta"
    );

    column.appendChild(
      emptyText
    );
  }

  statusTasks.forEach(
    function (task) {
      const card =
        createBoardCard(
          task,
          onTaskClick
        );

      column.appendChild(
        card
      );
    }
  );

  return column;
}

function createBoardCard(
  task,
  onTaskClick
) {
  const card =
    document.createElement(
      "div"
    );

  card.classList.add(
    "board-card"
  );

  card.classList.add(
    getStatusClass(
      task.status
    )
  );

  card.draggable =
    true;

  const expired =
    isTaskExpired(
      task
    );

  if (expired) {
    card.classList.add(
      "expired"
    );
  }

  card.addEventListener(
    "dragstart",
    function (event) {
      event.dataTransfer.effectAllowed =
        "move";

      event.dataTransfer.setData(
        "taskId",
        String(task.id)
      );

      card.classList.add(
        "dragging"
      );
    }
  );

  card.addEventListener(
    "dragend",
    function () {
      card.classList.remove(
        "dragging"
      );

      const columns =
        document.querySelectorAll(
          ".board-column"
        );

      columns.forEach(
        function (column) {
          column.classList.remove(
            "drag-over"
          );
        }
      );
    }
  );

  const title =
    document.createElement(
      "div"
    );

  title.classList.add(
    "board-card-title"
  );

  title.textContent =
    expired
      ? "⚠ " +
        task.title
      : task.title;

  const meta =
    document.createElement(
      "div"
    );

  meta.classList.add(
    "board-card-meta"
  );

  meta.textContent =
    "担当者：" +
    getTaskAssignee(task) +
    " / 締切：" +
    task.deadline;

  card.appendChild(
    title
  );

  card.appendChild(
    meta
  );

  card.addEventListener(
    "click",
    function () {
      runCallback(
        onTaskClick,
        task
      );
    }
  );

  return card;
}

export function renderBoard(
  options = {}
) {
  if (!boardContentArea) {
    console.error(
      "ボード表示エリアが見つかりません"
    );

    return;
  }

  const {
    filteredTasks = [],
    onTaskClick,
    onTaskChange
  } = options;

  const safeTasks =
    Array.isArray(
      filteredTasks
    )
      ? filteredTasks
      : [];

  boardContentArea.innerHTML =
    "";

  if (
    safeTasks.length === 0
  ) {
    boardContentArea.appendChild(
      createEmptyMessage(
        "該当するタスクがありません"
      )
    );

    return;
  }

  const columns =
    document.createElement(
      "div"
    );

  columns.classList.add(
    "board-columns"
  );

  STATUS_LIST.forEach(
    function (status) {
      const statusTasks =
        safeTasks.filter(
          function (task) {
            return (
              task.status ===
              status.value
            );
          }
        );

      const column =
        createBoardColumn(
          status,
          statusTasks,
          {
            onTaskClick,
            onTaskChange
          }
        );

      columns.appendChild(
        column
      );
    }
  );

  boardContentArea.appendChild(
    columns
  );
}