import {
  addTask,
  getTodayString,
  createDateFromString
} from "./data.js";

const titleInput =
  document.getElementById("titleInput");

const descriptionInput =
  document.getElementById("descriptionInput");

const assigneeInput =
  document.getElementById("assigneeInput");

const startDateInput =
  document.getElementById("startDateInput");

const deadlineInput =
  document.getElementById("deadlineInput");

const statusInput =
  document.getElementById("statusInput");

const addBtn =
  document.getElementById("addBtn");

const errorMessage =
  document.getElementById("errorMessage");

let isTaskFormInitialized = false;
let isAddingTask = false;

function setInputValue(
  element,
  value
) {
  if (!element) {
    return;
  }

  element.value = value;
}

function setErrorMessage(
  message
) {
  if (!errorMessage) {
    return;
  }

  errorMessage.textContent =
    message;
}

function resetTaskForm() {
  setInputValue(
    titleInput,
    ""
  );

  setInputValue(
    descriptionInput,
    ""
  );

  setInputValue(
    assigneeInput,
    ""
  );

  setInputValue(
    startDateInput,
    getTodayString()
  );

  setInputValue(
    deadlineInput,
    ""
  );

  setInputValue(
    statusInput,
    "todo"
  );

  setErrorMessage("");
}

function getInputValue(
  element
) {
  if (!element) {
    return "";
  }

  return element.value;
}

function getTrimmedInputValue(
  element
) {
  return getInputValue(
    element
  ).trim();
}

function validateTaskInput(
  taskInput
) {
  if (
    taskInput.title === "" ||
    taskInput.startDate === "" ||
    taskInput.deadline === ""
  ) {
    return "課題名、開始日、締切日は必須です";
  }

  if (
    taskInput.startDate >
    taskInput.deadline
  ) {
    return "開始日は締切日より前の日付にしてください";
  }

  return "";
}

function createTaskFromInput() {
  return {
    id:
      Date.now(),

    title:
      getTrimmedInputValue(
        titleInput
      ),

    description:
      getTrimmedInputValue(
        descriptionInput
      ),

    assignee:
      getTrimmedInputValue(
        assigneeInput
      ),

    createdAt:
      getInputValue(
        startDateInput
      ),

    deadline:
      getInputValue(
        deadlineInput
      ),

    status:
      getInputValue(
        statusInput
      ) || "todo"
  };
}

function hasRequiredFormElements() {
  return (
    titleInput &&
    descriptionInput &&
    assigneeInput &&
    startDateInput &&
    deadlineInput &&
    statusInput &&
    addBtn
  );
}

function setAddButtonDisabled(
  disabled
) {
  if (!addBtn) {
    return;
  }

  addBtn.disabled =
    disabled;
}

function handleTaskAddition(
  callbacks
) {
  if (isAddingTask) {
    return;
  }

  const {
    onTaskAdded,
    onDateChange
  } = callbacks;

  const task =
    createTaskFromInput();

  const validationMessage =
    validateTaskInput({
      title:
        task.title,

      startDate:
        task.createdAt,

      deadline:
        task.deadline
    });

  if (
    validationMessage !== ""
  ) {
    setErrorMessage(
      validationMessage
    );

    return;
  }

  isAddingTask = true;

  setAddButtonDisabled(
    true
  );

  setErrorMessage("");

  try {
    addTask(task);

    if (
      typeof onDateChange ===
      "function"
    ) {
      onDateChange(
        createDateFromString(
          task.deadline
        )
      );
    }

    if (
      typeof onTaskAdded ===
      "function"
    ) {
      onTaskAdded();
    }

    resetTaskForm();
  } catch (error) {
    console.error(
      "タスクの追加に失敗しました",
      error
    );

    setErrorMessage(
      "タスクの追加に失敗しました"
    );
  } finally {
    isAddingTask = false;

    setAddButtonDisabled(
      false
    );
  }
}

export function setupTaskForm(
  callbacks = {}
) {
  if (isTaskFormInitialized) {
    return;
  }

  if (
    !hasRequiredFormElements()
  ) {
    console.error(
      "タスク追加フォームのHTML要素が不足しています"
    );

    return;
  }

  setInputValue(
    startDateInput,
    getTodayString()
  );

  addBtn.addEventListener(
    "click",
    function () {
      handleTaskAddition(
        callbacks
      );
    }
  );

  isTaskFormInitialized = true;
}