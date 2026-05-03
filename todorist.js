const titleInput = document.getElementById("titleInput");
const descriptionInput = document.getElementById("descriptionInput");
const deadlineInput = document.getElementById("deadlineInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const errorMessage = document.getElementById("errorMessage");
const calendarArea = document.getElementById("calendarArea");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.sort(function (a, b) {
    return new Date(a.deadline) - new Date(b.deadline);
  });

  tasks.forEach(function (task) {
    const li = document.createElement("li");
    li.classList.add("task-item");

    const textSpan = document.createElement("span");
    textSpan.textContent = task.title + "（" + task.deadline + "）";

    if (task.completed) {
      textSpan.style.textDecoration = "line-through";
    }

    const completeBtn = document.createElement("button");

    if (task.completed) {
      completeBtn.textContent = "未完了";
    } else {
      completeBtn.textContent = "完了";
    }

    completeBtn.addEventListener("click", function () {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
      renderCalendar();
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
      renderTasks();
      renderCalendar();
    });

    li.appendChild(textSpan);
    li.appendChild(completeBtn);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);
  });
}

function renderCalendar() {
  calendarArea.innerHTML = "";

  const groupedTasks = {};

  tasks.forEach(function (task) {
    if (!groupedTasks[task.deadline]) {
      groupedTasks[task.deadline] = [];
    }

    groupedTasks[task.deadline].push(task);
  });

  const dates = Object.keys(groupedTasks).sort();

  dates.forEach(function (date) {
    const dateBox = document.createElement("div");

    const dateTitle = document.createElement("h3");
    dateTitle.textContent = date;

    const ul = document.createElement("ul");

    groupedTasks[date].forEach(function (task) {
      const li = document.createElement("li");
      li.textContent = task.title;

      if (task.completed) {
        li.style.textDecoration = "line-through";
      }

      ul.appendChild(li);
    });

    dateBox.appendChild(dateTitle);
    dateBox.appendChild(ul);
    calendarArea.appendChild(dateBox);
  });
}

addBtn.addEventListener("click", function () {
  const title = titleInput.value;
  const description = descriptionInput.value;
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
    deadline: deadline,
    completed: false
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  renderCalendar();

  titleInput.value = "";
  descriptionInput.value = "";
  deadlineInput.value = "";
});

renderTasks();
renderCalendar();