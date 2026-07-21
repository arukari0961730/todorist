const appState = {
    viewDate: new Date(),

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
    return appState.viewDate;
}

export function setViewDate(newDate) {
    appState.viewDate = newDate;
}

export function moveViewMonth(amount) {
    appState.viewDate.setMonth(
        appState.viewDate.getMonth() + amount
    );
}

export function resetViewDateToToday() {
    appState.viewDate = new Date();
}

export function getCurrentView() {
    return appState.currentView;
}

export function setCurrentView(viewName) {
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