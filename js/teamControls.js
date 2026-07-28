import {
  getTeams,
  getActiveTeam,
  getActiveTeamId,
  setActiveTeam,
  addTeam,
  renameTeam,
  deleteTeam
} from "./teams.js";

import {
  deleteTasksByTeamId,
  exportTasks,
  importTasks
} from "./data.js";

import {
  deleteMessagesByTeamId,
  exportMessages,
  importMessages
} from "./chatData.js";

import {
  deleteCommentsByTeamId,
  exportTaskComments,
  importTaskComments
} from "./taskCommentData.js";

import {
  deletePullRequestsByTeamId,
  exportPullRequests,
  importPullRequests
} from "./prData.js";

const teamList =
  document.getElementById(
    "teamList"
  );

const showTeamFormBtn =
  document.getElementById(
    "showTeamFormBtn"
  );

const teamCreateArea =
  document.getElementById(
    "teamCreateArea"
  );

const teamNameInput =
  document.getElementById(
    "teamNameInput"
  );

const saveTeamBtn =
  document.getElementById(
    "saveTeamBtn"
  );

const cancelTeamBtn =
  document.getElementById(
    "cancelTeamBtn"
  );

const showTeamRenameBtn =
  document.getElementById(
    "showTeamRenameBtn"
  );

const teamRenameArea =
  document.getElementById(
    "teamRenameArea"
  );

const teamRenameInput =
  document.getElementById(
    "teamRenameInput"
  );

const saveTeamRenameBtn =
  document.getElementById(
    "saveTeamRenameBtn"
  );

const cancelTeamRenameBtn =
  document.getElementById(
    "cancelTeamRenameBtn"
  );

const deleteTeamBtn =
  document.getElementById(
    "deleteTeamBtn"
  );

const teamMessage =
  document.getElementById(
    "teamMessage"
  );

const currentTeamName =
  document.getElementById(
    "currentTeamName"
  );

let isTeamControlsInitialized =
  false;

let onTeamChangeCallback =
  null;

let onTeamUpdateCallback =
  null;

function runCallback(
  callback,
  ...args
) {
  if (
    typeof callback ===
    "function"
  ) {
    callback(...args);
  }
}

function setMessage(
  message,
  type = ""
) {
  if (!teamMessage) {
    return;
  }

  teamMessage.textContent =
    message;

  teamMessage.classList.remove(
    "success",
    "error"
  );

  if (type) {
    teamMessage.classList.add(
      type
    );
  }
}

function showCreateArea() {
  hideRenameArea();

  if (!teamCreateArea) {
    return;
  }

  teamCreateArea.classList.remove(
    "hidden"
  );

  if (teamNameInput) {
    teamNameInput.value = "";
    teamNameInput.focus();
  }

  setMessage("");
}

function hideCreateArea() {
  if (!teamCreateArea) {
    return;
  }

  teamCreateArea.classList.add(
    "hidden"
  );

  if (teamNameInput) {
    teamNameInput.value = "";
  }
}

function showRenameArea() {
  const activeTeam =
    getActiveTeam();

  if (
    !teamRenameArea ||
    !activeTeam
  ) {
    return;
  }

  hideCreateArea();

  teamRenameArea.classList.remove(
    "hidden"
  );

  if (teamRenameInput) {
    teamRenameInput.value =
      activeTeam.name;

    teamRenameInput.focus();
    teamRenameInput.select();
  }

  setMessage("");
}

function hideRenameArea() {
  if (!teamRenameArea) {
    return;
  }

  teamRenameArea.classList.add(
    "hidden"
  );

  if (teamRenameInput) {
    teamRenameInput.value = "";
  }
}

function createTeamButton(team) {
  const button =
    document.createElement(
      "button"
    );

  button.type = "button";
  button.classList.add(
    "team-btn"
  );

  button.textContent =
    team.name;

  button.dataset.teamId =
    team.id;

  if (
    team.id ===
    getActiveTeamId()
  ) {
    button.classList.add(
      "active"
    );

    button.setAttribute(
      "aria-current",
      "true"
    );
  }

  button.addEventListener(
    "click",
    function () {
      if (
        team.id ===
        getActiveTeamId()
      ) {
        return;
      }

      const changed =
        setActiveTeam(
          team.id
        );

      if (!changed) {
        setMessage(
          "チームを切り替えられませんでした",
          "error"
        );

        return;
      }

      hideCreateArea();
      hideRenameArea();
      setMessage("");
      renderTeamControls();

      runCallback(
        onTeamChangeCallback,
        getActiveTeam()
      );
    }
  );

  return button;
}

export function renderTeamControls() {
  const currentTeams =
    getTeams();

  if (teamList) {
    teamList.innerHTML = "";

    currentTeams.forEach(
      function (team) {
        teamList.appendChild(
          createTeamButton(team)
        );
      }
    );
  }

  const activeTeam =
    getActiveTeam();

  if (currentTeamName) {
    currentTeamName.textContent =
      activeTeam
        ? activeTeam.name
        : "チーム未選択";
  }

  if (showTeamRenameBtn) {
    showTeamRenameBtn.disabled =
      activeTeam === null;

    showTeamRenameBtn.title =
      activeTeam
        ? "選択中のチーム名を変更します"
        : "変更するチームがありません";
  }

  if (deleteTeamBtn) {
    deleteTeamBtn.disabled =
      currentTeams.length <= 1;

    deleteTeamBtn.title =
      currentTeams.length <= 1
        ? "最後の1チームは削除できません"
        : "選択中のチームを削除します";
  }
}

