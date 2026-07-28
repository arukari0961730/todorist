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

import {
  renderTaskCommentsSection
} from "./taskComments.js";

import {
  deleteCommentsByTaskId,
  exportTaskComments,
  importTaskComments
} from "./taskCommentData.js";

const modalOverlay =
  document.getElementById("modalOverlay");

const modalContent =
  document.getElementById("modalContent");

let isModalOverlayInitialized = false;
let isProcessingModalAction = false;

function hasModalElements() {
  return (
    modalOverlay &&
    modalContent
  );
}

function setModalVisible(
  isVisible
) {
  if (!modalOverlay) {
    return;
  }

  if (isVisible) {
    modalOverlay.classList.remove(
      "hidden"
    );

    return;
  }

  modalOverlay.classList.add(
    "hidden"
  );
}

function clearModalContent() {
  if (!modalContent) {
    return;
  }

  modalContent.innerHTML = "";
}

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

function createButton(
  text,
  className,
  onClick
) {
  const button =
    document.createElement(
      "button"
    );

  button.type = "button";
  button.textContent = text;

  if (className) {
    button.classList.add(
      className
    );
  }

  if (
    typeof onClick ===
    "function"
  ) {
    button.addEventListener(
      "click",
      onClick
    );
  }

  return button;
}

function setModalButtonsDisabled(
  disabled
) {
  if (!modalContent) {
    return;
  }

  const buttons =
    modalContent.querySelectorAll(
      "button"
    );

  buttons.forEach(
    function (button) {
      button.disabled =
        disabled;
    }
  );
}

export function closeModal() {
  if (isProcessingModalAction) {
    return;
  }

  setModalVisible(false);
  clearModalContent();
}

function renderStatusSelect(
  selectedStatus
) {
  const select =
    document.createElement(
      "select"
    );

  select.classList.add(
    "edit-select"
  );

  STATUS_LIST.forEach(
    function (status) {
      const option =
        document.createElement(
          "option"
        );

      option.value =
        status.value;

      option.textContent =
        status.label;

      option.selected =
        status.value ===
        selectedStatus;

      select.appendChild(
        option
      );
    }
  );

  return select;
}

export function setupModalOverlay() {
  if (isModalOverlayInitialized) {
    return;
  }

  if (!modalOverlay) {
    console.error(
      "モーダル背景が見つかりません"
    );

    return;
  }

  modalOverlay.addEventListener(
    "click",
    function (event) {
      if (
        event.target ===
        modalOverlay
      ) {
        closeModal();
      }
    }
  );

  document.addEventListener(
    "keydown",
    function (event) {
      if (
        event.key !==
        "Escape"
      ) {
        return;
      }

      if (
        modalOverlay.classList.contains(
          "hidden"
        )
      ) {
        return;
      }

      closeModal();
    }
  );

  isModalOverlayInitialized = true;
}

export function renderTaskDetail(
  task,
  callbacks = {}
) {
  if (!hasModalElements()) {
    console.error(
      "モーダル表示に必要なHTML要素がありません"
    );

    return;
  }

  if (!task) {
    console.error(
      "表示するタスクがありません"
    );

    return;
  }

  const {
    onTaskChange,
    onDateChange
  } = callbacks;

  setModalVisible(true);
  clearModalContent();

  const title =
    document.createElement(
      "h3"
    );

  title.textContent =
    task.title || "無題";

  const description =
    document.createElement(
      "p"
    );

  description.textContent =
    task.description
      ? "詳細：" +
        task.description
      : "詳細：なし";

  const assignee =
    document.createElement(
      "p"
    );

  assignee.textContent =
    "担当者：" +
    getTaskAssignee(task);

  const startDate =
    document.createElement(
      "p"
    );

  startDate.textContent =
    "開始日：" +
    task.createdAt;

  const deadline =
    document.createElement(
      "p"
    );

  deadline.textContent =
    "締切日：" +
    task.deadline;

  const statusText =
    document.createElement(
      "p"
    );

  statusText.textContent =
    "状態：";

  const statusBadge =
    document.createElement(
      "span"
    );

  statusBadge.classList.add(
    "status-badge"
  );

  statusBadge.classList.add(
    getStatusClass(
      task.status
    )
  );

  statusBadge.textContent =
    getStatusLabel(
      task.status
    );

  statusText.appendChild(
    statusBadge
  );

  const statusSelect =
    renderStatusSelect(
      task.status
    );

  const changeStatusBtn =
    createButton(
      "状態を変更",
      "modal-status-btn",
      function () {
        if (
          isProcessingModalAction
        ) {
          return;
        }

        isProcessingModalAction =
          true;

        setModalButtonsDisabled(
          true
        );

        try {
          task.status =
            statusSelect.value;

          saveTasks();

          runCallback(
            onTaskChange
          );

          renderTaskDetail(
            task,
            callbacks
          );
        } catch (error) {
          console.error(
            "状態変更に失敗しました",
            error
          );

          alert(
            "状態変更に失敗しました"
          );
        } finally {
          isProcessingModalAction =
            false;

          setModalButtonsDisabled(
            false
          );
        }
      }
    );

  const editBtn =
    createButton(
      "編集",
      "modal-edit-btn",
      function () {
        renderEditForm(
          task,
          callbacks
        );
      }
    );

  const deleteBtn =
    createButton(
      "削除",
      "modal-delete-btn",
      function () {
        if (
          isProcessingModalAction
        ) {
          return;
        }

        const ok =
          confirm(
            "この課題を削除しますか？"
          );

        if (!ok) {
          return;
        }

        isProcessingModalAction =
          true;

        setModalButtonsDisabled(
          true
        );

        const commentBackup =
          exportTaskComments();

        try {
          const commentsDeleted =
            deleteCommentsByTaskId(
              task.id
            );

          if (!commentsDeleted) {
            throw new Error(
              "タスクコメントを削除できませんでした"
            );
          }

          const taskDeleted =
            deleteTask(
              task.id
            );

          if (!taskDeleted) {
            importTaskComments(
              commentBackup
            );

            throw new Error(
              "タスクを削除できませんでした"
            );
          }

          runCallback(
            onTaskChange
          );

          setModalVisible(
            false
          );

          clearModalContent();
        } catch (error) {
          console.error(
            "タスクの削除に失敗しました",
            error
          );

          alert(
            "タスクの削除に失敗しました"
          );
        } finally {
          isProcessingModalAction =
            false;
        }
      }
    );

  const closeBtn =
    createButton(
      "閉じる",
      "modal-close-btn",
      function () {
        closeModal();
      }
    );

  const commentsSection =
    renderTaskCommentsSection(
      task
    );

  modalContent.appendChild(
    title
  );

  modalContent.appendChild(
    description
  );

  modalContent.appendChild(
    assignee
  );

  modalContent.appendChild(
    startDate
  );

  modalContent.appendChild(
    deadline
  );

  modalContent.appendChild(
    statusText
  );

  modalContent.appendChild(
    statusSelect
  );

  modalContent.appendChild(
    changeStatusBtn
  );

  modalContent.appendChild(
    commentsSection
  );

  modalContent.appendChild(
    editBtn
  );

  modalContent.appendChild(
    deleteBtn
  );

  modalContent.appendChild(
    closeBtn
  );
}

