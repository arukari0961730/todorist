export const STATUS_LIST = [
  { value: "todo", label: "未着手" },
  { value: "working", label: "作業中" },
  { value: "review", label: "確認待ち" },
  { value: "fix", label: "修正中" },
  { value: "done", label: "完了" }
];

export const STATUS_ORDER = {
  todo: 1,
  working: 2,
  review: 3,
  fix: 4,
  done: 5
};

function loadTasks() {
  const savedTasks = localStorage.getItem("tasks");

  if (!savedTasks) {
    return [];
  }

  try {
    const parsedTasks = JSON.parse(savedTasks);

    if (!Array.isArray(parsedTasks)) {
      return [];
    }

    return parsedTasks;
  } catch (error) {
    console.error("タスクの読み込みに失敗しました", error);
    return [];
  }
}

export let tasks = loadTasks();

export function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

export function addTask(task) {
  tasks.push(task);
  saveTasks();
}

export function deleteTask(taskId) {
  tasks = tasks.filter(function (task) {
    return task.id !== taskId;
  });

  saveTasks();
}

export function getTodayString() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function createDateFromString(dateString) {
  if (!dateString) {
    return new Date();
  }

  const year = Number(dateString.slice(0, 4));
  const month = Number(dateString.slice(5, 7)) - 1;
  const day = Number(dateString.slice(8, 10));

  return new Date(year, month, day);
}

export function normalizeTasks() {
  tasks.forEach(function (task) {
    if (!task.title) {
      task.title = "";
    }

    if (!task.description) {
      task.description = "";
    }

    if (!task.assignee) {
      task.assignee = "";
    }

    if (!task.createdAt) {
      task.createdAt = task.deadline || getTodayString();
    }

    if (!task.deadline) {
      task.deadline = task.createdAt;
    }

    if (!task.status) {
      task.status = task.completed === true ? "done" : "todo";
    }

    delete task.completed;
  });

  saveTasks();
}