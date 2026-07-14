import {
  STATUS_LIST,
  saveTasks,
  deleteTask,
  createDateFromString
} from "./data.js";

import {
  getStatusLabel,
  getStatusClass,
  getTaskAssignee
} from "./filters.js";

const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");

export function closeModal() {
  modalOverlay.classList.add("hidden");
}

function renderStatusSelect(selectedStatus) {
  const select = document.createElement("select");
  select.classList.add("edit-select");

  STATUS_LIST.forEach(function (status) {
    const option = document.createElement("option");

    option.value = status.value;
    option.textContent = status.label;

    if (status.value === selectedStatus) {
      option.selected = true;
    }

    select.appendChild(option);
  });

  return select;
}

export function setupModalOverlay() {
  modalOverlay.addEventListener("click", function (event) {
    if (event.target === modalOverlay) {
      closeModal();
    }
  });
}

export function renderTaskDetail(task, callbacks) {
  const { onTaskChange, onDateChange } = callbacks;

  modalOverlay.classList.remove("hidden");
  modalContent.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = task.title;

  const description = document.createElement("p");

  description.textContent =
    task.description === ""
      ? "詳細：なし"
      : "詳細：" + task.description;

  const assignee = document.createElement("p");
  assignee.textContent = "担当者：" + getTaskAssignee(task);

  const startDate = document.createElement("p");
  startDate.textContent = "開始日：" + task.createdAt;

  const deadline = document.createElement("p");
  deadline.textContent = "締切日：" + task.deadline;

  const statusText = document.createElement("p");
  statusText.textContent = "状態：";

  const statusBadge = document.createElement("span");
  statusBadge.classList.add("status-badge");
  statusBadge.classList.add(getStatusClass(task.status));
  statusBadge.textContent = getStatusLabel(task.status);

  statusText.appendChild(statusBadge);

  const statusSelect = renderStatusSelect(task.status);

  const changeStatusBtn = document.createElement("button");
  changeStatusBtn.classList.add("modal-status-btn");
  changeStatusBtn.textContent = "状態を変更";

  changeStatusBtn.addEventListener("click", function () {
    task.status = statusSelect.value;

    saveTasks();
    onTaskChange();

    renderTaskDetail(task, callbacks);
  });

  const editBtn = document.createElement("button");
  editBtn.classList.add("modal-edit-btn");
  editBtn.textContent = "編集";

  editBtn.addEventListener("click", function () {
    renderEditForm(task, callbacks);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("modal-delete-btn");
  deleteBtn.textContent = "削除";

  deleteBtn.addEventListener("click", function () {
    const ok = confirm("この課題を削除しますか？");

    if (!ok) {
      return;
    }

    deleteTask(task.id);
    onTaskChange();
    closeModal();
  });

  const closeBtn = document.createElement("button");
  closeBtn.classList.add("modal-close-btn");
  closeBtn.textContent = "閉じる";

  closeBtn.addEventListener("click", function () {
    closeModal();
  });

  modalContent.appendChild(title);
  modalContent.appendChild(description);
  modalContent.appendChild(assignee);
  modalContent.appendChild(startDate);
  modalContent.appendChild(deadline);
  modalContent.appendChild(statusText);
  modalContent.appendChild(statusSelect);
  modalContent.appendChild(changeStatusBtn);
  modalContent.appendChild(editBtn);
  modalContent.appendChild(deleteBtn);
  modalContent.appendChild(closeBtn);
}

function renderEditForm(task, callbacks) {
  const { onTaskChange, onDateChange } = callbacks;

  modalOverlay.classList.remove("hidden");
  modalContent.innerHTML = "";

  const titleLabel = document.createElement("label");
  titleLabel.textContent = "課題名";

  const titleEdit = document.createElement("input");
  titleEdit.classList.add("edit-input");
  titleEdit.value = task.title;

  const descriptionLabel = document.createElement("label");
  descriptionLabel.textContent = "詳細";

  const descriptionEdit = document.createElement("textarea");
  descriptionEdit.classList.add("edit-textarea");
  descriptionEdit.value = task.description;

  const assigneeLabel = document.createElement("label");
  assigneeLabel.textContent = "担当者";

  const assigneeEdit = document.createElement("input");
  assigneeEdit.classList.add("edit-input");
  assigneeEdit.value = task.assignee || "";

  const startDateLabel = document.createElement("label");
  startDateLabel.textContent = "開始日";

  const startDateEdit = document.createElement("input");
  startDateEdit.classList.add("edit-input");
  startDateEdit.type = "date";
  startDateEdit.value = task.createdAt;

  const deadlineLabel = document.createElement("label");
  deadlineLabel.textContent = "締切日";

  const deadlineEdit = document.createElement("input");
  deadlineEdit.classList.add("edit-input");
  deadlineEdit.type = "date";
  deadlineEdit.value = task.deadline;

  const statusLabel = document.createElement("label");
  statusLabel.textContent = "状態";

  const statusEdit = renderStatusSelect(task.status);

  const saveBtn = document.createElement("button");
  saveBtn.classList.add("modal-save-btn");
  saveBtn.textContent = "保存";

  saveBtn.addEventListener("click", function () {
    const editedTitle = titleEdit.value.trim();
    const editedDescription = descriptionEdit.value.trim();
    const editedAssignee = assigneeEdit.value.trim();
    const editedStartDate = startDateEdit.value;
    const editedDeadline = deadlineEdit.value;
    const editedStatus = statusEdit.value;

    if (
      editedTitle === "" ||
      editedStartDate === "" ||
      editedDeadline === ""
    ) {
      alert("課題名、開始日、締切日は必須です");
      return;
    }

    if (editedStartDate > editedDeadline) {
      alert("開始日は締切日より前の日付にしてください");
      return;
    }

    task.title = editedTitle;
    task.description = editedDescription;
    task.assignee = editedAssignee;
    task.createdAt = editedStartDate;
    task.deadline = editedDeadline;
    task.status = editedStatus;

    saveTasks();

    onDateChange(createDateFromString(editedDeadline));
    onTaskChange();

    renderTaskDetail(task, callbacks);
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.classList.add("modal-cancel-btn");
  cancelBtn.textContent = "キャンセル";

  cancelBtn.addEventListener("click", function () {
    renderTaskDetail(task, callbacks);
  });

  modalContent.appendChild(titleLabel);
  modalContent.appendChild(titleEdit);
  modalContent.appendChild(descriptionLabel);
  modalContent.appendChild(descriptionEdit);
  modalContent.appendChild(assigneeLabel);
  modalContent.appendChild(assigneeEdit);
  modalContent.appendChild(startDateLabel);
  modalContent.appendChild(startDateEdit);
  modalContent.appendChild(deadlineLabel);
  modalContent.appendChild(deadlineEdit);
  modalContent.appendChild(statusLabel);
  modalContent.appendChild(statusEdit);
  modalContent.appendChild(saveBtn);
  modalContent.appendChild(cancelBtn);
}