import {
  STATUS_LIST,
  STATUS_ORDER,
  getTodayString
} from "./data.js";

export function getStatusLabel(statusValue) {
  const foundStatus = STATUS_LIST.find(function (status) {
    return status.value === statusValue;
  });

  if (!foundStatus) {
    return "未着手";
  }

  return foundStatus.label;
}

export function getStatusClass(statusValue) {
  return "status-" + statusValue;
}

export function isTaskDone(task) {
  return task.status === "done";
}

export function isTaskExpired(task) {
  return (
    task.deadline < getTodayString() &&
    !isTaskDone(task)
  );
}

export function isTaskDueToday(task) {
  return task.deadline === getTodayString();
}

export function getTaskAssignee(task) {
  if (!task.assignee || task.assignee.trim() === "") {
    return "未設定";
  }

  return task.assignee.trim();
}

export function filterTasks(taskArray, filterSettings) {
  const {
    searchKeyword,
    statusFilter,
    assigneeFilter,
    deadlineFilter
  } = filterSettings;

  let result = taskArray.slice();

  if (searchKeyword !== "") {
    const keyword = searchKeyword.toLowerCase();

    result = result.filter(function (task) {
      const title = task.title.toLowerCase();
      const description = task.description.toLowerCase();
      const assignee = getTaskAssignee(task).toLowerCase();
      const statusLabel = getStatusLabel(task.status).toLowerCase();

      return (
        title.includes(keyword) ||
        description.includes(keyword) ||
        assignee.includes(keyword) ||
        statusLabel.includes(keyword)
      );
    });
  }

  if (statusFilter !== "all") {
    result = result.filter(function (task) {
      return task.status === statusFilter;
    });
  }

  if (assigneeFilter !== "all") {
    result = result.filter(function (task) {
      return getTaskAssignee(task) === assigneeFilter;
    });
  }

  if (deadlineFilter === "expired") {
    result = result.filter(function (task) {
      return isTaskExpired(task);
    });
  }

  if (deadlineFilter === "today") {
    result = result.filter(function (task) {
      return isTaskDueToday(task);
    });
  }

  return result;
}

export function sortTasks(taskArray, selectedSort) {
  const sortedTasks = taskArray.slice();

  sortedTasks.sort(function (a, b) {
    if (selectedSort === "deadline") {
      return a.deadline.localeCompare(b.deadline);
    }

    if (selectedSort === "startDate") {
      return a.createdAt.localeCompare(b.createdAt);
    }

    if (selectedSort === "title") {
      return a.title.localeCompare(b.title, "ja");
    }

    if (selectedSort === "assignee") {
      return getTaskAssignee(a).localeCompare(
        getTaskAssignee(b),
        "ja"
      );
    }

    if (selectedSort === "status") {
      const difference =
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status];

      if (difference !== 0) {
        return difference;
      }

      return a.deadline.localeCompare(b.deadline);
    }

    return a.deadline.localeCompare(b.deadline);
  });

  return sortedTasks;
}