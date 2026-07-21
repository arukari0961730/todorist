import {
    getTaskAssignee
} from "./filters.js";

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const assigneeFilter =
    document.getElementById("assigneeFilter");

const deadlineFilter =
    document.getElementById("deadlineFilter");

const sortFilter =
    document.getElementById("sortFilter");

export function setupFilterControls(onFilterChange) {
    searchInput.addEventListener("input", function () {
        onFilterChange({
            searchKeyword: searchInput.value.trim()
        });
    });

    statusFilter.addEventListener("change", function () {
        onFilterChange({
            status: statusFilter.value
        });
    });

    assigneeFilter.addEventListener("change", function () {
        onFilterChange({
            assignee: assigneeFilter.value
        });
    });

    deadlineFilter.addEventListener("change", function () {
        onFilterChange({
            deadline: deadlineFilter.value
        });
    });

    sortFilter.addEventListener("change", function () {
        onFilterChange({
            sort: sortFilter.value
        });
    });
}

export function renderAssigneeFilterOptions(
    tasks,
    selectedAssignee
) {
    assigneeFilter.innerHTML = "";

    const allOption =
        document.createElement("option");

    allOption.value = "all";
    allOption.textContent = "すべての担当者";

    assigneeFilter.appendChild(allOption);

    const assignees = [];

    tasks.forEach(function (task) {
        const assigneeName =
            getTaskAssignee(task);

        if (!assignees.includes(assigneeName)) {
            assignees.push(assigneeName);
        }
    });

    assignees.sort(function (a, b) {
        return a.localeCompare(b, "ja");
    });

    assignees.forEach(function (assigneeName) {
        const option =
            document.createElement("option");

        option.value = assigneeName;
        option.textContent = assigneeName;

        assigneeFilter.appendChild(option);
    });

    if (
        selectedAssignee === "all" ||
        assignees.includes(selectedAssignee)
    ) {
        assigneeFilter.value =
            selectedAssignee;

        return selectedAssignee;
    }

    assigneeFilter.value = "all";

    return "all";
}

export function setFilterControlValues(filterSettings) {
    if (
        filterSettings.searchKeyword !==
        undefined
    ) {
        searchInput.value =
            filterSettings.searchKeyword;
    }

    if (
        filterSettings.status !==
        undefined
    ) {
        statusFilter.value =
            filterSettings.status;
    }

    if (
        filterSettings.assignee !==
        undefined
    ) {
        assigneeFilter.value =
            filterSettings.assignee;
    }

    if (
        filterSettings.deadline !==
        undefined
    ) {
        deadlineFilter.value =
            filterSettings.deadline;
    }

    if (
        filterSettings.sort !==
        undefined
    ) {
        sortFilter.value =
            filterSettings.sort;
    }
}