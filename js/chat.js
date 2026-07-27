import {
  getActiveTeam
} from "./teams.js";

import {
  getMessagesByTeamId,
  addMessage,
  deleteMessage
} from "./chatData.js";

const CHAT_SENDER_STORAGE_KEY =
  "taskManagerChatSenderName";

const chatTeamTitle =
  document.getElementById(
    "chatTeamTitle"
  );

const chatMessageList =
  document.getElementById(
    "chatMessageList"
  );

const chatForm =
  document.getElementById(
    "chatForm"
  );

const chatSenderInput =
  document.getElementById(
    "chatSenderInput"
  );

const chatTextInput =
  document.getElementById(
    "chatTextInput"
  );

const chatErrorMessage =
  document.getElementById(
    "chatErrorMessage"
  );

let isChatInitialized = false;

function setErrorMessage(message) {
  if (!chatErrorMessage) {
    return;
  }

  chatErrorMessage.textContent =
    message;
}

function loadSenderName() {
  if (!chatSenderInput) {
    return;
  }

  try {
    const storedName =
      localStorage.getItem(
        CHAT_SENDER_STORAGE_KEY
      );

    if (storedName) {
      chatSenderInput.value =
        storedName;
    }
  } catch (error) {
    console.error(
      "チャットの名前を読み込めませんでした",
      error
    );
  }
}

function saveSenderName(name) {
  try {
    localStorage.setItem(
      CHAT_SENDER_STORAGE_KEY,
      name
    );
  } catch (error) {
    console.error(
      "チャットの名前を保存できませんでした",
      error
    );
  }
}

function formatMessageDate(
  dateText
) {
  const date =
    new Date(dateText);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "日時不明";
  }

  return new Intl.DateTimeFormat(
    "ja-JP",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(date);
}

function createEmptyMessage() {
  const empty =
    document.createElement(
      "div"
    );

  empty.classList.add(
    "chat-empty"
  );

  empty.textContent =
    "まだメッセージはありません";

  return empty;
}

function createMessageCard(
  message
) {
  const card =
    document.createElement(
      "article"
    );

  card.classList.add(
    "chat-message-card"
  );

  const header =
    document.createElement(
      "div"
    );

  header.classList.add(
    "chat-message-header"
  );

  const sender =
    document.createElement(
      "strong"
    );

  sender.classList.add(
    "chat-message-sender"
  );

  sender.textContent =
    message.sender;

  const time =
    document.createElement(
      "time"
    );

  time.classList.add(
    "chat-message-time"
  );

  time.dateTime =
    message.createdAt;

  time.textContent =
    formatMessageDate(
      message.createdAt
    );

  const headerText =
    document.createElement(
      "div"
    );

  headerText.classList.add(
    "chat-message-header-text"
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

  deleteButton.type = "button";
  deleteButton.classList.add(
    "chat-delete-btn"
  );

  deleteButton.textContent =
    "削除";

  deleteButton.addEventListener(
    "click",
    function () {
      const confirmed =
        window.confirm(
          "このメッセージを削除しますか？"
        );

      if (!confirmed) {
        return;
      }

      const deleted =
        deleteMessage(
          message.id
        );

      if (!deleted) {
        setErrorMessage(
          "メッセージを削除できませんでした"
        );

        return;
      }

      setErrorMessage("");
      renderChat();
    }
  );

  header.appendChild(
    headerText
  );

  header.appendChild(
    deleteButton
  );

  const body =
    document.createElement(
      "p"
    );

  body.classList.add(
    "chat-message-text"
  );

  body.textContent =
    message.text;

  card.appendChild(
    header
  );

  card.appendChild(
    body
  );

  return card;
}

function scrollToLatestMessage() {
  if (!chatMessageList) {
    return;
  }

  chatMessageList.scrollTop =
    chatMessageList.scrollHeight;
}

export function renderChat() {
  const activeTeam =
    getActiveTeam();

  if (chatTeamTitle) {
    chatTeamTitle.textContent =
      activeTeam
        ? activeTeam.name +
          " のチャット"
        : "チーム未選択";
  }

  if (!chatMessageList) {
    return;
  }

  chatMessageList.innerHTML = "";

  if (!activeTeam) {
    chatMessageList.appendChild(
      createEmptyMessage()
    );

    return;
  }

  const messages =
    getMessagesByTeamId(
      activeTeam.id
    );

  if (messages.length === 0) {
    chatMessageList.appendChild(
      createEmptyMessage()
    );

    return;
  }

  messages.forEach(
    function (message) {
      chatMessageList.appendChild(
        createMessageCard(
          message
        )
      );
    }
  );

  scrollToLatestMessage();
}

function handleMessageSubmission(
  event
) {
  event.preventDefault();

  const activeTeam =
    getActiveTeam();

  const sender =
    chatSenderInput
      ? chatSenderInput.value.trim()
      : "";

  const text =
    chatTextInput
      ? chatTextInput.value.trim()
      : "";

  const result =
    addMessage({
      teamId:
        activeTeam
          ? activeTeam.id
          : "",
      sender,
      text
    });

  if (!result.success) {
    setErrorMessage(
      result.message
    );

    return;
  }

  saveSenderName(sender);
  setErrorMessage("");

  if (chatTextInput) {
    chatTextInput.value = "";
    chatTextInput.focus();
  }

  renderChat();
}

export function setupChat() {
  if (isChatInitialized) {
    return;
  }

  loadSenderName();

  if (chatForm) {
    chatForm.addEventListener(
      "submit",
      handleMessageSubmission
    );
  }

  if (chatTextInput) {
    chatTextInput.addEventListener(
      "keydown",
      function (event) {
        if (
          event.key === "Enter" &&
          (event.ctrlKey ||
            event.metaKey)
        ) {
          event.preventDefault();

          if (chatForm) {
            chatForm.requestSubmit();
          }
        }
      }
    );
  }

  isChatInitialized = true;
  renderChat();
}
