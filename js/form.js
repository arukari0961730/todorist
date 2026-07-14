import {
  addTask,
  getTodayString,
  createDateFromString
} from "./data.js";

const titleInput = document.getElementById("titleInput");
const descriptionInput = document.getElementById("descriptionInput");
const assigneeInput = document.getElementById("assigneeInput");
const startDateInput = document.getElementById("startDateInput");
const deadlineInput = document.getElementById("deadlineInput");
const statusInput = document.getElementById("statusInput");

const addBtn = document.getElementById("addBtn");
const errorMessage = document.getElementById("errorMessage");

function resetTaskForm() {
  titleInput.value = "";
  descriptionInput.value = "";
  assigneeInput.value = "";
  startDateInput.value = getTodayString();
  deadlineInput.value = "";
  statusInput.value = "todo";
}

function validateTaskInput(taskInput) {
  if (
    taskInput.title === "" ||
    taskInput.startDate === "" ||
    taskInput.deadline === ""
  ) {
    return "課題名、開始日、締切日は必須です";
  }

  if (taskInput.startDate > taskInput.deadline) {
    return "開始日は締切日より前の日付にしてください";
  }

  return "";
}

function createTaskFromInput() {
  return {
    id: Date.now(),
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    assignee: assigneeInput.value.trim(),
    createdAt: startDateInput.value,
    deadline: deadlineInput.value,
    status: statusInput.value
  };
}

export function setupTaskForm(callbacks) {
  const {
    onTaskAdded,
    onDateChange
  } = callbacks;

  startDateInput.value = getTodayString();

  addBtn.addEventListener("click", function () {
    const task = createTaskFromInput();

    const validationMessage = validateTaskInput({
      title: task.title,
      startDate: task.createdAt,
      deadline: task.deadline
    });

    if (validationMessage !== "") {
      errorMessage.textContent = validationMessage;
      return;
    }

    errorMessage.textContent = "";

    addTask(task);

    onDateChange(
      createDateFromString(task.deadline)
    );

    onTaskAdded();

    resetTaskForm();
  });
}