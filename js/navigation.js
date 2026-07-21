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

function hideAllViews() {
    Object.values(viewSettings).forEach(
        function (view) {
            view.area.classList.add("hidden");
            view.tab.classList.remove("active");
        }
    );
}

export function showView(viewName) {
    const selectedView =
        viewSettings[viewName];

    if (!selectedView) {
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

export function setupNavigation(callbacks) {
    const {
        onPreviousMonth,
        onToday,
        onNextMonth,
        onViewChange
    } = callbacks;

    prevBtn.addEventListener(
        "click",
        function () {
            onPreviousMonth();
        }
    );

    todayBtn.addEventListener(
        "click",
        function () {
            onToday();
        }
    );

    nextBtn.addEventListener(
        "click",
        function () {
            onNextMonth();
        }
    );

    calendarTab.addEventListener(
        "click",
        function () {
            showView("calendar");
            onViewChange("calendar");
        }
    );

    listTab.addEventListener(
        "click",
        function () {
            showView("list");
            onViewChange("list");
        }
    );

    ganttTab.addEventListener(
        "click",
        function () {
            showView("gantt");
            onViewChange("gantt");
        }
    );

    boardTab.addEventListener(
        "click",
        function () {
            showView("board");
            onViewChange("board");
        }
    );
}