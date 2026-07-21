const prevBtn =
  document.getElementById("prevBtn");

const todayBtn =
  document.getElementById("todayBtn");

const nextBtn =
  document.getElementById("nextBtn");

const calendarTab =
  document.getElementById("calendarTab");

const listTab =
  document.getElementById("listTab");

const ganttTab =
  document.getElementById("ganttTab");

const boardTab =
  document.getElementById("boardTab");

const calendarArea =
  document.getElementById("calendarArea");

const listArea =
  document.getElementById("listArea");

const ganttArea =
  document.getElementById("ganttArea");

const boardArea =
  document.getElementById("boardArea");

const viewSettings = {
  calendar: {
    area: calendarArea,
    tab: calendarTab
  },

  list: {
    area: listArea,
    tab: listTab
  },

  gantt: {
    area: ganttArea,
    tab: ganttTab
  },

  board: {
    area: boardArea,
    tab: boardTab
  }
};

function isValidView(view) {
  return (
    view &&
    view.area &&
    view.tab
  );
}

function hideAllViews() {
  Object.values(viewSettings).forEach(
    function (view) {
      if (!isValidView(view)) {
        return;
      }

      view.area.classList.add(
        "hidden"
      );

      view.tab.classList.remove(
        "active"
      );
    }
  );
}

export function showView(viewName) {
  const selectedView =
    viewSettings[viewName];

  if (!isValidView(selectedView)) {
    console.error(
      "表示する画面が見つかりません:",
      viewName
    );

    return;
  }

  hideAllViews();

  selectedView.area.classList.remove(
    "hidden"
  );

  selectedView.tab.classList.add(
    "active"
  );
}

function addClickEvent(
  element,
  callback
) {
  if (!element) {
    return;
  }

  if (typeof callback !== "function") {
    return;
  }

  element.addEventListener(
    "click",
    callback
  );
}

export function setupNavigation(
  callbacks = {}
) {
  const {
    onPreviousMonth,
    onToday,
    onNextMonth,
    onViewChange
  } = callbacks;

  addClickEvent(
    prevBtn,
    function () {
      onPreviousMonth();
    }
  );

  addClickEvent(
    todayBtn,
    function () {
      onToday();
    }
  );

  addClickEvent(
    nextBtn,
    function () {
      onNextMonth();
    }
  );

  addClickEvent(
    calendarTab,
    function () {
      showView("calendar");

      onViewChange("calendar");
    }
  );

  addClickEvent(
    listTab,
    function () {
      showView("list");

      onViewChange("list");
    }
  );

  addClickEvent(
    ganttTab,
    function () {
      showView("gantt");

      onViewChange("gantt");
    }
  );

  addClickEvent(
    boardTab,
    function () {
      showView("board");

      onViewChange("board");
    }
  );
}