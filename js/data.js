import {
  getFallbackTeamId,
  hasTeam
} from "./teams.js";

export const STATUS_LIST = [
  {
    value: "todo",
    label: "未着手"
  },
  {
    value: "working",
    label: "作業中"
  },
  {
    value: "review",
    label: "確認中"
  },
  {
    value: "fix",
    label: "修正中"
  },
  {
    value: "done",
    label: "完了"
  }
];

const STORAGE_KEY = "tasks";

const VALID_STATUS_VALUES =
  STATUS_LIST.map(
    function (status) {
      return status.value;
    }
  );

export const tasks = [];

function isPlainObject(
  value
) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function createSafeText(
  value,
  fallback = ""
) {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  const text =
    String(value).trim();

  return text !== ""
    ? text
    : fallback;
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

export function createDateFromString(
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
    typeof value !== "string"
  ) {
    return null;
  }

  const trimmedValue =
    value.trim();

  const dateParts =
    trimmedValue.split("-");

  if (
    dateParts.length !== 3
  ) {
    return null;
  }

  const year =
    Number(
      dateParts[0]
    );

  const month =
    Number(
      dateParts[1]
    );

  const day =
    Number(
      dateParts[2]
    );

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

export function formatDateString(
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

export function getTodayString() {
  const today =
    new Date();

  return formatDateString(
    today
  );
}

function normalizeStatus(
  status
) {
  const normalizedStatus =
    createSafeText(
      status,
      "todo"
    );

  if (
    VALID_STATUS_VALUES.includes(
      normalizedStatus
    )
  ) {
    return normalizedStatus;
  }

  return "todo";
}

function normalizeTeamId(
  teamId
) {
  const normalizedTeamId =
    createSafeText(teamId);

  if (
    normalizedTeamId !== "" &&
    hasTeam(normalizedTeamId)
  ) {
    return normalizedTeamId;
  }

  return getFallbackTeamId();
}

function createUniqueTaskId() {
  let newId =
    Date.now();

  while (
    tasks.some(
      function (task) {
        return (
          task.id === newId
        );
      }
    )
  ) {
    newId++;
  }

  return newId;
}

function normalizeTaskId(
  id
) {
  const numberId =
    Number(id);

  if (
    Number.isSafeInteger(numberId) &&
    numberId > 0
  ) {
    return numberId;
  }

  return createUniqueTaskId();
}

function normalizeDateString(
  value,
  fallback = ""
) {
  const date =
    createDateFromString(
      value
    );

  if (!date) {
    return fallback;
  }

  return formatDateString(
    date
  );
}

function getOldTaskStartDate(
  task
) {
  return (
    task.createdAt ??
    task.startDate ??
    task.addedAt ??
    getTodayString()
  );
}

function getOldTaskDeadline(
  task
) {
  return (
    task.deadline ??
    task.endDate ??
    task.dueDate ??
    ""
  );
}

function normalizeTask(
  task
) {
  if (!isPlainObject(task)) {
    return null;
  }

  const title =
    createSafeText(
      task.title ??
      task.name
    );

  if (title === "") {
    return null;
  }

  const startDate =
    normalizeDateString(
      getOldTaskStartDate(task),
      getTodayString()
    );

  const deadline =
    normalizeDateString(
      getOldTaskDeadline(task),
      startDate
    );

  let normalizedStartDate =
    startDate;

  let normalizedDeadline =
    deadline;

  const startDateObject =
    createDateFromString(
      normalizedStartDate
    );

  const deadlineObject =
    createDateFromString(
      normalizedDeadline
    );

  if (
    startDateObject &&
    deadlineObject &&
    startDateObject.getTime() >
      deadlineObject.getTime()
  ) {
    normalizedStartDate =
      normalizedDeadline;
  }

  return {
    id:
      normalizeTaskId(
        task.id
      ),

    teamId:
      normalizeTeamId(
        task.teamId ??
        task.groupId ??
        task.projectId
      ),

    title,

    description:
      createSafeText(
        task.description ??
        task.detail ??
        task.details
      ),

    assignee:
      createSafeText(
        task.assignee ??
        task.person ??
        task.owner
      ),

    createdAt:
      normalizedStartDate,

    deadline:
      normalizedDeadline,

    status:
      normalizeStatus(
        task.status
      )
  };
}

function removeDuplicateIds(
  taskArray
) {
  const usedIds =
    new Set();

  return taskArray.map(
    function (task) {
      if (
        !usedIds.has(
          task.id
        )
      ) {
        usedIds.add(
          task.id
        );

        return task;
      }

      let newId =
        Date.now();

      while (
        usedIds.has(newId)
      ) {
        newId++;
      }

      usedIds.add(
        newId
      );

      return {
        ...task,
        id: newId
      };
    }
  );
}

function normalizeTaskArray(
  value
) {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalizedTasks =
    value
      .map(
        function (task) {
          return normalizeTask(
            task
          );
        }
      )
      .filter(
        function (task) {
          return task !== null;
        }
      );

  return removeDuplicateIds(
    normalizedTasks
  );
}

function replaceTasks(
  newTasks
) {
  tasks.splice(
    0,
    tasks.length,
    ...newTasks
  );
}

function getStoredTaskArray(
  parsedData
) {
  if (
    Array.isArray(parsedData)
  ) {
    return parsedData;
  }

  if (
    isPlainObject(parsedData) &&
    Array.isArray(
      parsedData.tasks
    )
  ) {
    return parsedData.tasks;
  }

  return [];
}

export function loadTasks() {
  let storedText;

  try {
    storedText =
      localStorage.getItem(
        STORAGE_KEY
      );
  } catch (error) {
    console.error(
      "localStorageの読み込みに失敗しました",
      error
    );

    replaceTasks([]);

    return tasks;
  }

  if (!storedText) {
    replaceTasks([]);

    return tasks;
  }

  try {
    const parsedData =
      JSON.parse(
        storedText
      );

    const storedTasks =
      getStoredTaskArray(
        parsedData
      );

    const normalizedTasks =
      normalizeTaskArray(
        storedTasks
      );

    replaceTasks(
      normalizedTasks
    );

    saveTasks();

    return tasks;
  } catch (error) {
    console.error(
      "保存されたタスクデータが壊れています",
      error
    );

    backupBrokenStorageData(
      storedText
    );

    replaceTasks([]);

    try {
      localStorage.removeItem(
        STORAGE_KEY
      );
    } catch (
      removeError
    ) {
      console.error(
        "壊れたデータの削除に失敗しました",
        removeError
      );
    }

    return tasks;
  }
}

function backupBrokenStorageData(
  brokenData
) {
  const backupKey =
    STORAGE_KEY +
    "_broken_" +
    Date.now();

  try {
    localStorage.setItem(
      backupKey,
      brokenData
    );

    console.warn(
      "壊れたデータをバックアップしました:",
      backupKey
    );
  } catch (error) {
    console.error(
      "壊れたデータのバックアップに失敗しました",
      error
    );
  }
}

export function saveTasks() {
  const normalizedTasks =
    normalizeTaskArray(
      tasks
    );

  replaceTasks(
    normalizedTasks
  );

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        tasks
      )
    );

    return true;
  } catch (error) {
    console.error(
      "タスクの保存に失敗しました",
      error
    );

    return false;
  }
}

