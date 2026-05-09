const titleInput = document.getElementById("titleInput");
const descriptionInput = document.getElementById("descriptionInput");
const assigneeInput = document.getElementById("assigneeInput");
const deadlineInput = document.getElementById("deadlineInput");
const addBtn = document.getElementById("addBtn");
const errorMessage = document.getElementById("errorMessage");

const calendarTableArea = document.getElementById("calendarTableArea");
const monthTitle = document.getElementById("monthTitle");
const prevBtn = document.getElementById("prevBtn");
const todayBtn = document.getElementById("todayBtn");
const nextBtn = document.getElementById("nextBtn");
const taskDetail = document.getElementById("taskDetail");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let viewDate = new Date();

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

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

  const completeBtn = document.createElement("button");
  completeBtn.textContent = task.completed ? "未完了に戻す" : "完了にする";

  completeBtn.addEventListener("click", function () {
    task.completed = !task.completed;
    saveTasks();
    renderCalendar();
    renderTaskDetail(task);
  });

  const editBtn = document.createElement("button");
  editBtn.textContent = "編集";

  editBtn.addEventListener("click", function () {
    renderEditForm(task);
  });

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

function renderEditForm(task) {
  taskDetail.innerHTML = "";

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

    viewDate = new Date(task.deadline);
    renderCalendar();
    renderTaskDetail(task);
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "キャンセル";

  cancelBtn.addEventListener("click", function () {
    renderTaskDetail(task);
  });

  taskDetail.appendChild(titleLabel);
  taskDetail.appendChild(titleEdit);
  taskDetail.appendChild(descriptionLabel);
  taskDetail.appendChild(descriptionEdit);
  taskDetail.appendChild(assigneeLabel);
  taskDetail.appendChild(assigneeEdit);
  taskDetail.appendChild(deadlineLabel);
  taskDetail.appendChild(deadlineEdit);
  taskDetail.appendChild(saveBtn);
  taskDetail.appendChild(cancelBtn);
}

function renderCalendar() {
  calendarTableArea.innerHTML = "";

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  monthTitle.textContent = `${year}年${month + 1}月`;

  const calendarTable = document.createElement("table");

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

        if (dateString === todayString) {
          td.classList.add("today");
        }

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

  viewDate = new Date(deadline);
  renderCalendar();

  titleInput.value = "";
  descriptionInput.value = "";
  assigneeInput.value = "";
  deadlineInput.value = "";
});

prevBtn.addEventListener("click", function () {
  viewDate.setMonth(viewDate.getMonth() - 1);
  renderCalendar();
});

todayBtn.addEventListener("click", function () {
  viewDate = new Date();
  renderCalendar();
});

nextBtn.addEventListener("click", function () {
  viewDate.setMonth(viewDate.getMonth() + 1);
  renderCalendar();
});

renderCalendar();