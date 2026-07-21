const STATUS_INFORMATION = {
  todo: {
    label: "未着手",
    className: "status-todo"
  },

  working: {
    label: "作業中",
    className: "status-working"
  },

  review: {
    label: "確認中",
    className: "status-review"
  },

  fix: {
    label: "修正中",
    className: "status-fix"
  },

  done: {
    label: "完了",
    className: "status-done"
  }
};

const DEFAULT_FILTER_SETTINGS = {
  searchKeyword: "",
  status: "all",
  assignee: "all",
  deadline: "all",
  sort: "deadlineAsc"
};

function createSafeText(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(
    value
  ).trim();
}

function normalizeSearchText(
  value
) {
  return createSafeText(
    value
  ).toLocaleLowerCase(
    "ja"
  );
}

function isValidDate(
  date
) {
  return (
    date instanceof Date &&
    !Number.isNaN(
      date.getTime()
    )
  );
}

function createSafeDate(
  value
) {
  if (
    value instanceof Date
  ) {
    const copiedDate =
      new Date(
        value.getFullYear(),
        value.getMonth(),
        value.getDate()
      );

    return isValidDate(
      copiedDate
    )
      ? copiedDate
      : null;
  }

  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const parts =
    value.split("-");

  if (
    parts.length !== 3
  ) {
    return null;
  }

  const year =
    Number(parts[0]);

  const month =
    Number(parts[1]);

  const day =
    Number(parts[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function getTodayDate() {
  const now =
    new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
}

function compareText(
  textA,
  textB
) {
  return createSafeText(
    textA
  ).localeCompare(
    createSafeText(
      textB
    ),
    "ja",
    {
      numeric: true,
      sensitivity: "base"
    }
  );
}

function compareDates(
  dateTextA,
  dateTextB,
  invalidDatePosition = "last"
) {
  const dateA =
    createSafeDate(
      dateTextA
    );

  const dateB =
    createSafeDate(
      dateTextB
    );

  if (
    dateA &&
    dateB
  ) {
    return (
      dateA.getTime() -
      dateB.getTime()
    );
  }

  if (
    !dateA &&
    !dateB
  ) {
    return 0;
  }

  if (
    invalidDatePosition ===
    "first"
  ) {
    return dateA
      ? 1
      : -1;
  }

  return dateA
    ? -1
    : 1;
}

function normalizeFilterSettings(
  settings = {}
) {
  return {
    searchKeyword:
      createSafeText(
        settings.searchKeyword ??
        settings.search ??
        DEFAULT_FILTER_SETTINGS.searchKeyword
      ),

    status:
      createSafeText(
        settings.status ??
        DEFAULT_FILTER_SETTINGS.status
      ) || "all",

    assignee:
      createSafeText(
        settings.assignee ??
        DEFAULT_FILTER_SETTINGS.assignee
      ) || "all",

    deadline:
      createSafeText(
        settings.deadline ??
        DEFAULT_FILTER_SETTINGS.deadline
      ) || "all",

    sort:
      createSafeText(
        settings.sort ??
        settings.sortOrder ??
        DEFAULT_FILTER_SETTINGS.sort
      ) || "deadlineAsc"
  };
}

function matchesSearchKeyword(
  task,
  searchKeyword
) {
  const normalizedKeyword =
    normalizeSearchText(
      searchKeyword
    );

  if (
    normalizedKeyword === ""
  ) {
    return true;
  }

  const searchableValues = [
    task.title,
    task.description,
    getTaskAssignee(task),
    getStatusLabel(task.status),
    task.createdAt,
    task.deadline
  ];

  return searchableValues.some(
    function (value) {
      return normalizeSearchText(
        value
      ).includes(
        normalizedKeyword
      );
    }
  );
}

function matchesStatus(
  task,
  selectedStatus
) {
  if (
    selectedStatus === "all" ||
    selectedStatus === ""
  ) {
    return true;
  }

  return (
    createSafeText(
      task.status
    ) ===
    selectedStatus
  );
}

function matchesAssignee(
  task,
  selectedAssignee
) {
  if (
    selectedAssignee === "all" ||
    selectedAssignee === ""
  ) {
    return true;
  }

  return (
    getTaskAssignee(
      task
    ) ===
    selectedAssignee
  );
}

function matchesDeadline(
  task,
  deadlineFilter
) {
  if (
    deadlineFilter === "all" ||
    deadlineFilter === ""
  ) {
    return true;
  }

  if (
    deadlineFilter === "expired"
  ) {
    return isTaskExpired(
      task
    );
  }

  if (
    deadlineFilter === "today"
  ) {
    const deadline =
      createSafeDate(
        task.deadline
      );

    const today =
      getTodayDate();

    if (!deadline) {
      return false;
    }

    return (
      deadline.getTime() ===
      today.getTime()
    );
  }

  if (
    deadlineFilter === "week"
  ) {
    const deadline =
      createSafeDate(
        task.deadline
      );

    if (!deadline) {
      return false;
    }

    const today =
      getTodayDate();

    const sevenDaysLater =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 7
      );

    return (
      deadline.getTime() >=
        today.getTime() &&
      deadline.getTime() <=
        sevenDaysLater.getTime()
    );
  }

  if (
    deadlineFilter === "month"
  ) {
    const deadline =
      createSafeDate(
        task.deadline
      );

    if (!deadline) {
      return false;
    }

    const today =
      getTodayDate();

    return (
      deadline.getFullYear() ===
        today.getFullYear() &&
      deadline.getMonth() ===
        today.getMonth()
    );
  }

  if (
    deadlineFilter ===
    "noDeadline"
  ) {
    return (
      createSafeDate(
        task.deadline
      ) === null
    );
  }

  return true;
}

function sortByStatus(
  taskA,
  taskB
) {
  const statusOrder = {
    todo: 0,
    working: 1,
    review: 2,
    fix: 3,
    done: 4
  };

  const orderA =
    statusOrder[
      taskA.status
    ] ?? 999;

  const orderB =
    statusOrder[
      taskB.status
    ] ?? 999;

  if (
    orderA !== orderB
  ) {
    return orderA - orderB;
  }

  return compareDates(
    taskA.deadline,
    taskB.deadline
  );
}

function sortTaskArray(
  taskArray,
  sortType
) {
  const copiedTasks = [
    ...taskArray
  ];

  copiedTasks.sort(
    function (taskA, taskB) {
      switch (sortType) {
        case "deadlineDesc":
          return compareDates(
            taskB.deadline,
            taskA.deadline
          );

        case "startDateAsc":
        case "createdAtAsc":
          return compareDates(
            taskA.createdAt,
            taskB.createdAt
          );

        case "startDateDesc":
        case "createdAtDesc":
          return compareDates(
            taskB.createdAt,
            taskA.createdAt
          );

        case "titleAsc":
          return compareText(
            taskA.title,
            taskB.title
          );

        case "titleDesc":
          return compareText(
            taskB.title,
            taskA.title
          );

        case "assigneeAsc":
          return compareText(
            getTaskAssignee(taskA),
            getTaskAssignee(taskB)
          );

        case "assigneeDesc":
          return compareText(
            getTaskAssignee(taskB),
            getTaskAssignee(taskA)
          );

        case "status":
        case "statusAsc":
          return sortByStatus(
            taskA,
            taskB
          );

        case "deadlineAsc":
        default:
          return compareDates(
            taskA.deadline,
            taskB.deadline
          );
      }
    }
  );

  return copiedTasks;
}

export function getStatusLabel(
  status
) {
  const normalizedStatus =
    createSafeText(
      status
    );

  return (
    STATUS_INFORMATION[
      normalizedStatus
    ]?.label ??
    "不明"
  );
}

export function getStatusClass(
  status
) {
  const normalizedStatus =
    createSafeText(
      status
    );

  return (
    STATUS_INFORMATION[
      normalizedStatus
    ]?.className ??
    "status-unknown"
  );
}

export function getTaskAssignee(
  task
) {
  if (
    !task ||
    typeof task !==
      "object"
  ) {
    return "未設定";
  }

  const assignee =
    createSafeText(
      task.assignee
    );

  return assignee !== ""
    ? assignee
    : "未設定";
}

export function isTaskExpired(
  task
) {
  if (
    !task ||
    typeof task !==
      "object"
  ) {
    return false;
  }

  if (
    task.status === "done"
  ) {
    return false;
  }

  const deadline =
    createSafeDate(
      task.deadline
    );

  if (!deadline) {
    return false;
  }

  const today =
    getTodayDate();

  return (
    deadline.getTime() <
    today.getTime()
  );
}

export function filterTasks(
  taskArray,
  filterSettings = {}
) {
  const safeTasks =
    Array.isArray(
      taskArray
    )
      ? taskArray.filter(
          function (task) {
            return (
              task &&
              typeof task ===
                "object"
            );
          }
        )
      : [];

  const settings =
    normalizeFilterSettings(
      filterSettings
    );

  const filteredTasks =
    safeTasks.filter(
      function (task) {
        return (
          matchesSearchKeyword(
            task,
            settings.searchKeyword
          ) &&
          matchesStatus(
            task,
            settings.status
          ) &&
          matchesAssignee(
            task,
            settings.assignee
          ) &&
          matchesDeadline(
            task,
            settings.deadline
          )
        );
      }
    );

  return sortTaskArray(
    filteredTasks,
    settings.sort
  );
}

export function sortTasks(
  taskArray,
  sortType =
    DEFAULT_FILTER_SETTINGS.sort
) {
  const safeTasks =
    Array.isArray(
      taskArray
    )
      ? taskArray.filter(
          function (task) {
            return (
              task &&
              typeof task ===
                "object"
            );
          }
        )
      : [];

  return sortTaskArray(
    safeTasks,
    sortType
  );
}

export function applyTaskFilters(
  taskArray,
  filterSettings = {}
) {
  return filterTasks(
    taskArray,
    filterSettings
  );
}

export function getFilteredTasks(
  taskArray,
  filterSettings = {}
) {
  return filterTasks(
    taskArray,
    filterSettings
  );
}

export function getDefaultFilterSettings() {
  return {
    ...DEFAULT_FILTER_SETTINGS
  };
}