export function addTask(
  taskData
) {
  if (!isPlainObject(taskData)) {
    throw new Error(
      "追加するタスクデータが不正です"
    );
  }

  const normalizedTask =
    normalizeTask({
      ...taskData,
      id:
        normalizeTaskId(
          taskData.id
        )
    });

  if (!normalizedTask) {
    throw new Error(
      "課題名が入力されていません"
    );
  }

  const startDate =
    createDateFromString(
      normalizedTask.createdAt
    );

  const deadline =
    createDateFromString(
      normalizedTask.deadline
    );

  if (
    !startDate ||
    !deadline
  ) {
    throw new Error(
      "開始日または締切日が不正です"
    );
  }

  if (
    startDate.getTime() >
    deadline.getTime()
  ) {
    throw new Error(
      "開始日は締切日より前にしてください"
    );
  }

  if (
    tasks.some(
      function (task) {
        return (
          task.id ===
          normalizedTask.id
        );
      }
    )
  ) {
    normalizedTask.id =
      createUniqueTaskId();
  }

  tasks.push(
    normalizedTask
  );

  const saved =
    saveTasks();

  if (!saved) {
    tasks.pop();

    throw new Error(
      "タスクを保存できませんでした"
    );
  }

  return normalizedTask;
}

export function updateTask(
  taskId,
  updatedData
) {
  const normalizedId =
    Number(taskId);

  if (
    !Number.isSafeInteger(
      normalizedId
    )
  ) {
    return null;
  }

  if (
    !isPlainObject(
      updatedData
    )
  ) {
    return null;
  }

  const taskIndex =
    tasks.findIndex(
      function (task) {
        return (
          task.id ===
          normalizedId
        );
      }
    );

  if (
    taskIndex === -1
  ) {
    return null;
  }

  const oldTask = {
    ...tasks[taskIndex]
  };

  const mergedTask =
    normalizeTask({
      ...oldTask,
      ...updatedData,
      id: oldTask.id
    });

  if (!mergedTask) {
    return null;
  }

  const startDate =
    createDateFromString(
      mergedTask.createdAt
    );

  const deadline =
    createDateFromString(
      mergedTask.deadline
    );

  if (
    !startDate ||
    !deadline ||
    startDate.getTime() >
      deadline.getTime()
  ) {
    return null;
  }

  tasks[taskIndex] =
    mergedTask;

  const saved =
    saveTasks();

  if (!saved) {
    tasks[taskIndex] =
      oldTask;

    return null;
  }

  return mergedTask;
}

