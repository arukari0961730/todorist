const COMMENT_STORAGE_KEY =
  "taskManagerTaskComments";

export const taskComments = [];

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

function normalizeTaskId(value) {
  const taskId =
    Number(value);

  if (
    !Number.isSafeInteger(taskId) ||
    taskId <= 0
  ) {
    return null;
  }

  return taskId;
}

function createUniqueCommentId() {
  let id =
    "comment-" + Date.now();

  let number = 1;

  while (
    taskComments.some(
      function (comment) {
        return comment.id === id;
      }
    )
  ) {
    id =
      "comment-" +
      Date.now() +
      "-" +
      number;

    number++;
  }

  return id;
}

function normalizeCreatedAt(value) {
  const text =
    createSafeText(value);

  if (text !== "") {
    const date =
      new Date(text);

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      return date.toISOString();
    }
  }

  return new Date().toISOString();
}

function normalizeComment(
  comment,
  usedIds
) {
  if (!isPlainObject(comment)) {
    return null;
  }

  const taskId =
    normalizeTaskId(
      comment.taskId
    );

  const teamId =
    createSafeText(
      comment.teamId
    );

  const sender =
    createSafeText(
      comment.sender,
      "匿名"
    ).slice(0, 30);

  const text =
    createSafeText(
      comment.text ??
      comment.comment
    ).slice(0, 500);

  if (
    taskId === null ||
    teamId === "" ||
    text === ""
  ) {
    return null;
  }

  let id =
    createSafeText(
      comment.id
    );

  if (
    id === "" ||
    usedIds.has(id)
  ) {
    id =
      "comment-" +
      Date.now() +
      "-" +
      usedIds.size;
  }

  usedIds.add(id);

  return {
    id,
    taskId,
    teamId,
    sender,
    text,
    createdAt:
      normalizeCreatedAt(
        comment.createdAt
      )
  };
}

function normalizeCommentArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const usedIds =
    new Set();

  return value
    .map(
      function (comment) {
        return normalizeComment(
          comment,
          usedIds
        );
      }
    )
    .filter(
      function (comment) {
        return comment !== null;
      }
    );
}

function replaceComments(
  newComments
) {
  taskComments.splice(
    0,
    taskComments.length,
    ...newComments
  );
}

export function saveTaskComments() {
  try {
    localStorage.setItem(
      COMMENT_STORAGE_KEY,
      JSON.stringify(
        taskComments
      )
    );

    return true;
  } catch (error) {
    console.error(
      "タスクコメントの保存に失敗しました",
      error
    );

    return false;
  }
}

export function loadTaskComments() {
  let storedText = null;

  try {
    storedText =
      localStorage.getItem(
        COMMENT_STORAGE_KEY
      );
  } catch (error) {
    console.error(
      "タスクコメントの読み込みに失敗しました",
      error
    );
  }

  let loadedComments = [];

  if (storedText) {
    try {
      loadedComments =
        normalizeCommentArray(
          JSON.parse(
            storedText
          )
        );
    } catch (error) {
      console.error(
        "保存されたタスクコメントが壊れています",
        error
      );
    }
  }

  replaceComments(
    loadedComments
  );

  saveTaskComments();

  return exportTaskComments();
}

export function getCommentsByTaskId(
  taskId
) {
  const safeTaskId =
    normalizeTaskId(taskId);

  if (safeTaskId === null) {
    return [];
  }

  return taskComments
    .filter(
      function (comment) {
        return (
          comment.taskId ===
          safeTaskId
        );
      }
    )
    .sort(
      function (
        commentA,
        commentB
      ) {
        return (
          new Date(
            commentA.createdAt
          ).getTime() -
          new Date(
            commentB.createdAt
          ).getTime()
        );
      }
    )
    .map(
      function (comment) {
        return {
          ...comment
        };
      }
    );
}

export function addTaskComment(
  commentInput
) {
  if (!isPlainObject(commentInput)) {
    return {
      success: false,
      message:
        "コメントの内容が不正です"
    };
  }

  const taskId =
    normalizeTaskId(
      commentInput.taskId
    );

  const teamId =
    createSafeText(
      commentInput.teamId
    );

  const sender =
    createSafeText(
      commentInput.sender
    ).slice(0, 30);

  const text =
    createSafeText(
      commentInput.text
    ).slice(0, 500);

  if (taskId === null) {
    return {
      success: false,
      message:
        "コメント先のタスクが不正です"
    };
  }

  if (teamId === "") {
    return {
      success: false,
      message:
        "コメント先のチームが不正です"
    };
  }

  if (sender === "") {
    return {
      success: false,
      message:
        "名前を入力してください"
    };
  }

  if (text === "") {
    return {
      success: false,
      message:
        "コメントを入力してください"
    };
  }

  const newComment = {
    id:
      createUniqueCommentId(),
    taskId,
    teamId,
    sender,
    text,
    createdAt:
      new Date().toISOString()
  };

  taskComments.push(
    newComment
  );

  if (!saveTaskComments()) {
    taskComments.pop();

    return {
      success: false,
      message:
        "コメントを保存できませんでした"
    };
  }

  return {
    success: true,
    comment: {
      ...newComment
    }
  };
}

export function deleteTaskComment(
  commentId
) {
  const safeCommentId =
    createSafeText(commentId);

  const targetIndex =
    taskComments.findIndex(
      function (comment) {
        return (
          comment.id ===
          safeCommentId
        );
      }
    );

  if (targetIndex === -1) {
    return false;
  }

  const deletedComment =
    taskComments[targetIndex];

  taskComments.splice(
    targetIndex,
    1
  );

  if (!saveTaskComments()) {
    taskComments.splice(
      targetIndex,
      0,
      deletedComment
    );

    return false;
  }

  return true;
}

export function deleteCommentsByTaskId(
  taskId
) {
  const safeTaskId =
    normalizeTaskId(taskId);

  if (safeTaskId === null) {
    return false;
  }

  const backup =
    exportTaskComments();

  const remainingComments =
    taskComments.filter(
      function (comment) {
        return (
          comment.taskId !==
          safeTaskId
        );
      }
    );

  replaceComments(
    remainingComments
  );

  if (!saveTaskComments()) {
    replaceComments(
      backup
    );

    return false;
  }

  return true;
}

export function deleteCommentsByTeamId(
  teamId
) {
  const safeTeamId =
    createSafeText(teamId);

  if (safeTeamId === "") {
    return false;
  }

  const backup =
    exportTaskComments();

  const remainingComments =
    taskComments.filter(
      function (comment) {
        return (
          comment.teamId !==
          safeTeamId
        );
      }
    );

  replaceComments(
    remainingComments
  );

  if (!saveTaskComments()) {
    replaceComments(
      backup
    );

    return false;
  }

  return true;
}

export function exportTaskComments() {
  return taskComments.map(
    function (comment) {
      return {
        ...comment
      };
    }
  );
}

export function importTaskComments(
  commentData
) {
  const normalizedComments =
    normalizeCommentArray(
      commentData
    );

  replaceComments(
    normalizedComments
  );

  return saveTaskComments();
}
