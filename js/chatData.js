const CHAT_STORAGE_KEY =
  "taskManagerChatMessages";

export const chatMessages = [];

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

function createUniqueMessageId() {
  let id =
    "message-" + Date.now();

  let number = 1;

  while (
    chatMessages.some(
      function (message) {
        return message.id === id;
      }
    )
  ) {
    id =
      "message-" +
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

function normalizeMessage(
  message,
  usedIds
) {
  if (!isPlainObject(message)) {
    return null;
  }

  const teamId =
    createSafeText(
      message.teamId
    );

  const sender =
    createSafeText(
      message.sender,
      "匿名"
    ).slice(0, 30);

  const text =
    createSafeText(
      message.text ??
      message.message
    ).slice(0, 1000);

  if (
    teamId === "" ||
    text === ""
  ) {
    return null;
  }

  let id =
    createSafeText(
      message.id
    );

  if (
    id === "" ||
    usedIds.has(id)
  ) {
    id =
      "message-" +
      Date.now() +
      "-" +
      usedIds.size;
  }

  usedIds.add(id);

  return {
    id,
    teamId,
    sender,
    text,
    createdAt:
      normalizeCreatedAt(
        message.createdAt
      )
  };
}

function normalizeMessageArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const usedIds =
    new Set();

  return value
    .map(
      function (message) {
        return normalizeMessage(
          message,
          usedIds
        );
      }
    )
    .filter(
      function (message) {
        return message !== null;
      }
    );
}

function replaceMessages(
  newMessages
) {
  chatMessages.splice(
    0,
    chatMessages.length,
    ...newMessages
  );
}

export function saveMessages() {
  try {
    localStorage.setItem(
      CHAT_STORAGE_KEY,
      JSON.stringify(
        chatMessages
      )
    );

    return true;
  } catch (error) {
    console.error(
      "チャットデータの保存に失敗しました",
      error
    );

    return false;
  }
}

export function loadMessages() {
  let storedText = null;

  try {
    storedText =
      localStorage.getItem(
        CHAT_STORAGE_KEY
      );
  } catch (error) {
    console.error(
      "チャットデータの読み込みに失敗しました",
      error
    );
  }

  let loadedMessages = [];

  if (storedText) {
    try {
      loadedMessages =
        normalizeMessageArray(
          JSON.parse(
            storedText
          )
        );
    } catch (error) {
      console.error(
        "保存されたチャットデータが壊れています",
        error
      );
    }
  }

  replaceMessages(
    loadedMessages
  );

  saveMessages();

  return exportMessages();
}

export function getMessagesByTeamId(
  teamId
) {
  const safeTeamId =
    createSafeText(teamId);

  return chatMessages
    .filter(
      function (message) {
        return (
          message.teamId ===
          safeTeamId
        );
      }
    )
    .sort(
      function (
        messageA,
        messageB
      ) {
        return (
          new Date(
            messageA.createdAt
          ).getTime() -
          new Date(
            messageB.createdAt
          ).getTime()
        );
      }
    )
    .map(
      function (message) {
        return {
          ...message
        };
      }
    );
}

export function addMessage(
  messageInput
) {
  if (!isPlainObject(messageInput)) {
    return {
      success: false,
      message:
        "メッセージの内容が不正です"
    };
  }

  const teamId =
    createSafeText(
      messageInput.teamId
    );

  const sender =
    createSafeText(
      messageInput.sender
    ).slice(0, 30);

  const text =
    createSafeText(
      messageInput.text
    ).slice(0, 1000);

  if (teamId === "") {
    return {
      success: false,
      message:
        "送信先のチームが選択されていません"
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
        "メッセージを入力してください"
    };
  }

  const newMessage = {
    id:
      createUniqueMessageId(),
    teamId,
    sender,
    text,
    createdAt:
      new Date().toISOString()
  };

  chatMessages.push(
    newMessage
  );

  if (!saveMessages()) {
    chatMessages.pop();

    return {
      success: false,
      message:
        "メッセージを保存できませんでした"
    };
  }

  return {
    success: true,
    message: {
      ...newMessage
    }
  };
}

export function deleteMessage(
  messageId
) {
  const safeMessageId =
    createSafeText(messageId);

  const targetIndex =
    chatMessages.findIndex(
      function (message) {
        return (
          message.id ===
          safeMessageId
        );
      }
    );

  if (targetIndex === -1) {
    return false;
  }

  const deletedMessage =
    chatMessages[targetIndex];

  chatMessages.splice(
    targetIndex,
    1
  );

  if (!saveMessages()) {
    chatMessages.splice(
      targetIndex,
      0,
      deletedMessage
    );

    return false;
  }

  return true;
}

export function deleteMessagesByTeamId(
  teamId
) {
  const safeTeamId =
    createSafeText(teamId);

  const backup =
    exportMessages();

  const remainingMessages =
    chatMessages.filter(
      function (message) {
        return (
          message.teamId !==
          safeTeamId
        );
      }
    );

  replaceMessages(
    remainingMessages
  );

  if (!saveMessages()) {
    replaceMessages(
      backup
    );

    return false;
  }

  return true;
}

export function exportMessages() {
  return chatMessages.map(
    function (message) {
      return {
        ...message
      };
    }
  );
}

export function importMessages(
  messageData
) {
  const normalizedMessages =
    normalizeMessageArray(
      messageData
    );

  replaceMessages(
    normalizedMessages
  );

  return saveMessages();
}
