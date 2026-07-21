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

let isFilterEventsInitialized = false;

function addInputEvent(
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
    "input",
    callback
  );
}

function addChangeEvent(
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
    "change",
    callback
  );
}

export function setupFilterControls(
  onFilterChange
) {
  if (isFilterEventsInitialized) {
    return;
  }

  if (
    typeof onFilterChange !==
    "function"
  ) {
    console.error(
      "フィルター変更処理が設定されていません"
    );

    return;
  }

  addInputEvent(
    searchInput,
    function () {
      onFilterChange({
        searchKeyword:
          searchInput.value.trim()
      });
    }
  );

  addChangeEvent(
    statusFilter,
    function () {
      onFilterChange({
        status:
          statusFilter.value
      });
    }
  );

  addChangeEvent(
    assigneeFilter,
    function () {
      onFilterChange({
        assignee:
          assigneeFilter.value
      });
    }
  );

  addChangeEvent(
    deadlineFilter,
    function () {
      onFilterChange({
        deadline:
          deadlineFilter.value
      });
    }
  );

  addChangeEvent(
    sortFilter,
    function () {
      onFilterChange({
        sort:
          sortFilter.value
      });
    }
  );

  isFilterEventsInitialized = true;
}

export function renderAssigneeFilterOptions(
  tasks,
  selectedAssignee
) {
  if (!assigneeFilter) {
    return "all";
  }

  assigneeFilter.innerHTML = "";

  const allOption =
    document.createElement("option");

  allOption.value = "all";
  allOption.textContent =
    "すべての担当者";

  assigneeFilter.appendChild(
    allOption
  );

  if (!Array.isArray(tasks)) {
    assigneeFilter.value = "all";

    return "all";
  }

  const assignees = [];

  tasks.forEach(function (task) {
    const assigneeName =
      getTaskAssignee(task);

    if (
      !assignees.includes(
        assigneeName
      )
    ) {
      assignees.push(
        assigneeName
      );
    }
  });

  assignees.sort(function (a, b) {
    return a.localeCompare(
      b,
      "ja"
    );
  });

  assignees.forEach(
    function (assigneeName) {
      const option =
        document.createElement(
          "option"
        );

      option.value =
        assigneeName;

      option.textContent =
        assigneeName;

      assigneeFilter.appendChild(
        option
      );
    }
  );

  const canKeepSelection =
    selectedAssignee === "all" ||
    assignees.includes(
      selectedAssignee
    );

  if (canKeepSelection) {
    assigneeFilter.value =
      selectedAssignee;

    return selectedAssignee;
  }

  assigneeFilter.value = "all";

  return "all";
}

function setElementValue(
  element,
  value
) {
  if (!element) {
    return;
  }

  if (value === undefined) {
    return;
  }

  element.value = value;
}

export function setFilterControlValues(
  filterSettings = {}
) {
  setElementValue(
    searchInput,
    filterSettings.searchKeyword
  );

  setElementValue(
    statusFilter,
    filterSettings.status
  );

  setElementValue(
    assigneeFilter,
    filterSettings.assignee
  );

  setElementValue(
    deadlineFilter,
    filterSettings.deadline
  );

  setElementValue(
    sortFilter,
    filterSettings.sort
  );
}