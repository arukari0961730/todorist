// 入力フォームの要素を取得
const titleInput = document.getElementById("titleInput");
const descriptionInput = document.getElementById("descriptionInput");
const assigneeInput = document.getElementById("assigneeInput");
const deadlineInput = document.getElementById("deadlineInput");
const addBtn = document.getElementById("addBtn");
const errorMessage = document.getElementById("errorMessage");

// カレンダー操作に必要な要素を取得
const calendarTableArea = document.getElementById("calendarTableArea");
const monthTitle = document.getElementById("monthTitle");
const prevBtn = document.getElementById("prevBtn");
const todayBtn = document.getElementById("todayBtn");
const nextBtn = document.getElementById("nextBtn");
const taskDetail = document.getElementById("taskDetail");

// 編集モーダルの要素を取得
const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");

// localStorageから保存済み課題を読み込む
// 保存データがなければ空配列にする
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// 現在表示しているカレンダーの年月
let viewDate = new Date();

// tasks配列をlocalStorageに保存する関数
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// 今日の日付を「YYYY-MM-DD」形式で取得する関数
function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

// モーダルを閉じる関数
function closeModal() {
  modalOverlay.classList.add("hidden");
}

// 黒い背景部分をクリックしたらモーダルを閉じる
modalOverlay.addEventListener("click", function (event) {
  if (event.target === modalOverlay) {
    closeModal();
  }
});

// 選択した課題の詳細を右側パネルに表示する関数
function renderTaskDetail(task) {
  taskDetail.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = task.title;

  const description = document.createElement("p");
  description.textContent =
    task.description === "" ? "詳細：なし" : "詳細：" + task.description;

  const assignee = document.createElement("p");
  assignee.textContent =
    !task.assignee ? "担当者：未設定" : "担当者：" + task.assignee;

  const createdAt = document.createElement("p");
  createdAt.textContent = "追加日：" + task.createdAt;

  const deadline = document.createElement("p");
  deadline.textContent = "締切日：" + task.deadline;

  const status = document.createElement("p");
  status.textContent = task.completed ? "状態：完了" : "状態：未完了";

  // 完了・未完了を切り替えるボタン
  const completeBtn = document.createElement("button");
  completeBtn.textContent = task.completed ? "未完了に戻す" : "完了にする";

  completeBtn.addEventListener("click", function () {
    task.completed = !task.completed;

    saveTasks();
    renderCalendar();
    renderTaskDetail(task);
  });

  // 編集モーダルを開くボタン
  const editBtn = document.createElement("button");
  editBtn.textContent = "編集";

  editBtn.addEventListener("click", function () {
    renderEditForm(task);
  });

  // 課題を削除するボタン
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "削除";

  deleteBtn.addEventListener("click", function () {
    const ok = confirm("この課題を削除しますか？");
    if (!ok) return;

    tasks = tasks.filter(function (t) {
      return t.id !== task.id;
    });

    saveTasks();
    renderCalendar();

    taskDetail.innerHTML = "<p>課題を選択してください</p>";
  });

  taskDetail.appendChild(title);
  taskDetail.appendChild(description);
  taskDetail.appendChild(assignee);
  taskDetail.appendChild(createdAt);
  taskDetail.appendChild(deadline);
  taskDetail.appendChild(status);
  taskDetail.appendChild(completeBtn);
  taskDetail.appendChild(editBtn);
  taskDetail.appendChild(deleteBtn);
}

// 課題編集用のモーダルを表示する関数
function renderEditForm(task) {
  modalOverlay.classList.remove("hidden");
  modalContent.innerHTML = "";

  const titleLabel = document.createElement("label");
  titleLabel.textContent = "課題名";

  const titleEdit = document.createElement("input");
  titleEdit.classList.add("edit-input");
  titleEdit.value = task.title;

  const descriptionLabel = document.createElement("label");
  descriptionLabel.textContent = "詳細";

  const descriptionEdit = document.createElement("textarea");
  descriptionEdit.classList.add("edit-textarea");
  descriptionEdit.value = task.description;

  const assigneeLabel = document.createElement("label");
  assigneeLabel.textContent = "担当者";

  const assigneeEdit = document.createElement("input");
  assigneeEdit.classList.add("edit-input");
  assigneeEdit.value = task.assignee || "";

  const deadlineLabel = document.createElement("label");
  deadlineLabel.textContent = "締切日";

  const deadlineEdit = document.createElement("input");
  deadlineEdit.classList.add("edit-input");
  deadlineEdit.type = "date";
  deadlineEdit.value = task.deadline;

  // 編集内容を保存するボタン
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "保存";

  saveBtn.addEventListener("click", function () {
    if (titleEdit.value === "" || deadlineEdit.value === "") {
      alert("課題名と締切日は必須です");
      return;
    }

    task.title = titleEdit.value;
    task.description = descriptionEdit.value;
    task.assignee = assigneeEdit.value;
    task.deadline = deadlineEdit.value;

    saveTasks();

    // 編集後の締切月を表示する
    viewDate = new Date(task.deadline);

    renderCalendar();
    renderTaskDetail(task);
    closeModal();
  });

  // 編集をやめてモーダルを閉じるボタン
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "キャンセル";

  cancelBtn.addEventListener("click", function () {
    closeModal();
  });

  modalContent.appendChild(titleLabel);
  modalContent.appendChild(titleEdit);
  modalContent.appendChild(descriptionLabel);
  modalContent.appendChild(descriptionEdit);
  modalContent.appendChild(assigneeLabel);
  modalContent.appendChild(assigneeEdit);
  modalContent.appendChild(deadlineLabel);
  modalContent.appendChild(deadlineEdit);
  modalContent.appendChild(saveBtn);
  modalContent.appendChild(cancelBtn);
}

