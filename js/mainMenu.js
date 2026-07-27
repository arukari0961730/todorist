const taskMenuBtn =
  document.getElementById(
    "taskMenuBtn"
  );

const chatMenuBtn =
  document.getElementById(
    "chatMenuBtn"
  );

const taskPage =
  document.getElementById(
    "taskPage"
  );

const chatPage =
  document.getElementById(
    "chatPage"
  );

let currentPage = "task";
let isMainMenuInitialized = false;

let onTaskShowCallback = null;
let onChatShowCallback = null;

function runCallback(callback) {
  if (
    typeof callback ===
    "function"
  ) {
    callback();
  }
}

function updatePageDisplay() {
  const isTaskPage =
    currentPage === "task";

  if (taskPage) {
    taskPage.classList.toggle(
      "hidden",
      !isTaskPage
    );
  }

  if (chatPage) {
    chatPage.classList.toggle(
      "hidden",
      isTaskPage
    );
  }

  if (taskMenuBtn) {
    taskMenuBtn.classList.toggle(
      "active",
      isTaskPage
    );
  }

  if (chatMenuBtn) {
    chatMenuBtn.classList.toggle(
      "active",
      !isTaskPage
    );
  }
}

export function showMainPage(
  pageName
) {
  if (
    pageName !== "task" &&
    pageName !== "chat"
  ) {
    return false;
  }

  currentPage = pageName;
  updatePageDisplay();

  if (currentPage === "task") {
    runCallback(
      onTaskShowCallback
    );
  } else {
    runCallback(
      onChatShowCallback
    );
  }

  return true;
}

export function getCurrentMainPage() {
  return currentPage;
}

export function setupMainMenu(
  callbacks = {}
) {
  if (isMainMenuInitialized) {
    return;
  }

  onTaskShowCallback =
    typeof callbacks.onTaskShow ===
      "function"
      ? callbacks.onTaskShow
      : null;

  onChatShowCallback =
    typeof callbacks.onChatShow ===
      "function"
      ? callbacks.onChatShow
      : null;

  if (taskMenuBtn) {
    taskMenuBtn.addEventListener(
      "click",
      function () {
        showMainPage("task");
      }
    );
  }

  if (chatMenuBtn) {
    chatMenuBtn.addEventListener(
      "click",
      function () {
        showMainPage("chat");
      }
    );
  }

  isMainMenuInitialized = true;
  updatePageDisplay();
}
