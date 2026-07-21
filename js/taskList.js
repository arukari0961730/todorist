import {
  getStatusLabel,
  getStatusClass,
  getTaskAssignee,
  isTaskExpired
} from "./filters.js";

const taskListArea =
  document.getElementById(
    "taskListArea"
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

  message.classList.add(
    "task-list-empty"
  );

  message.textContent =
    text;

  return message;
}

function createSafeText(
  value,
  fallback = ""
) {
  if (
    typeof value !==
    "string"
  ) {
    return fallback;
  }

  const trimmedValue =
    value.trim();

  return trimmedValue !== ""
    ? trimmedValue
    : fallback;
}

function createSafeDate(
  value
) {
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

function formatDisplayDate(
  value
) {
  const date =
    createSafeDate(value);

  if (!date) {
    return "日付不明";
  }

  return (
    date.getFullYear() +
    "/" +
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    ) +
    "/" +
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    )
  );
}

function createTaskTitle(
  task
) {
  const title =
    document.createElement(
      "h4"
    );

  title.classList.add(
    "task-list-title"
  );

  title.textContent =
    createSafeText(
      task.title,
      "無題"
    );

  return title;
}

function createTaskDescription(
  task
) {
  const description =
    document.createElement(
      "p"
    );

  description.classList.add(
    "task-list-description"
  );

  description.textContent =
    createSafeText(
      task.description,
      "詳細なし"
    );

  return description;
}

function createStatusBadge(
  task
) {
  const badge =
    document.createElement(
      "span"
    );

  badge.classList.add(
    "status-badge"
  );

  const statusClass =
    getStatusClass(
      task.status
    );

  if (statusClass) {
    badge.classList.add(
      statusClass
    );
  }

  badge.textContent =
    getStatusLabel(
      task.status
    );

  return badge;
}

function createMetaItem(
  label,
  value
) {
  const item =
    document.createElement(
      "span"
    );

  item.classList.add(
    "task-list-meta-item"
  );

  item.textContent =
    label +
    "：" +
    value;

  return item;
}

function createTaskMeta(
  task
) {
  const meta =
    document.createElement(
      "div"
    );

  meta.classList.add(
    "task-list-meta"
  );

  const assignee =
    createMetaItem(
      "担当者",
      getTaskAssignee(task)
    );

  const startDate =
    createMetaItem(
      "開始日",
      formatDisplayDate(
        task.createdAt
      )
    );

  const deadline =
    createMetaItem(
      "締切日",
      formatDisplayDate(
        task.deadline
      )
    );

  meta.appendChild(
    assignee
  );

  meta.appendChild(
    startDate
  );

  meta.appendChild(
    deadline
  );

  return meta;
}

function createTaskCard(
  task,
  onTaskClick
) {
  const card =
    document.createElement(
      "article"
    );

  card.classList.add(
    "task-list-card"
  );

  card.tabIndex = 0;
  card.setAttribute(
    "role",
    "button"
  );

  const statusClass =
    getStatusClass(
      task.status
    );

  if (statusClass) {
    card.classList.add(
      statusClass
    );
  }

  const expired =
    isTaskExpired(task);

  if (expired) {
    card.classList.add(
      "expired"
    );
  }

  const header =
    document.createElement(
      "div"
    );

  header.classList.add(
    "task-list-header"
  );

  const title =
    createTaskTitle(task);

  const statusBadge =
    createStatusBadge(task);

  header.appendChild(
    title
  );

  header.appendChild(
    statusBadge
  );

  const description =
    createTaskDescription(task);

  const meta =
    createTaskMeta(task);

  card.appendChild(
    header
  );

  card.appendChild(
    description
  );

  card.appendChild(
    meta
  );

  if (expired) {
    const expiredText =
      document.createElement(
        "p"
      );

    expiredText.classList.add(
      "task-list-expired-text"
    );

    expiredText.textContent =
      "⚠ 締切を過ぎています";

    card.appendChild(
      expiredText
    );
  }

  card.addEventListener(
    "click",
    function () {
      runCallback(
        onTaskClick,
        task
      );
    }
  );

  card.addEventListener(
    "keydown",
    function (event) {
      if (
        event.key !== "Enter" &&
        event.key !== " "
      ) {
        return;
      }

      event.preventDefault();

      runCallback(
        onTaskClick,
        task
      );
    }
  );

  return card;
}

function normalizeRenderOptions(
  firstArgument,
  secondArgument
) {
  if (
    firstArgument &&
    typeof firstArgument ===
      "object" &&
    !Array.isArray(
      firstArgument
    )
  ) {
    return {
      filteredTasks:
        firstArgument.filteredTasks ??
        firstArgument.tasks ??
        [],

      onTaskClick:
        firstArgument.onTaskClick
    };
  }

  return {
    filteredTasks:
      firstArgument,

    onTaskClick:
      secondArgument
  };
}

export function renderTaskList(
  firstArgument,
  secondArgument
) {
  if (!taskListArea) {
    console.error(
      "タスク一覧の表示エリアが見つかりません"
    );

    return;
  }

  const options =
    normalizeRenderOptions(
      firstArgument,
      secondArgument
    );

  const safeTasks =
    Array.isArray(
      options.filteredTasks
    )
      ? options.filteredTasks.filter(
          function (task) {
            return (
              task &&
              typeof task ===
                "object"
            );
          }
        )
      : [];

  taskListArea.innerHTML =
    "";

  if (
    safeTasks.length === 0
  ) {
    taskListArea.appendChild(
      createEmptyMessage(
        "該当するタスクがありません"
      )
    );

    return;
  }

  const fragment =
    document.createDocumentFragment();

  safeTasks.forEach(
    function (task) {
      const card =
        createTaskCard(
          task,
          options.onTaskClick
        );

      fragment.appendChild(
        card
      );
    }
  );

  taskListArea.appendChild(
    fragment
  );
}