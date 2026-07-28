const PR_STORAGE_KEY =
  "taskManagerPullRequests";

const VALID_STATUSES = [
  "draft",
  "review",
  "changes",
  "merged",
  "closed"
];

export const pullRequests = [];

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function createSafeText(
  value,
  fallback = ""
) {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  const text =
    String(value).trim();

  return text !== ""
    ? text
    : fallback;
}

function createUniquePRId() {
  let id =
    "pr-" + Date.now();

  let suffix = 1;

  while (
    pullRequests.some(
      function (item) {
        return item.id === id;
      }
    )
  ) {
    id =
      "pr-" +
      Date.now() +
      "-" +
      suffix;

    suffix++;
  }

  return id;
}

function normalizeStatus(status) {
  const safeStatus =
    createSafeText(
      status,
      "review"
    );

  return VALID_STATUSES.includes(
    safeStatus
  )
    ? safeStatus
    : "review";
}

function normalizeRelatedTaskId(value) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const taskId = Number(value);

  return Number.isSafeInteger(taskId)
    ? taskId
    : null;
}

function normalizeDateText(value) {
  const safeText =
    createSafeText(value);

  const date =
    new Date(safeText);

  return Number.isNaN(
    date.getTime()
  )
    ? new Date().toISOString()
    : date.toISOString();
}

function normalizePullRequest(item) {
  if (!isPlainObject(item)) {
    return null;
  }

  const teamId =
    createSafeText(item.teamId);

  const title =
    createSafeText(item.title);

  const url =
    createSafeText(item.url);

  if (
    teamId === "" ||
    title === "" ||
    url === ""
  ) {
    return null;
  }

  return {
    id:
      createSafeText(
        item.id,
        createUniquePRId()
      ),

    teamId,

    title:
      title.slice(0, 100),

    url:
      url.slice(0, 500),

    assignee:
      createSafeText(
        item.assignee,
        "未設定"
      ).slice(0, 30),

    status:
      normalizeStatus(
        item.status
      ),

    relatedTaskId:
      normalizeRelatedTaskId(
        item.relatedTaskId
      ),

    note:
      createSafeText(
        item.note
      ).slice(0, 1000),

    createdAt:
      normalizeDateText(
        item.createdAt
      )
  };
}

function normalizePullRequestArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const usedIds =
    new Set();

  return value
    .map(
      function (item) {
        const normalized =
          normalizePullRequest(item);

        if (!normalized) {
          return null;
        }

        if (
          usedIds.has(
            normalized.id
          )
        ) {
          normalized.id =
            createUniquePRId();
        }

        usedIds.add(
          normalized.id
        );

        return normalized;
      }
    )
    .filter(
      function (item) {
        return item !== null;
      }
    );
}

function replacePullRequests(items) {
  pullRequests.splice(
    0,
    pullRequests.length,
    ...items
  );
}

export function savePullRequests() {
  try {
    localStorage.setItem(
      PR_STORAGE_KEY,
      JSON.stringify(
        pullRequests
      )
    );

    return true;
  } catch (error) {
    console.error(
      "PR共有データの保存に失敗しました",
      error
    );

    return false;
  }
}

export function loadPullRequests() {
  let storedText = null;

  try {
    storedText =
      localStorage.getItem(
        PR_STORAGE_KEY
      );
  } catch (error) {
    console.error(
      "PR共有データの読み込みに失敗しました",
      error
    );
  }

  if (!storedText) {
    replacePullRequests([]);
    return [];
  }

  try {
    const normalized =
      normalizePullRequestArray(
        JSON.parse(storedText)
      );

    replacePullRequests(
      normalized
    );

    savePullRequests();
  } catch (error) {
    console.error(
      "保存されたPR共有データが壊れています",
      error
    );

    replacePullRequests([]);
  }

  return exportPullRequests();
}

function isValidHttpUrl(urlText) {
  try {
    const url =
      new URL(urlText);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch (error) {
    return false;
  }
}

export function getPullRequestsByTeamId(
  teamId
) {
  const safeTeamId =
    createSafeText(teamId);

  return pullRequests
    .filter(
      function (item) {
        return (
          item.teamId ===
          safeTeamId
        );
      }
    )
    .sort(
      function (itemA, itemB) {
        return (
          new Date(
            itemB.createdAt
          ).getTime() -
          new Date(
            itemA.createdAt
          ).getTime()
        );
      }
    )
    .map(
      function (item) {
        return {
          ...item
        };
      }
    );
}

export function addPullRequest(
  input
) {
  if (!isPlainObject(input)) {
    return {
      success: false,
      message:
        "PR情報が不正です"
    };
  }

  const teamId =
    createSafeText(input.teamId);

  const title =
    createSafeText(input.title);

  const url =
    createSafeText(input.url);

  if (teamId === "") {
    return {
      success: false,
      message:
        "チームが選択されていません"
    };
  }

  if (title === "") {
    return {
      success: false,
      message:
        "PRタイトルを入力してください"
    };
  }

  if (url === "") {
    return {
      success: false,
      message:
        "PRのURLを入力してください"
    };
  }

  if (!isValidHttpUrl(url)) {
    return {
      success: false,
      message:
        "httpまたはhttpsの正しいURLを入力してください"
    };
  }

  const newItem =
    normalizePullRequest({
      id:
        createUniquePRId(),
      teamId,
      title,
      url,
      assignee:
        input.assignee,
      status:
        input.status,
      relatedTaskId:
        input.relatedTaskId,
      note:
        input.note,
      createdAt:
        new Date().toISOString()
    });

  if (!newItem) {
    return {
      success: false,
      message:
        "PR情報を作成できませんでした"
    };
  }

  pullRequests.push(
    newItem
  );

  if (!savePullRequests()) {
    pullRequests.pop();

    return {
      success: false,
      message:
        "PR情報を保存できませんでした"
    };
  }

  return {
    success: true,
    pullRequest: {
      ...newItem
    }
  };
}

export function updatePullRequestStatus(
  pullRequestId,
  status
) {
  const safeId =
    createSafeText(
      pullRequestId
    );

  const target =
    pullRequests.find(
      function (item) {
        return item.id === safeId;
      }
    );

  if (!target) {
    return false;
  }

  const oldStatus =
    target.status;

  target.status =
    normalizeStatus(status);

  if (!savePullRequests()) {
    target.status =
      oldStatus;

    return false;
  }

  return true;
}

export function deletePullRequest(
  pullRequestId
) {
  const safeId =
    createSafeText(
      pullRequestId
    );

  const targetIndex =
    pullRequests.findIndex(
      function (item) {
        return item.id === safeId;
      }
    );

  if (targetIndex === -1) {
    return false;
  }

  const deletedItem =
    pullRequests[targetIndex];

  pullRequests.splice(
    targetIndex,
    1
  );

  if (!savePullRequests()) {
    pullRequests.splice(
      targetIndex,
      0,
      deletedItem
    );

    return false;
  }

  return true;
}

export function deletePullRequestsByTeamId(
  teamId
) {
  const safeTeamId =
    createSafeText(teamId);

  const backup =
    exportPullRequests();

  replacePullRequests(
    pullRequests.filter(
      function (item) {
        return (
          item.teamId !==
          safeTeamId
        );
      }
    )
  );

  if (!savePullRequests()) {
    replacePullRequests(
      backup
    );

    return false;
  }

  return true;
}

export function exportPullRequests() {
  return pullRequests.map(
    function (item) {
      return {
        ...item
      };
    }
  );
}

export function importPullRequests(
  data
) {
  replacePullRequests(
    normalizePullRequestArray(data)
  );

  return savePullRequests();
}