function createLabel(
  text
) {
  const label =
    document.createElement(
      "label"
    );

  label.textContent =
    text;

  return label;
}

function createInput(
  value,
  type = "text"
) {
  const input =
    document.createElement(
      "input"
    );

  input.classList.add(
    "edit-input"
  );

  input.type =
    type;

  input.value =
    value || "";

  return input;
}

function renderEditForm(
  task,
  callbacks = {}
) {
  if (!hasModalElements()) {
    return;
  }

  const {
    onTaskChange,
    onDateChange
  } = callbacks;

  setModalVisible(true);
  clearModalContent();

  const titleLabel =
    createLabel(
      "課題名"
    );

  const titleEdit =
    createInput(
      task.title
    );

  const descriptionLabel =
    createLabel(
      "詳細"
    );

  const descriptionEdit =
    document.createElement(
      "textarea"
    );

  descriptionEdit.classList.add(
    "edit-textarea"
  );

  descriptionEdit.value =
    task.description || "";

  const assigneeLabel =
    createLabel(
      "担当者"
    );

  const assigneeEdit =
    createInput(
      task.assignee
    );

  const startDateLabel =
    createLabel(
      "開始日"
    );

  const startDateEdit =
    createInput(
      task.createdAt,
      "date"
    );

  const deadlineLabel =
    createLabel(
      "締切日"
    );

  const deadlineEdit =
    createInput(
      task.deadline,
      "date"
    );

  const statusLabel =
    createLabel(
      "状態"
    );

  const statusEdit =
    renderStatusSelect(
      task.status
    );

  const saveBtn =
    createButton(
      "保存",
      "modal-save-btn",
      function () {
        if (
          isProcessingModalAction
        ) {
          return;
        }

        const editedTitle =
          titleEdit.value.trim();

        const editedDescription =
          descriptionEdit.value.trim();

        const editedAssignee =
          assigneeEdit.value.trim();

        const editedStartDate =
          startDateEdit.value;

        const editedDeadline =
          deadlineEdit.value;

        const editedStatus =
          statusEdit.value;

        if (
          editedTitle === "" ||
          editedStartDate === "" ||
          editedDeadline === ""
        ) {
          alert(
            "課題名、開始日、締切日は必須です"
          );

          return;
        }

        if (
          editedStartDate >
          editedDeadline
        ) {
          alert(
            "開始日は締切日より前の日付にしてください"
          );

          return;
        }

        isProcessingModalAction =
          true;

        setModalButtonsDisabled(
          true
        );

        try {
          task.title =
            editedTitle;

          task.description =
            editedDescription;

          task.assignee =
            editedAssignee;

          task.createdAt =
            editedStartDate;

          task.deadline =
            editedDeadline;

          task.status =
            editedStatus;

          saveTasks();

          runCallback(
            onDateChange,
            createDateFromString(
              editedDeadline
            )
          );

          runCallback(
            onTaskChange
          );

          renderTaskDetail(
            task,
            callbacks
          );
        } catch (error) {
          console.error(
            "タスク編集の保存に失敗しました",
            error
          );

          alert(
            "タスク編集の保存に失敗しました"
          );
        } finally {
          isProcessingModalAction =
            false;

          setModalButtonsDisabled(
            false
          );
        }
      }
    );

  const cancelBtn =
    createButton(
      "キャンセル",
      "modal-cancel-btn",
      function () {
        renderTaskDetail(
          task,
          callbacks
        );
      }
    );

  modalContent.appendChild(
    titleLabel
  );

  modalContent.appendChild(
    titleEdit
  );

  modalContent.appendChild(
    descriptionLabel
  );

  modalContent.appendChild(
    descriptionEdit
  );

  modalContent.appendChild(
    assigneeLabel
  );

  modalContent.appendChild(
    assigneeEdit
  );

  modalContent.appendChild(
    startDateLabel
  );

  modalContent.appendChild(
    startDateEdit
  );

  modalContent.appendChild(
    deadlineLabel
  );

  modalContent.appendChild(
    deadlineEdit
  );

  modalContent.appendChild(
    statusLabel
  );

  modalContent.appendChild(
    statusEdit
  );

  modalContent.appendChild(
    saveBtn
  );

  modalContent.appendChild(
    cancelBtn
  );
}