import {
  isTaskExpired
} from "./filters.js";

const dashboardElements = {
  counts: {
    all:
      document.getElementById("allCount"),

    todo:
      document.getElementById("todoCount"),

    working:
      document.getElementById("workingCount"),

    review:
      document.getElementById("reviewCount"),

    fix:
      document.getElementById("fixCount"),

    done:
      document.getElementById("doneCount"),

    expired:
      document.getElementById("expiredCount")
  },

  cards: {
    all:
      document.getElementById("allCard"),

    todo:
      document.getElementById("todoCard"),

    working:
      document.getElementById("workingCard"),

    review:
      document.getElementById("reviewCard"),

    fix:
      document.getElementById("fixCard"),

    done:
      document.getElementById("doneCard"),

    expired:
      document.getElementById("expiredCard")
  }
};

let isDashboardInitialized = false;

function setCount(
  element,
  count
) {
  if (!element) {
    return;
  }

  element.textContent =
    String(count);
}

function countTasksByStatus(
  tasks,
  status
) {
  return tasks.filter(
    function (task) {
      return task.status === status;
    }
  ).length;
}

function addCardClickEvent(
  card,
  filterSettings,
  onFilterChange
) {
  if (!card) {
    return;
  }

  card.addEventListener(
    "click",
    function () {
      onFilterChange(
        filterSettings
      );
    }
  );
}

export function renderDashboard(
  tasks
) {
  const safeTasks =
    Array.isArray(tasks)
      ? tasks
      : [];

  setCount(
    dashboardElements.counts.all,
    safeTasks.length
  );

  setCount(
    dashboardElements.counts.todo,
    countTasksByStatus(
      safeTasks,
      "todo"
    )
  );

  setCount(
    dashboardElements.counts.working,
    countTasksByStatus(
      safeTasks,
      "working"
    )
  );

  setCount(
    dashboardElements.counts.review,
    countTasksByStatus(
      safeTasks,
      "review"
    )
  );

  setCount(
    dashboardElements.counts.fix,
    countTasksByStatus(
      safeTasks,
      "fix"
    )
  );

  setCount(
    dashboardElements.counts.done,
    countTasksByStatus(
      safeTasks,
      "done"
    )
  );

  const expiredTaskCount =
    safeTasks.filter(
      function (task) {
        return isTaskExpired(task);
      }
    ).length;

  setCount(
    dashboardElements.counts.expired,
    expiredTaskCount
  );
}

export function setupDashboard(
  onFilterChange
) {
  if (isDashboardInitialized) {
    return;
  }

  if (
    typeof onFilterChange !==
    "function"
  ) {
    console.error(
      "ダッシュボードのフィルター処理が設定されていません"
    );

    return;
  }

  addCardClickEvent(
    dashboardElements.cards.all,
    {
      status: "all",
      assignee: "all",
      deadline: "all"
    },
    onFilterChange
  );

  addCardClickEvent(
    dashboardElements.cards.todo,
    {
      status: "todo",
      deadline: "all"
    },
    onFilterChange
  );

  addCardClickEvent(
    dashboardElements.cards.working,
    {
      status: "working",
      deadline: "all"
    },
    onFilterChange
  );

  addCardClickEvent(
    dashboardElements.cards.review,
    {
      status: "review",
      deadline: "all"
    },
    onFilterChange
  );

  addCardClickEvent(
    dashboardElements.cards.fix,
    {
      status: "fix",
      deadline: "all"
    },
    onFilterChange
  );

  addCardClickEvent(
    dashboardElements.cards.done,
    {
      status: "done",
      deadline: "all"
    },
    onFilterChange
  );

  addCardClickEvent(
    dashboardElements.cards.expired,
    {
      status: "all",
      deadline: "expired"
    },
    onFilterChange
  );

  isDashboardInitialized = true;
}