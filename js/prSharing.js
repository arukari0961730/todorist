import {
  getActiveTeam
} from "./teams.js";

import {
  getTasksByTeamId,
  getTaskById
} from "./data.js";

import {
  getPullRequestsByTeamId,
  addPullRequest,
  updatePullRequestStatus,
  deletePullRequest
} from "./prData.js";

const STATUS_SETTINGS = {
  draft: {
    label: "下書き",
    className: "pr-status-draft"
  },

  review: {
    label: "レビュー待ち",
    className: "pr-status-review"
  },

  changes: {
    label: "修正対応中",
    className: "pr-status-changes"
  },

  merged: {
    label: "マージ済み",
    className: "pr-status-merged"
  },

  closed: {
    label: "クローズ",
    className: "pr-status-closed"
  }
};

const prTeamTitle =
  document.getElementById(
    "prTeamTitle"
  );

const prForm =
  document.getElementById(
    "prForm"
  );

const prTitleInput =
  document.getElementById(
    "prTitleInput"
  );

const prUrlInput =
  document.getElementById(
    "prUrlInput"
  );

const prAssigneeInput =
  document.getElementById(
    "prAssigneeInput"
  );

const prStatusInput =
  document.getElementById(
    "prStatusInput"
  );

const prTaskSelect =
  document.getElementById(
    "prTaskSelect"
  );

const prNoteInput =
  document.getElementById(
    "prNoteInput"
  );

const prErrorMessage =
  document.getElementById(
    "prErrorMessage"
  );

const prCountText =
  document.getElementById(
    "prCountText"
  );

const prList =
  document.getElementById(
    "prList"
  );

let isPRSharingInitialized = false;

function setErrorMessage(message) {
  if (!prErrorMessage) {
    return;
  }

  prErrorMessage.textContent =
    message;
}

function formatDate(dateText) {
  const date =
    new Date(dateText);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "日時不明";
  }

  return new Intl.DateTimeFormat(
    "ja-JP",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(date);
}

function getStatusSetting(status) {
  return (
    STATUS_SETTINGS[status] ||
    STATUS_SETTINGS.review
  );
}

function renderTaskOptions() {
  if (!prTaskSelect) {
    return;
  }

  const selectedValue =
    prTaskSelect.value;

  prTaskSelect.innerHTML = "";

  const emptyOption =
    document.createElement(
      "option"
    );

  emptyOption.value = "";
  emptyOption.textContent =
    "関連タスクなし";

  prTaskSelect.appendChild(
    emptyOption
  );

  const activeTeam =
    getActiveTeam();

  if (!activeTeam) {
    return;
  }

  const teamTasks =
    getTasksByTeamId(
      activeTeam.id
    );

  teamTasks.forEach(
    function (task) {
      const option =
        document.createElement(
          "option"
        );

      option.value =
        String(task.id);

      option.textContent =
        task.title || "無題";

      prTaskSelect.appendChild(
        option
      );
    }
  );

  const canKeepSelection =
    Array.from(
      prTaskSelect.options
    ).some(
      function (option) {
        return (
          option.value ===
          selectedValue
        );
      }
    );

  prTaskSelect.value =
    canKeepSelection
      ? selectedValue
      : "";
}

function createEmptyMessage() {
  const empty =
    document.createElement(
      "div"
    );

  empty.classList.add(
    "pr-empty"
  );

  empty.textContent =
    "このチームにはまだPRが登録されていません";

  return empty;
}

function createMetaItem(
  label,
  value
) {
  const item =
    document.createElement(
      "span"
    );

  item.textContent =
    label + "：" + value;

  return item;
}

function createStatusSelect(item) {
  const select =
    document.createElement(
      "select"
    );

  select.classList.add(
    "pr-card-status-select"
  );

  Object.entries(
    STATUS_SETTINGS
  ).forEach(
    function ([value, settings]) {
      const option =
        document.createElement(
          "option"
        );

      option.value = value;
      option.textContent =
        settings.label;

      option.selected =
        value === item.status;

      select.appendChild(
        option
      );
    }
  );

  select.addEventListener(
    "change",
    function () {
      const changed =
        updatePullRequestStatus(
          item.id,
          select.value
        );

      if (!changed) {
        setErrorMessage(
          "PRの状態を変更できませんでした"
        );

        renderPRSharing();
        return;
      }

      setErrorMessage("");
      renderPRSharing();
    }
  );

  return select;
}

