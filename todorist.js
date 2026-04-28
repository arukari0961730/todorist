const titleInput = document.getElementById("titleInput");
const descriptionInput = document.getElementById("descriptionInput");
const deadlineInput = document.getElementById("deadlineInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const errorMessage = document.getElementById("errorMessage");
const tasks = [];
addBtn.addEventListener("click", function () {
  const title = titleInput.value;
  const description = descriptionInput.value;
  const deadline = deadlineInput.value;

  if(title === "" || deadline === ""){
    errorMessage.textContent="課題名と締切日は必須です"
    return;
  }

  errorMessage.textContent="";

  const task = {
    id: Date.now(),
    title: title,
    description: description,
    deadline: deadline,
    completed: false
  };

  tasks.push(task);

  const li = document.createElement("li");
  li.textContent = title + "(" + deadline +")";

  taskList.appendChild(li);

  console.log(tasks);
  titleInput.value = "";
descriptionInput.value = "";
deadlineInput.value = "";
});