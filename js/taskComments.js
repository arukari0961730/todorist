import {
  getCommentsByTaskId,
  addTaskComment,
  deleteTaskComment
} from "./taskCommentData.js";

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

function formatCommentDate(value) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "日時不明";
  }

  return date.toLocaleString(
    "ja-JP",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}

function createCommentCard(
  comment,
  onDelete
) {
  const card =
    document.createElement(
      "article"
    );

  card.classList.add(
    "task-comment-card"
  );

  const header =
    document.createElement(
      "div"
    );

  header.classList.add(
    "task-comment-header"
  );

  const headerText =
    document.createElement(
      "div"
    );

  headerText.classList.add(
    "task-comment-header-text"
  );

  const sender =
    document.createElement(
      "strong"
    );

  sender.classList.add(
    "task-comment-sender"
  );

  sender.textContent =
    createSafeText(
      comment.sender,
      "匿名"
    );

  const time =
    document.createElement(
      "span"
    );

  time.classList.add(
    "task-comment-time"
  );

  time.textContent =
    formatCommentDate(
      comment.createdAt
    );

  headerText.appendChild(
    sender
  );

  headerText.appendChild(
    time
  );

  const deleteButton =
    document.createElement(
      "button"
    );

  deleteButton.type =
    "button";

  deleteButton.classList.add(
    "task-comment-delete-btn"
  );

  deleteButton.textContent =
    "削除";

  deleteButton.addEventListener(
    "click",
    function () {
      const confirmed =
        window.confirm(
          "このコメントを削除しますか？"
        );

      if (!confirmed) {
        return;
      }

      const deleted =
        deleteTaskComment(
          comment.id
        );

      if (!deleted) {
        window.alert(
          "コメントを削除できませんでした"
        );

        return;
      }

      if (
        typeof onDelete ===
        "function"
      ) {
        onDelete();
      }
    }
  );

  header.appendChild(
    headerText
  );

  header.appendChild(
    deleteButton
  );

  const text =
    document.createElement(
      "p"
    );

  text.classList.add(
    "task-comment-text"
  );

  text.textContent =
    createSafeText(
      comment.text
    );

  card.appendChild(
    header
  );

  card.appendChild(
    text
  );

  return card;
}

export function renderTaskCommentsSection(
  task
) {
  const section =
    document.createElement(
      "section"
    );

  section.classList.add(
    "task-comments-section"
  );

  const heading =
    document.createElement(
      "h4"
    );

  heading.textContent =
    "コメント";

  const list =
    document.createElement(
      "div"
    );

  list.classList.add(
    "task-comment-list"
  );

  const senderInput =
    document.createElement(
      "input"
    );

  senderInput.type =
    "text";

  senderInput.maxLength =
    30;

  senderInput.placeholder =
    "名前";

  senderInput.classList.add(
    "task-comment-sender-input"
  );

  const textInput =
    document.createElement(
      "textarea"
    );

  textInput.maxLength =
    500;

  textInput.placeholder =
    "このタスクについてコメントを入力";

  textInput.classList.add(
    "task-comment-text-input"
  );

  const formFooter =
    document.createElement(
      "div"
    );

  formFooter.classList.add(
    "task-comment-form-footer"
  );

  const hint =
    document.createElement(
      "span"
    );

  hint.textContent =
    "Ctrl + Enterでも送信できます";

  const sendButton =
    document.createElement(
      "button"
    );

  sendButton.type =
    "button";

  sendButton.classList.add(
    "task-comment-send-btn"
  );

  sendButton.textContent =
    "コメントを追加";

  const errorMessage =
    document.createElement(
      "p"
    );

  errorMessage.classList.add(
    "task-comment-error"
  );

  function renderCommentList() {
    list.innerHTML = "";

    const comments =
      getCommentsByTaskId(
        task.id
      );

    if (
      comments.length === 0
    ) {
      const empty =
        document.createElement(
          "p"
        );

      empty.classList.add(
        "task-comment-empty"
      );

      empty.textContent =
        "コメントはありません";

      list.appendChild(
        empty
      );

      return;
    }

    comments.forEach(
      function (comment) {
        list.appendChild(
          createCommentCard(
            comment,
            renderCommentList
          )
        );
      }
    );

    list.scrollTop =
      list.scrollHeight;
  }

  function handleCommentAddition() {
    errorMessage.textContent =
      "";

    const result =
      addTaskComment({
        taskId: task.id,
        teamId: task.teamId,
        sender:
          senderInput.value,
        text:
          textInput.value
      });

    if (!result.success) {
      errorMessage.textContent =
        result.message;

      return;
    }

    textInput.value = "";

    renderCommentList();

    textInput.focus();
  }

  sendButton.addEventListener(
    "click",
    handleCommentAddition
  );

  textInput.addEventListener(
    "keydown",
    function (event) {
      if (
        event.key === "Enter" &&
        event.ctrlKey
      ) {
        event.preventDefault();
        handleCommentAddition();
      }
    }
  );

  formFooter.appendChild(
    hint
  );

  formFooter.appendChild(
    sendButton
  );

  section.appendChild(
    heading
  );

  section.appendChild(
    list
  );

  section.appendChild(
    senderInput
  );

  section.appendChild(
    textInput
  );

  section.appendChild(
    formFooter
  );

  section.appendChild(
    errorMessage
  );

  renderCommentList();

  return section;
}
