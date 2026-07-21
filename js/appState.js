const ALLOWED_VIEWS = [
  "calendar",
  "list",
  "gantt",
  "board"
];

const appState = {
  currentView: "calendar",

  currentDate: new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  )
};

function isValidDate(date) {
  return (
    date instanceof Date &&
    !Number.isNaN(date.getTime())
  );
}

function createMonthDate(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );
}

export function getCurrentView() {
  return appState.currentView;
}

export function setCurrentView(viewName) {
  if (!ALLOWED_VIEWS.includes(viewName)) {
    console.error(
      "存在しない画面です:",
      viewName
    );

    return false;
  }

  appState.currentView = viewName;

  return true;
}

export function getCurrentDate() {
  return new Date(
    appState.currentDate
  );
}

export function setCurrentDate(date) {
  if (!isValidDate(date)) {
    console.error(
      "表示月に設定する日付が不正です:",
      date
    );

    return false;
  }

  appState.currentDate =
    createMonthDate(date);

  return true;
}

export function moveCurrentMonth(amount) {
  if (!Number.isInteger(amount)) {
    return;
  }

  appState.currentDate = new Date(
    appState.currentDate.getFullYear(),
    appState.currentDate.getMonth() + amount,
    1
  );
}

export function resetCurrentDate() {
  const today = new Date();

  appState.currentDate =
    createMonthDate(today);
}

/*
  以前の関数名を使っているファイルがあっても
  動かせるように残している互換用関数
*/

export function getViewDate() {
  return getCurrentDate();
}

export function setViewDate(date) {
  return setCurrentDate(date);
}

export function moveViewMonth(amount) {
  moveCurrentMonth(amount);
}

export function resetViewDateToToday() {
  resetCurrentDate();
}