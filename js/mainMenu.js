const taskMenuBtn =
  document.getElementById(
    "taskMenuBtn"
  );

const chatMenuBtn =
  document.getElementById(
    "chatMenuBtn"
  );

const prMenuBtn =
  document.getElementById(
    "prMenuBtn"
  );

const taskPage =
  document.getElementById(
    "taskPage"
  );

const chatPage =
  document.getElementById(
    "chatPage"
  );

const prPage =
  document.getElementById(
    "prPage"
  );

const PAGE_SETTINGS = {
  task: {
    button: taskMenuBtn,
    page: taskPage
  },

  chat: {
    button: chatMenuBtn,
    page: chatPage
  },

  pr: {
    button: prMenuBtn,
    page: prPage
  }
};

let currentPage = "task";
let isMainMenuInitialized = false;

let pageCallbacks = {
  task: null,
  chat: null,
  pr: null
};

function runCallback(callback) {
  if (
    typeof callback ===
    "function"
  ) {
    callback();
  }
}

function isValidPageName(pageName) {
  return Object.hasOwn(
    PAGE_SETTINGS,
    pageName
  );
}

function updatePageDisplay() {
  Object.entries(
    PAGE_SETTINGS
  ).forEach(
    function ([pageName, settings]) {
      const isActive =
        pageName === currentPage;

      if (settings.page) {
        settings.page.classList.toggle(
          "hidden",
          !isActive
        );
      }

      if (settings.button) {
        settings.button.classList.toggle(
          "active",
          isActive
        );

        if (isActive) {
          settings.button.setAttribute(
            "aria-current",
            "page"
          );
        } else {
          settings.button.removeAttribute(
            "aria-current"
          );
        }
      }
    }
  );
}

export function showMainPage(
  pageName
) {
  if (!isValidPageName(pageName)) {
    return false;
  }

  currentPage = pageName;
  updatePageDisplay();

  runCallback(
    pageCallbacks[currentPage]
  );

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

  pageCallbacks = {
    task:
      typeof callbacks.onTaskShow ===
        "function"
        ? callbacks.onTaskShow
        : null,

    chat:
      typeof callbacks.onChatShow ===
        "function"
        ? callbacks.onChatShow
        : null,

    pr:
      typeof callbacks.onPRShow ===
        "function"
        ? callbacks.onPRShow
        : null
  };

  Object.entries(
    PAGE_SETTINGS
  ).forEach(
    function ([pageName, settings]) {
      if (!settings.button) {
        return;
      }

      settings.button.addEventListener(
        "click",
        function () {
          showMainPage(pageName);
        }
      );
    }
  );

  isMainMenuInitialized = true;
  updatePageDisplay();
}