function handleTeamAddition() {
  if (!teamNameInput) {
    return;
  }

  const result =
    addTeam(
      teamNameInput.value
    );

  if (!result.success) {
    setMessage(
      result.message,
      "error"
    );

    return;
  }

  hideCreateArea();
  hideRenameArea();
  renderTeamControls();

  setMessage(
    "チームを追加しました",
    "success"
  );

  runCallback(
    onTeamChangeCallback,
    result.team
  );
}

function handleTeamRename() {
  const activeTeam =
    getActiveTeam();

  if (
    !activeTeam ||
    !teamRenameInput
  ) {
    return;
  }

  const result =
    renameTeam(
      activeTeam.id,
      teamRenameInput.value
    );

  if (!result.success) {
    setMessage(
      result.message,
      "error"
    );

    return;
  }

  hideRenameArea();
  renderTeamControls();

  setMessage(
    "チーム名を変更しました",
    "success"
  );

  runCallback(
    onTeamUpdateCallback,
    result.team
  );
}

function handleTeamDeletion() {
  const activeTeam =
    getActiveTeam();

  if (!activeTeam) {
    return;
  }

  const confirmed =
    window.confirm(
      `「${activeTeam.name}」を削除しますか？\n\n` +
      "このチームのタスク、チャット、コメント、PR共有も削除されます。\n" +
      "この操作は取り消せません。"
    );

  if (!confirmed) {
    return;
  }

  const taskBackup =
    exportTasks();

  const messageBackup =
    exportMessages();

  const commentBackup =
    exportTaskComments();

  const pullRequestBackup =
    exportPullRequests();

  const tasksDeleted =
    deleteTasksByTeamId(
      activeTeam.id
    );

  if (!tasksDeleted) {
    setMessage(
      "チームのタスクを削除できませんでした",
      "error"
    );

    return;
  }

  const messagesDeleted =
    deleteMessagesByTeamId(
      activeTeam.id
    );

  if (!messagesDeleted) {
    importTasks(
      taskBackup
    );

    setMessage(
      "チームのチャットを削除できませんでした",
      "error"
    );

    return;
  }

  const commentsDeleted =
    deleteCommentsByTeamId(
      activeTeam.id
    );

  if (!commentsDeleted) {
    importTasks(
      taskBackup
    );

    importMessages(
      messageBackup
    );

    setMessage(
      "チームのタスクコメントを削除できませんでした",
      "error"
    );

    return;
  }

  const pullRequestsDeleted =
    deletePullRequestsByTeamId(
      activeTeam.id
    );

  if (!pullRequestsDeleted) {
    importTasks(
      taskBackup
    );

    importMessages(
      messageBackup
    );

    importTaskComments(
      commentBackup
    );

    setMessage(
      "チームのPR共有データを削除できませんでした",
      "error"
    );

    return;
  }

  const result =
    deleteTeam(
      activeTeam.id
    );

  if (!result.success) {
    importTasks(
      taskBackup
    );

    importMessages(
      messageBackup
    );

    importTaskComments(
      commentBackup
    );

    importPullRequests(
      pullRequestBackup
    );

    setMessage(
      result.message,
      "error"
    );

    return;
  }

  hideCreateArea();
  hideRenameArea();
  renderTeamControls();

  setMessage(
    "チームを削除しました",
    "success"
  );

  runCallback(
    onTeamChangeCallback,
    getActiveTeam()
  );
}

export function setupTeamControls(
  callbacks = {}
) {
  if (isTeamControlsInitialized) {
    return;
  }

  onTeamChangeCallback =
    typeof callbacks.onTeamChange ===
      "function"
      ? callbacks.onTeamChange
      : null;

  onTeamUpdateCallback =
    typeof callbacks.onTeamUpdate ===
      "function"
      ? callbacks.onTeamUpdate
      : null;

  if (showTeamFormBtn) {
    showTeamFormBtn.addEventListener(
      "click",
      showCreateArea
    );
  }

  if (saveTeamBtn) {
    saveTeamBtn.addEventListener(
      "click",
      handleTeamAddition
    );
  }

  if (showTeamRenameBtn) {
    showTeamRenameBtn.addEventListener(
      "click",
      showRenameArea
    );
  }

  if (saveTeamRenameBtn) {
    saveTeamRenameBtn.addEventListener(
      "click",
      handleTeamRename
    );
  }

  if (cancelTeamRenameBtn) {
    cancelTeamRenameBtn.addEventListener(
      "click",
      function () {
        hideRenameArea();
        setMessage("");
      }
    );
  }

  if (cancelTeamBtn) {
    cancelTeamBtn.addEventListener(
      "click",
      function () {
        hideCreateArea();
        setMessage("");
      }
    );
  }

  if (deleteTeamBtn) {
    deleteTeamBtn.addEventListener(
      "click",
      handleTeamDeletion
    );
  }

  if (teamNameInput) {
    teamNameInput.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          handleTeamAddition();
        }

        if (event.key === "Escape") {
          hideCreateArea();
          setMessage("");
        }
      }
    );
  }

  if (teamRenameInput) {
    teamRenameInput.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          handleTeamRename();
        }

        if (event.key === "Escape") {
          hideRenameArea();
          setMessage("");
        }
      }
    );
  }

  isTeamControlsInitialized =
    true;

  renderTeamControls();
}