export function deleteTask(
  taskId
) {
  const normalizedId =
    Number(taskId);

  if (
    !Number.isSafeInteger(
      normalizedId
    )
  ) {
    return false;
  }

  const taskIndex =
    tasks.findIndex(
      function (task) {
        return (
          task.id ===
          normalizedId
        );
      }
    );

  if (
    taskIndex === -1
  ) {
    return false;
  }

  const deletedTask =
    tasks[taskIndex];

  tasks.splice(
    taskIndex,
    1
  );

  const saved =
    saveTasks();

  if (!saved) {
    tasks.splice(
      taskIndex,
      0,
      deletedTask
    );

    return false;
  }

  return true;
}

export function getTaskById(
  taskId
) {
  const normalizedId =
    Number(taskId);

  if (
    !Number.isSafeInteger(
      normalizedId
    )
  ) {
    return null;
  }

  return (
    tasks.find(
      function (task) {
        return (
          task.id ===
          normalizedId
        );
      }
    ) ?? null
  );
}

export function getTasksByTeamId(
  teamId
) {
  const normalizedTeamId =
    createSafeText(teamId);

  return tasks.filter(
    function (task) {
      return (
        task.teamId ===
        normalizedTeamId
      );
    }
  );
}

export function deleteTasksByTeamId(
  teamId
) {
  const normalizedTeamId =
    createSafeText(teamId);

  if (normalizedTeamId === "") {
    return false;
  }

  const oldTasks =
    tasks.map(
      function (task) {
        return {
          ...task
        };
      }
    );

  const remainingTasks =
    tasks.filter(
      function (task) {
        return (
          task.teamId !==
          normalizedTeamId
        );
      }
    );

  replaceTasks(
    remainingTasks
  );

  const saved =
    saveTasks();

  if (!saved) {
    replaceTasks(
      oldTasks
    );

    return false;
  }

  return true;
}

export function clearTasks() {
  const oldTasks =
    tasks.map(
      function (task) {
        return {
          ...task
        };
      }
    );

  replaceTasks([]);

  try {
    localStorage.removeItem(
      STORAGE_KEY
    );

    return true;
  } catch (error) {
    console.error(
      "タスクデータの削除に失敗しました",
      error
    );

    replaceTasks(
      oldTasks
    );

    return false;
  }
}

export function exportTasks() {
  return JSON.stringify(
    tasks,
    null,
    2
  );
}

export function importTasks(
  jsonText
) {
  if (
    typeof jsonText !==
    "string"
  ) {
    return false;
  }

  try {
    const parsedData =
      JSON.parse(
        jsonText
      );

    const importedTaskArray =
      getStoredTaskArray(
        parsedData
      );

    const normalizedTasks =
      normalizeTaskArray(
        importedTaskArray
      );

    const oldTasks =
      tasks.map(
        function (task) {
          return {
            ...task
          };
        }
      );

    replaceTasks(
      normalizedTasks
    );

    const saved =
      saveTasks();

    if (!saved) {
      replaceTasks(
        oldTasks
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "タスクデータの読み込みに失敗しました",
      error
    );

    return false;
  }
}

loadTasks();