// カレンダー全体を描画する関数
function renderCalendar() {
  calendarTableArea.innerHTML = "";

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  monthTitle.textContent = `${year}年${month + 1}月`;

  const calendarTable = document.createElement("table");

  // 曜日行を作成
  const headerRow = document.createElement("tr");
  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  weekDays.forEach(function (day) {
    const th = document.createElement("th");
    th.textContent = day;
    headerRow.appendChild(th);
  });

  calendarTable.appendChild(headerRow);

  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);

  const firstDay = firstDate.getDay();
  const lastDay = lastDate.getDate();

  let dateCount = 1;

  // 最大6週間分のカレンダー行を作る
  for (let week = 0; week < 6; week++) {
    const tr = document.createElement("tr");

    for (let day = 0; day < 7; day++) {
      const td = document.createElement("td");

      if (week === 0 && day < firstDay) {
        td.textContent = "";
      } else if (dateCount > lastDay) {
        td.textContent = "";
      } else {
        const dateText = document.createElement("div");
        dateText.classList.add("date-number");
        dateText.textContent = dateCount;
        td.appendChild(dateText);

        const dateString =
          year +
          "-" +
          String(month + 1).padStart(2, "0") +
          "-" +
          String(dateCount).padStart(2, "0");

        const todayString = getTodayString();

        // 今日の日付を強調表示
        if (dateString === todayString) {
          td.classList.add("today");
        }

        // 課題の期間内ならカレンダーに表示
        tasks.forEach(function (task) {
          if (!task.createdAt) {
            task.createdAt = task.deadline;
          }

          if (task.assignee === undefined) {
            task.assignee = "";
          }

          if (dateString >= task.createdAt && dateString <= task.deadline) {
            const taskBtn = document.createElement("button");
            taskBtn.classList.add("calendar-task-btn");

            let label = "";

            if (dateString === task.createdAt && dateString === task.deadline) {
              label = task.title + " 〆";
            } else if (dateString === task.createdAt) {
              label = task.title;
            } else if (dateString === task.deadline) {
              label = "〆 " + task.title;
            }

            if (label === "") {
              taskBtn.textContent = "";
              taskBtn.classList.add("task-bar-only");
            } else {
              taskBtn.textContent = label;
            }

            if (task.completed) {
              taskBtn.classList.add("completed");
            }

            taskBtn.addEventListener("click", function () {
              renderTaskDetail(task);
            });

            td.appendChild(taskBtn);
          }
        });

        dateCount++;
      }

      tr.appendChild(td);
    }

    calendarTable.appendChild(tr);

    if (dateCount > lastDay) {
      break;
    }
  }

  calendarTableArea.appendChild(calendarTable);
}

// 追加ボタンを押したとき、新しい課題を作成する
addBtn.addEventListener("click", function () {
  const title = titleInput.value;
  const description = descriptionInput.value;
  const assignee = assigneeInput.value;
  const deadline = deadlineInput.value;

  if (title === "" || deadline === "") {
    errorMessage.textContent = "課題名と締切日は必須です";
    return;
  }

  errorMessage.textContent = "";

  const task = {
    id: Date.now(),
    title: title,
    description: description,
    assignee: assignee,
    createdAt: getTodayString(),
    deadline: deadline,
    completed: false
  };

  tasks.push(task);
  saveTasks();

  // 追加した課題の締切月を表示する
  viewDate = new Date(deadline);
  renderCalendar();

  titleInput.value = "";
  descriptionInput.value = "";
  assigneeInput.value = "";
  deadlineInput.value = "";
});

// 前の月を表示
prevBtn.addEventListener("click", function () {
  viewDate.setMonth(viewDate.getMonth() - 1);
  renderCalendar();
});

// 今日の月に戻る
todayBtn.addEventListener("click", function () {
  viewDate = new Date();
  renderCalendar();
});

// 次の月を表示
nextBtn.addEventListener("click", function () {
  viewDate.setMonth(viewDate.getMonth() + 1);
  renderCalendar();
});

// ページを開いたときに最初のカレンダーを表示
renderCalendar();