const appState = {
  viewDate: new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ),

  currentView: "calendar",

  filters: {
    searchKeyword: "",
    status: "all",
    assignee: "all",
    deadline: "all",
    sort: "deadline"
  }
};

export function getViewDate() {
  return new Date(appState.viewDate);
}

export function setViewDate(newDate) {
  if (!(newDate instanceof Date)) {
    return;
  }

  if (Number.isNaN(newDate.getTime())) {
    return;
  }

  appState.viewDate = new Date(
    newDate.getFullYear(),
    newDate.getMonth(),
    1
  );
}

export function moveViewMonth(amount) {
  const currentYear =
    appState.viewDate.getFullYear();

  const currentMonth =
    appState.viewDate.getMonth();

  appState.viewDate = new Date(
    currentYear,
    currentMonth + amount,
    1
  );
}

export function resetViewDateToToday() {
  const today = new Date();

  appState.viewDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );
}

export function getCurrentView() {
  return appState.currentView;
}

export function setCurrentView(viewName) {
  const allowedViews = [
    "calendar",
    "list",
    "gantt",
    "board"
  ];

  if (!allowedViews.includes(viewName)) {
    return;
  }

  appState.currentView = viewName;
}

export function getFilterState() {
  return {
    searchKeyword:
      appState.filters.searchKeyword,

    status:
      appState.filters.status,

    assignee:
      appState.filters.assignee,

    deadline:
      appState.filters.deadline,

    sort:
      appState.filters.sort
  };
}

export function updateFilterState(
  filterSettings
) {
  if (!filterSettings) {
    return;
  }

  if (
    filterSettings.searchKeyword !==
    undefined
  ) {
    appState.filters.searchKeyword =
      filterSettings.searchKeyword;
  }

  if (
    filterSettings.status !==
    undefined
  ) {
    appState.filters.status =
      filterSettings.status;
  }

  if (
    filterSettings.assignee !==
    undefined
  ) {
    appState.filters.assignee =
      filterSettings.assignee;
  }

  if (
    filterSettings.deadline !==
    undefined
  ) {
    appState.filters.deadline =
      filterSettings.deadline;
  }

  if (
    filterSettings.sort !==
    undefined
  ) {
    appState.filters.sort =
      filterSettings.sort;
  }
}

export function setAssigneeFilter(
  assignee
) {
  appState.filters.assignee =
    assignee;
}