function createPRCard(item) {
  const card =
    document.createElement(
      "article"
    );

  card.classList.add(
    "pr-card"
  );

  const statusSetting =
    getStatusSetting(
      item.status
    );

  card.classList.add(
    statusSetting.className
  );

  const header =
    document.createElement(
      "div"
    );

  header.classList.add(
    "pr-card-header"
  );

  const titleArea =
    document.createElement(
      "div"
    );

  titleArea.classList.add(
    "pr-card-title-area"
  );

  const titleLink =
    document.createElement(
      "a"
    );

  titleLink.classList.add(
    "pr-card-title"
  );

  titleLink.href = item.url;
  titleLink.target = "_blank";
  titleLink.rel =
    "noopener noreferrer";

  titleLink.textContent =
    item.title;

  const statusBadge =
    document.createElement(
      "span"
    );

  statusBadge.classList.add(
    "pr-status-badge",
    statusSetting.className
  );

  statusBadge.textContent =
    statusSetting.label;

  titleArea.appendChild(
    titleLink
  );

  titleArea.appendChild(
    statusBadge
  );

  const deleteButton =
    document.createElement(
      "button"
    );

  deleteButton.type = "button";
  deleteButton.classList.add(
    "pr-delete-btn"
  );

  deleteButton.textContent =
    "削除";

  deleteButton.addEventListener(
    "click",
    function () {
      const confirmed =
        window.confirm(
          `「${item.title}」を削除しますか？`
        );

      if (!confirmed) {
        return;
      }

      const deleted =
        deletePullRequest(
          item.id
        );

      if (!deleted) {
        setErrorMessage(
          "PR情報を削除できませんでした"
        );

        return;
      }

      setErrorMessage("");
      renderPRSharing();
    }
  );

  header.appendChild(
    titleArea
  );

  header.appendChild(
    deleteButton
  );

  const meta =
    document.createElement(
      "div"
    );

  meta.classList.add(
    "pr-card-meta"
  );

  meta.appendChild(
    createMetaItem(
      "担当者",
      item.assignee || "未設定"
    )
  );

  meta.appendChild(
    createMetaItem(
      "登録日時",
      formatDate(
        item.createdAt
      )
    )
  );

  const relatedTask =
    item.relatedTaskId === null
      ? null
      : getTaskById(
          item.relatedTaskId
        );

  meta.appendChild(
    createMetaItem(
      "関連タスク",
      relatedTask
        ? relatedTask.title
        : "なし"
    )
  );

  const urlText =
    document.createElement(
      "div"
    );

  urlText.classList.add(
    "pr-card-url"
  );

  urlText.textContent =
    item.url;

  const controls =
    document.createElement(
      "div"
    );

  controls.classList.add(
    "pr-card-controls"
  );

  const controlLabel =
    document.createElement(
      "label"
    );

  controlLabel.textContent =
    "状態を変更";

  controlLabel.appendChild(
    createStatusSelect(item)
  );

  controls.appendChild(
    controlLabel
  );

  card.appendChild(header);
  card.appendChild(meta);
  card.appendChild(urlText);

  if (item.note) {
    const note =
      document.createElement(
        "p"
      );

    note.classList.add(
      "pr-card-note"
    );

    note.textContent =
      item.note;

    card.appendChild(note);
  }

  card.appendChild(controls);

  return card;
}

export function renderPRSharing() {
  const activeTeam =
    getActiveTeam();

  if (prTeamTitle) {
    prTeamTitle.textContent =
      activeTeam
        ? activeTeam.name +
          " のPR共有"
        : "チーム未選択";
  }

  renderTaskOptions();

  if (!prList) {
    return;
  }

  prList.innerHTML = "";

  const items =
    activeTeam
      ? getPullRequestsByTeamId(
          activeTeam.id
        )
      : [];

  if (prCountText) {
    prCountText.textContent =
      items.length + "件";
  }

  if (items.length === 0) {
    prList.appendChild(
      createEmptyMessage()
    );

    return;
  }

  items.forEach(
    function (item) {
      prList.appendChild(
        createPRCard(item)
      );
    }
  );
}

function resetForm() {
  if (prTitleInput) {
    prTitleInput.value = "";
  }

  if (prUrlInput) {
    prUrlInput.value = "";
  }

  if (prAssigneeInput) {
    prAssigneeInput.value = "";
  }

  if (prStatusInput) {
    prStatusInput.value =
      "review";
  }

  if (prTaskSelect) {
    prTaskSelect.value = "";
  }

  if (prNoteInput) {
    prNoteInput.value = "";
  }
}

function handleSubmission(event) {
  event.preventDefault();

  const activeTeam =
    getActiveTeam();

  const result =
    addPullRequest({
      teamId:
        activeTeam
          ? activeTeam.id
          : "",

      title:
        prTitleInput
          ? prTitleInput.value
          : "",

      url:
        prUrlInput
          ? prUrlInput.value
          : "",

      assignee:
        prAssigneeInput
          ? prAssigneeInput.value
          : "",

      status:
        prStatusInput
          ? prStatusInput.value
          : "review",

      relatedTaskId:
        prTaskSelect
          ? prTaskSelect.value
          : "",

      note:
        prNoteInput
          ? prNoteInput.value
          : ""
    });

  if (!result.success) {
    setErrorMessage(
      result.message
    );

    return;
  }

  setErrorMessage("");
  resetForm();
  renderPRSharing();

  if (prTitleInput) {
    prTitleInput.focus();
  }
}

export function setupPRSharing() {
  if (isPRSharingInitialized) {
    return;
  }

  if (prForm) {
    prForm.addEventListener(
      "submit",
      handleSubmission
    );
  }

  isPRSharingInitialized = true;
  renderPRSharing();
}
