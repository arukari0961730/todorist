import {
  isTaskExpired
} from "./filters.js";

const allCount = document.getElementById("allCount");
const todoCount = document.getElementById("todoCount");
const workingCount = document.getElementById("workingCount");
const reviewCount = document.getElementById("reviewCount");
const fixCount = document.getElementById("fixCount");
const doneCount = document.getElementById("doneCount");
const expiredCount = document.getElementById("expiredCount");

const allCard = document.getElementById("allCard");
const todoCard = document.getElementById("todoCard");
const workingCard = document.getElementById("workingCard");
const reviewCard = document.getElementById("reviewCard");
const fixCard = document.getElementById("fixCard");
const doneCard = document.getElementById("doneCard");
const expiredCard = document.getElementById("expiredCard");

export function renderDashboard(tasks) {
  allCount.textContent = tasks.length;

  todoCount.textContent = tasks.filter(function (task) {
    return task.status === "todo";
  }).length;

  workingCount.textContent = tasks.filter(function (task) {
    return task.status === "working";
  }).length;

  reviewCount.textContent = tasks.filter(function (task) {
    return task.status === "review";
  }).length;

  fixCount.textContent = tasks.filter(function (task) {
    return task.status === "fix";
  }).length;

  doneCount.textContent = tasks.filter(function (task) {
    return task.status === "done";
  }).length;

  expiredCount.textContent = tasks.filter(function (task) {
    return isTaskExpired(task);
  }).length;
}

export function setupDashboard(onFilterChange) {
  allCard.addEventListener("click", function () {
    onFilterChange({
      status: "all",
      assignee: "all",
      deadline: "all"
    });
  });

  todoCard.addEventListener("click", function () {
    onFilterChange({
      status: "todo",
      deadline: "all"
    });
  });

  workingCard.addEventListener("click", function () {
    onFilterChange({
      status: "working",
      deadline: "all"
    });
  });

  reviewCard.addEventListener("click", function () {
    onFilterChange({
      status: "review",
      deadline: "all"
    });
  });

  fixCard.addEventListener("click", function () {
    onFilterChange({
      status: "fix",
      deadline: "all"
    });
  });

  doneCard.addEventListener("click", function () {
    onFilterChange({
      status: "done",
      deadline: "all"
    });
  });

  expiredCard.addEventListener("click", function () {
    onFilterChange({
      status: "all",
      deadline: "expired"
    });
  });
}